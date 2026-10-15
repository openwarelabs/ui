import {
    Children,
    createContext,
    Fragment,
    isValidElement,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    type KeyboardEvent,
    type PointerEvent,
    type ReactElement,
    type ReactNode,
} from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";
import { initialSizes, isCollapsed, moveHandle, normalise } from "./Splitter.layout";
import type {
    SplitterHandleProps,
    SplitterPanelLimits,
    SplitterPanelProps,
    SplitterProps,
    SplitterState,
} from "./Splitter.types";

export type { SplitterDirection, SplitterHandleProps, SplitterPanelProps, SplitterProps } from "./Splitter.types";

const SplitterContext = createContext<SplitterState | null>(null);
/** The panel's or handle's place among its splitter's panels; a handle's is the panel before it. */
const IndexContext = createContext(-1);

const storageKey = (id: string) => `ow-splitter:${id}`;

/** The panels and handles straight inside, with fragments opened up, in order, each with a key of its own. */
function flatten(children: ReactNode, prefix = ""): Array<[string, ReactElement]> {
    return Children.toArray(children).flatMap((child): Array<[string, ReactElement]> => {
        if (!isValidElement<{ children?: ReactNode }>(child)) return [];
        const key = prefix + String(child.key);
        return child.type === Fragment ? flatten(child.props.children, key) : [[key, child]];
    });
}

function readSaved(id: string, count: number): number[] | null {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(storageKey(id)) ?? "null");
        if (Array.isArray(saved) && saved.length === count && saved.every((size) => typeof size === "number" && size >= 0)) {
            return normalise(saved as number[]);
        }
    } catch {
        // Storage can be blocked or hold something else; the defaults do.
    }
    return null;
}

/**
 * Lays panels side by side, or stacked, with a handle between each pair to drag them bigger or smaller. Sizes are
 * percentages. Handles move with the arrow keys too, and a collapsible panel folds away with Enter or a double-click.
 */
