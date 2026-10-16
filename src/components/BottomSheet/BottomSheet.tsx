import {
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { useModalDialog } from "@/hooks/useModalDialog";
import { cx } from "@/utils/cx";
import { CloseButton } from "@/components/Button/ButtonGroup";
import type { BottomSheetProps, BottomSheetSnapPoint } from "./BottomSheet.types";

export type { BottomSheetLabels, BottomSheetProps, BottomSheetSnapPoint } from "./BottomSheet.types";

const defaultLabels = {
    handle: "Resize sheet",
    snapChanged: (index: number, total: number, percent: number) =>
        `Sheet height ${index + 1} of ${total}, ${percent}% of the screen.`,
};

/** Matches the exit transition in BottomSheet.css. */
const closeAnimationMs = 160;
/** The tallest a sheet gets: the page behind must stay visible above it. */
const maxShare = 0.9;
/** A swipe faster than this (pixels per millisecond) carries on to the next snap point in its direction. */
const flick = 0.4;
const defaultSnapPoints: BottomSheetSnapPoint[] = ["content"];

/** The height of one snap point in pixels, within the screen. `content` is measured by the caller. */
function resolveSnap(point: BottomSheetSnapPoint, screen: number, content: number) {
    const max = Math.round(screen * maxShare);
    if (point === "content") return Math.min(content, max);
    if (typeof point === "number") return Math.min(Math.max(0, point), max);
    const percent = Number.parseFloat(point);
    return Number.isFinite(percent) ? Math.min(Math.round((screen * percent) / 100), max) : max;
}

/** Index of the snap point whose height is nearest `height`. */
function nearest(heights: number[], height: number) {
    let best = 0;
    for (let index = 1; index < heights.length; index += 1) {
        if (Math.abs(heights[index]! - height) < Math.abs(heights[best]! - height)) best = index;
    }
    return best;
}

/** Index of the next snap point above (`direction` 1) or below (-1) the one at `from`, by height; -1 when none. */
function neighbour(heights: number[], from: number, direction: 1 | -1) {
    const current = heights[from] ?? 0;
    let found = -1;
    heights.forEach((height, index) => {
        if (direction === 1 ? height <= current : height >= current) return;
        if (found === -1 || (direction === 1 ? height < heights[found]! : height > heights[found]!)) found = index;
    });
    return found;
}

/**
 * A sheet that slides up from the bottom of the screen and rests at one or more heights (snap points). Drag its
 * handle or header to move between them or flick it down to close; the arrow keys do the same from the handle.
 * Modal by default, like Dialog; `modal={false}` leaves the page behind it usable.
 */
export function BottomSheet({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    snapPoints = defaultSnapPoints,
    defaultSnap = 0,
    snap,
    onSnapChange,
    dismissible = true,
    modal = true,
    handle = true,
    labels,
    className,
}: BottomSheetProps) {
    const titleId = useId();
    const descriptionId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;
    const close = useCallback(() => {
        if (dismissible) onCloseRef.current();
    }, [dismissible]);

    // The modal case opens through useModalDialog, which also turns Escape and a backdrop click into `close`.
    // A non-modal sheet shows itself and keeps itself mounted through its exit animation here.
    const { dialogRef, mounted: modalMounted } = useModalDialog(modal && open, close);
    const [plainMounted, setPlainMounted] = useState(!modal && open);
    useEffect(() => {
        if (modal) return;
        if (open) {
            setPlainMounted(true);
            return;
        }
        const dialog = dialogRef.current;
        if (dialog?.open) dialog.close();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const timer = window.setTimeout(() => setPlainMounted(false), reduceMotion ? 0 : closeAnimationMs);
        return () => window.clearTimeout(timer);
    }, [open, modal, dialogRef]);
    const mounted = modal ? modalMounted : plainMounted;

    const [active, setActive] = useControllableState(snap, defaultSnap, onSnapChange);
    const [heights, setHeights] = useState<number[] | null>(null);
    const [dragging, setDragging] = useState(false);
    const [scrolls, setScrolls] = useState(false);
    const [announcement, setAnnouncement] = useState("");

    // The snap points as one string, so a new array with the same values doesn't measure again.
    const key = snapPoints.join("|");
    const points = useMemo(
        () => key.split("|").map((point): BottomSheetSnapPoint => (/^\d+(\.\d+)?$/.test(point) ? Number(point) : point)),
        [key],
    );
    const measure = useCallback(() => {
        const panel = panelRef.current;
        const inner = contentRef.current;
        if (!panel || !inner) return;
        const screen = window.innerHeight;
        // The body's own height is whatever the panel leaves it, so its content is measured instead.
        let content = 0;
        for (const child of Array.from(panel.children) as HTMLElement[]) {
            content += child.classList.contains("ow-bottom-sheet__body") ? inner.offsetHeight : child.offsetHeight;
        }
        const next = points.map((point) => resolveSnap(point, screen, content));
        setHeights((previous) =>
            previous && previous.length === next.length && previous.every((height, index) => height === next[index])
                ? previous
                : next,
        );
    }, [points]);

    // Show the sheet and measure it before the first paint, so it opens straight to its snap point.
    useLayoutEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !mounted || !open) return;
        if (!dialog.open) {
            if (modal) dialog.showModal();
            else dialog.show();
        }
        measure();
    }, [mounted, open, modal, measure, dialogRef]);

    useEffect(() => {
        if (!mounted) return;
        const content = contentRef.current;
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
        if (content && observer) observer.observe(content);
        window.addEventListener("resize", measure);
        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [mounted, measure]);

    // Nothing in a closing sheet can be tabbed to or read out while it slides away.
    useEffect(() => {
        if (dialogRef.current) dialogRef.current.inert = mounted && !open;
    }, [mounted, open, dialogRef]);

    const total = snapPoints.length;
    const index = Math.min(Math.max(0, active), total - 1);
    const visible = heights?.[index] ?? 0;
    const tallest = heights ? Math.max(0, ...heights) : 0;

    // A body that scrolls is a Tab stop, so the keyboard can scroll it when nothing in it takes focus.
    useEffect(() => {
        const body = contentRef.current?.parentElement;
        if (!body || !mounted) return;
        const check = () => setScrolls(body.scrollHeight > body.clientHeight + 1);
        check();
        const timer = window.setTimeout(check, 400);
        return () => window.clearTimeout(timer);
    }, [mounted, visible, heights]);

    const moveTo = useCallback(
        (next: number) => {
            if (next === index || !heights) return;
            setActive(next);
            const percent = Math.round((heights[next]! / window.innerHeight) * 100);
            setAnnouncement((labels?.snapChanged ?? defaultLabels.snapChanged)(next, total, percent));
        },
        [index, heights, setActive, total, labels],
    );

    useEffect(() => {
        if (!open) setAnnouncement("");
    }, [open]);

    const drag = useRef<{ pointerId: number; startY: number; startHeight: number; lastY: number; lastTime: number; velocity: number } | null>(null);

    const applyHeight = (height: number) => {
        const dialog = dialogRef.current;
        const panel = panelRef.current;
        if (!dialog || !panel) return;
        dialog.style.transform = `translateY(${Math.max(0, tallest - height)}px)`;
        panel.style.height = `${Math.min(height, tallest)}px`;
    };

    const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
        if (!heights || event.button !== 0) return;
        // The ✕ and anything else clickable in the header keep their clicks.
        const target = event.target as HTMLElement;
        if (target.closest("button,a,input,select,textarea") && !target.closest(".ow-bottom-sheet__handle")) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
            pointerId: event.pointerId,
            startY: event.clientY,
            startHeight: visible,
            lastY: event.clientY,
            lastTime: event.timeStamp,
            velocity: 0,
        };
        setDragging(true);
    };

    const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
        const state = drag.current;
        if (!state || state.pointerId !== event.pointerId) return;
        const dt = event.timeStamp - state.lastTime;
        if (dt > 0) state.velocity = (event.clientY - state.lastY) / dt;
        state.lastY = event.clientY;
        state.lastTime = event.timeStamp;
        const height = state.startHeight - (event.clientY - state.startY);
        applyHeight(height);
    };

    const endDrag = (event: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
        const state = drag.current;
        if (!state || state.pointerId !== event.pointerId || !heights) return;
        drag.current = null;
        setDragging(false);
        const dialog = dialogRef.current;
        const panel = panelRef.current;
        if (dialog) dialog.style.transform = "";
        if (panel) panel.style.height = "";
        if (cancelled) return;
        const height = state.startHeight - (event.clientY - state.startY);
        const lowest = Math.min(...heights);
        // Flicked: carry on to the next snap point in that direction; past the lowest one, close.
        if (Math.abs(state.velocity) > flick) {
            const downwards = state.velocity > 0;
            const from = nearest(heights, height);
            const next = neighbour(heights, from, downwards ? -1 : 1);
            if (next !== -1 && (downwards ? heights[next]! < height : heights[next]! > height)) return moveTo(next);
            if (downwards && dismissible && height <= heights[from]!) return onClose();
            return moveTo(from);
        }
        // Let go below the lowest snap point by more than a third of it: close.
        if (dismissible && height < lowest - Math.max(40, lowest / 3)) return onClose();
        moveTo(nearest(heights, height));
    };

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (!heights) return;
        let next = -1;
        if (event.key === "ArrowUp") next = neighbour(heights, index, 1);
        else if (event.key === "ArrowDown") next = neighbour(heights, index, -1);
        else if (event.key === "Home") next = heights.indexOf(Math.min(...heights));
        else if (event.key === "End") next = heights.indexOf(Math.max(...heights));
        else return;
        event.preventDefault();
        if (next !== -1) moveTo(next);
    };

    const onDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
        // A modal dialog turns Escape into a cancel event that useModalDialog handles; a plain one doesn't.
        if (!modal && event.key === "Escape") {
            event.preventDefault();
            close();
        }
    };

    if (!mounted) return null;

    const style = heights
        ? { "--ow-bottom-sheet-height": `${tallest}px`, "--ow-bottom-sheet-visible": `${visible}px` }
        : undefined;

    return (
        <dialog
            ref={dialogRef}
            className={cx(
                "ow-bottom-sheet",
                !modal && "ow-bottom-sheet--plain",
                dragging && "ow-bottom-sheet--dragging",
                heights && "ow-bottom-sheet--measured",
                className,
            )}
            style={style as CSSProperties | undefined}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            onKeyDown={onDialogKeyDown}
        >
            <div ref={panelRef} className="ow-bottom-sheet__panel">
                {handle ? (
                    <div
                        className="ow-bottom-sheet__grip"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={(event) => endDrag(event, false)}
                        onPointerCancel={(event) => endDrag(event, true)}
                    >
                        <button
                            type="button"
                            className="ow-bottom-sheet__handle"
                            aria-label={labels?.handle ?? defaultLabels.handle}
                            aria-describedby={total > 1 ? `${titleId}-handle` : undefined}
                            onKeyDown={onKeyDown}
                        />
                        {total > 1 ? (
                            <span id={`${titleId}-handle`} hidden>
                                {`Height ${index + 1} of ${total}. Up and Down arrow keys change it.`}
                            </span>
                        ) : null}
                    </div>
                ) : null}
                <header
                    className="ow-bottom-sheet__header"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={(event) => endDrag(event, false)}
                    onPointerCancel={(event) => endDrag(event, true)}
                >
                    <div className="ow-bottom-sheet__titles">
                        <h2 id={titleId} className="ow-bottom-sheet__title">
                            {title}
                        </h2>
                        {description ? (
                            <p id={descriptionId} className="ow-bottom-sheet__description">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    {dismissible ? <CloseButton onClick={onClose} /> : null}
                </header>
                <div className="ow-bottom-sheet__body" tabIndex={scrolls ? 0 : undefined}>
                    <div ref={contentRef} className="ow-bottom-sheet__content">
                        {children}
                    </div>
                </div>
                {footer ? <footer className="ow-bottom-sheet__footer">{footer}</footer> : null}
            </div>
            <span className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {announcement}
            </span>
        </dialog>
    );
}