export function Splitter({
    children,
    direction = "horizontal",
    sizes,
    defaultSizes,
    onSizesChange,
    autoSaveId,
    className,
    ...props
}: SplitterProps) {
    const baseId = useId();
    const groupRef = useRef<HTMLDivElement>(null);
    const items = flatten(children);
    const panels = items.map(([, item]) => item).filter((item) => item.type === SplitterPanel) as Array<ReactElement<SplitterPanelProps>>;
    const count = panels.length;

    const limits: SplitterPanelLimits[] = panels.map(({ props: panel }) => ({
        minSize: panel.minSize ?? 0,
        maxSize: panel.maxSize ?? 100,
        collapsible: panel.collapsible ?? false,
        collapsedSize: panel.collapsedSize ?? 0,
    }));
    const panelIds = panels.map((panel, index) => panel.props.id ?? `${baseId}-panel-${index}`);
    const defaults = panels.map((panel) => panel.props.defaultSize);

    const [ownSizes, setSizes] = useControllableState<number[]>(
        sizes,
        defaultSizes && defaultSizes.length === count ? normalise(defaultSizes) : initialSizes(defaults),
        onSizesChange,
    );
    // When panels come and go, start them again from their defaults.
    const current = ownSizes.length === count ? ownSizes : initialSizes(defaults);

    const latest = useRef({ sizes: current, limits, panels });
    latest.current = { sizes: current, limits, panels };

    // Put saved sizes back before the first paint, on the browser only, so a server render matches.
    useLayoutEffect(() => {
        if (!autoSaveId) return;
        const saved = readSaved(autoSaveId, latest.current.sizes.length);
        if (saved) setSizes(saved);
    }, [autoSaveId, setSizes]);

    // The size each panel had before it collapsed, to expand it back to.
    const expanded = useRef<number[]>([]);
    const previous = useRef<number[] | null>(null);
    const key = current.join(",");
    useEffect(() => {
        const { sizes: now, limits: panelLimits, panels: panelElements } = latest.current;
        const before = previous.current;
        previous.current = now;
        now.forEach((size, index) => {
            const folded = isCollapsed(panelLimits[index]!, size);
            if (!folded) expanded.current[index] = size;
            if (!before || before.length !== now.length || Math.abs(before[index]! - size) < 0.001) return;
            const panel = panelElements[index]!.props;
            panel.onResize?.(size);
            if (folded !== isCollapsed(panelLimits[index]!, before[index]!)) panel.onCollapsedChange?.(folded);
        });
        if (!before || !autoSaveId) return;
        try {
            localStorage.setItem(storageKey(autoSaveId), JSON.stringify(now.map((size) => Math.round(size * 100) / 100)));
        } catch {
            // Full or blocked storage only means the sizes aren't remembered.
        }
    }, [key, autoSaveId]);

    const move = useCallback(
        (handle: number, delta: number, snap: boolean, from?: number[]) => {
            const { sizes: now, limits: panelLimits } = latest.current;
            const next = moveHandle(from ?? now, panelLimits, handle, delta, snap);
            if (next.some((size, index) => Math.abs(size - now[index]!) > 0.0001)) setSizes(next);
        },
        [setSizes],
    );

    const toggle = useCallback(
        (handle: number) => {
            const { sizes: now, limits: panelLimits, panels: panelElements } = latest.current;
            const target = panelLimits[handle]?.collapsible ? handle : panelLimits[handle + 1]?.collapsible ? handle + 1 : -1;
            const panel = panelLimits[target];
            if (!panel) return;
            const size = now[target]!;
            const restore = Math.max(panel.minSize, expanded.current[target] ?? panelElements[target]!.props.defaultSize ?? panel.minSize);
            const delta = (isCollapsed(panel, size) ? restore : panel.collapsedSize) - size;
            move(handle, target === handle ? delta : -delta, true);
        },
        [move],
    );

    const measure = useCallback(() => {
        const group = groupRef.current;
        if (!group) return { length: 0, reversed: false };
        const horizontal = direction === "horizontal";
        let length = 0;
        for (const child of Array.from(group.children)) {
            if (!child.classList.contains("ow-splitter__panel")) continue;
            const box = child.getBoundingClientRect();
            length += horizontal ? box.width : box.height;
        }
        return { length, reversed: horizontal && getComputedStyle(group).direction === "rtl" };
    }, [direction]);

    const state: SplitterState = { direction, sizes: current, limits, panelIds, move, toggle, measure };

    let panelIndex = -1;
    return (
        <div
            ref={groupRef}
            className={cx("ow-splitter", `ow-splitter--${direction}`, className)}
            data-direction={direction}
            {...props}
        >
            <SplitterContext.Provider value={state}>
                {items.map(([itemKey, item]) => {
                    if (item.type === SplitterPanel) panelIndex++;
                    return (
                        <IndexContext.Provider key={itemKey} value={panelIndex}>
                            {item}
                        </IndexContext.Provider>
                    );
                })}
            </SplitterContext.Provider>
        </div>
    );
}

function useSplitter(part: string): [SplitterState, number] {
    const splitter = useContext(SplitterContext);
    const index = useContext(IndexContext);
    if (!splitter) throw new Error(`${part} goes straight inside a Splitter.`);
    return [splitter, index];
}

/** One of a Splitter's panels. Give it a `defaultSize`, and limits with `minSize` and `maxSize`. */
export function SplitterPanel({
    defaultSize: _defaultSize,
    minSize: _minSize,
    maxSize: _maxSize,
    collapsible: _collapsible,
    collapsedSize: _collapsedSize,
    onResize: _onResize,
    onCollapsedChange: _onCollapsedChange,
    className,
    style,
    ...props
}: SplitterPanelProps) {
    const [splitter, index] = useSplitter("SplitterPanel");
    const size = splitter.sizes[index] ?? 0;
    const limits = splitter.limits[index];
    const collapsed = limits ? isCollapsed(limits, size) : false;
    return (
        <div
            {...props}
            id={splitter.panelIds[index]}
            className={cx("ow-splitter__panel", className)}
            data-collapsed={collapsed ? (size > 0 ? "" : "hidden") : undefined}
            style={{ flexGrow: size, ...style }}
        />
    );
}

const keySteps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 };

/**
 * The line between two panels. Drag it, or focus it and use the arrow keys (Shift for bigger steps), Home and End.
 * Enter or a double-click collapses a collapsible panel beside it, and expands it again.
 */
export function SplitterHandle({
    "aria-label": ariaLabel = "Resize panels",
    grip = false,
    disabled = false,
    className,
    onPointerDown,
    onKeyDown,
    onDoubleClick,
    ...props
}: SplitterHandleProps) {
    const [splitter, handle] = useSplitter("SplitterHandle");
    const drag = useRef<{ pointer: number; at: number; sizes: number[]; length: number; reversed: boolean } | null>(null);
    const horizontal = splitter.direction === "horizontal";
    const limits = splitter.limits[handle];
    const size = splitter.sizes[handle] ?? 0;
    if (!limits || handle >= splitter.limits.length - 1) return null;

    const end = () => {
        drag.current = null;
        delete document.documentElement.dataset.owSplitterDrag;
    };

    return (
        <div
            role="separator"
            tabIndex={disabled ? undefined : 0}
            aria-label={ariaLabel}
            aria-orientation={horizontal ? "vertical" : "horizontal"}
            aria-valuenow={Math.round(size)}
            aria-valuemin={Math.round(limits.collapsible ? Math.min(limits.collapsedSize, limits.minSize) : limits.minSize)}
            aria-valuemax={Math.round(limits.maxSize)}
            aria-controls={splitter.panelIds[handle]}
            aria-disabled={disabled || undefined}
            className={cx("ow-splitter__handle", grip && "ow-splitter__handle--grip", className)}
            {...props}
            onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
                onPointerDown?.(event);
                if (disabled || event.defaultPrevented || event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.focus({ preventScroll: true });
                try {
                    event.currentTarget.setPointerCapture(event.pointerId);
                } catch {
                    // Without capture the drag still follows the pointer while it's over the handle.
                }
                const { length, reversed } = splitter.measure();
                drag.current = { pointer: event.pointerId, at: horizontal ? event.clientX : event.clientY, sizes: splitter.sizes, length, reversed };
                event.currentTarget.dataset.dragging = "";
                document.documentElement.dataset.owSplitterDrag = splitter.direction;
            }}
            onPointerMove={(event) => {
                const start = drag.current;
                if (!start || start.pointer !== event.pointerId || !start.length) return;
                const moved = (horizontal ? event.clientX : event.clientY) - start.at;
                splitter.move(handle, ((start.reversed ? -moved : moved) / start.length) * 100, true, start.sizes);
            }}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={(event) => {
                delete event.currentTarget.dataset.dragging;
                end();
            }}
            onDoubleClick={(event) => {
                onDoubleClick?.(event);
                if (!disabled) splitter.toggle(handle);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                onKeyDown?.(event);
                if (disabled || event.defaultPrevented) return;
                const along = horizontal ? event.key === "ArrowLeft" || event.key === "ArrowRight" : event.key === "ArrowUp" || event.key === "ArrowDown";
                let delta: number | null = null;
                if (along) {
                    const reversed = horizontal && getComputedStyle(event.currentTarget).direction === "rtl";
                    delta = keySteps[event.key]! * (event.shiftKey ? 10 : 1) * (reversed ? -1 : 1);
                } else if (event.key === "Home") delta = limits.minSize - size;
                else if (event.key === "End") delta = limits.maxSize - size;
                else if (event.key === "Enter") {
                    event.preventDefault();
                    splitter.toggle(handle);
                    return;
                }
                if (delta === null) return;
                event.preventDefault();
                splitter.move(handle, delta, false);
            }}
        />
    );
}
