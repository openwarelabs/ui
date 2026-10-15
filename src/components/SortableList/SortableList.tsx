import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type Key,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";
import type { SortableDrag, SortableGeometry, SortableListProps } from "./SortableList.types";

export type { SortableListItemState, SortableListLabels, SortableListProps } from "./SortableList.types";

const defaultLabels = {
    pickedUp: (item: string, position: number, total: number) => `Picked up ${item}. Position ${position} of ${total}.`,
    moved: (item: string, position: number, total: number) => `${item}, position ${position} of ${total}.`,
    dropped: (item: string, position: number, total: number) => `Dropped ${item} at position ${position} of ${total}.`,
    cancelled: (item: string, position: number, total: number) => `Cancelled. ${item} is back at position ${position} of ${total}.`,
    instructions: "Press Space to pick up, the arrow keys to move, Space to drop, Escape to cancel.",
    handle: "Reorder",
};

/** Rows that keep their own clicks: a pointer down on one doesn't start a drag. */
const ownClicks = "a,button,input,select,textarea,label,[contenteditable],[tabindex]";
const edge = 40;

const defaultKey = (item: unknown): Key => (typeof item === "object" && item ? (item as { id: Key }).id : (item as Key));

const scrollOf = (element: Element, horizontal: boolean) => (horizontal ? element.scrollLeft : element.scrollTop);

/** The nearest box that scrolls along the axis, or the page. */
function scrollerOf(element: Element, horizontal: boolean): Element {
    for (let node: Element | null = element; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        const size = horizontal ? node.scrollWidth > node.clientWidth : node.scrollHeight > node.clientHeight;
        if (size && /auto|scroll/.test(horizontal ? style.overflowX : style.overflowY)) return node;
    }
    return document.scrollingElement ?? document.documentElement;
}

/** The place a dragged item centred at `center` would drop into. */
function targetOf({ lo, hi, dir }: SortableGeometry, from: number, center: number) {
    let to = from;
    lo.forEach((start, index) => {
        const past = (center - (start + hi[index]!) / 2) * dir;
        if (index > from && past > 0) to = index;
        if (index < from && past < 0 && index < to) to = index;
    });
    return to;
}

/** How far item `index` moves while `drag` is under way. */
function shiftOf(drag: SortableDrag | null, index: number) {
    if (!drag) return 0;
    const { from, to, geo } = drag;
    if (index === from) {
        if (!drag.keyboard) return drag.offset;
        // Carried by keys, it lines up with the far edge of the place it goes to.
        return (to > from) === (geo.dir > 0) ? geo.hi[to]! - geo.hi[from]! : geo.lo[to]! - geo.lo[from]!;
    }
    if (index > from && index <= to) return -geo.dir * geo.step;
    if (index < from && index >= to) return geo.dir * geo.step;
    return 0;
}

function GripIcon() {
    return (
        <svg className="ow-sortable__grip" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            <circle cx="9" cy="5" r="1.6" />
            <circle cx="9" cy="12" r="1.6" />
            <circle cx="9" cy="19" r="1.6" />
            <circle cx="15" cy="5" r="1.6" />
            <circle cx="15" cy="12" r="1.6" />
            <circle cx="15" cy="19" r="1.6" />
        </svg>
    );
}

/**
 * A list people put in order: drag an item (by the whole row, or by its grip with `handle`) and the others move to
 * make room, or focus it, press Space, move it with the arrow keys and press Space again. Each step is read out.
 */
export function SortableList<Item>({
    items,
    defaultItems = [],
    onReorder,
    renderItem,
    getKey = defaultKey,
    itemLabel,
    label,
    handle = false,
    orientation = "vertical",
    disabled = false,
    labels: labelsProp,
    className,
    ...props
}: SortableListProps<Item>) {
    const [current, setItems] = useControllableState(items, defaultItems);
    const [drag, setDrag] = useState<SortableDrag | null>(null);
    const [message, setMessage] = useState("");
    const baseId = useId();
    const listRef = useRef<HTMLOListElement>(null);
    const dragRef = useRef<SortableDrag | null>(null);
    const focusKey = useRef<Key | null>(null);
    const stopPointer = useRef<() => void>(undefined);
    const labels = { ...defaultLabels, ...labelsProp };
    const horizontal = orientation === "horizontal";
    const total = current.length;

    const update = (next: SortableDrag | null) => {
        dragRef.current = next;
        setDrag(next);
    };

    const nameOf = (index: number) => {
        const item = current[index];
        if (itemLabel) return itemLabel(item as Item);
        if (typeof item === "string" || typeof item === "number") return String(item);
        return listRef.current?.children[index]?.querySelector(".ow-sortable__content")?.textContent?.trim() ?? "";
    };
    const say = (words: (item: string, position: number, total: number) => string, index: number, position: number) =>
        setMessage(words(nameOf(index), position + 1, total));

    const measure = (from: number): SortableGeometry => {
        const list = listRef.current!;
        const rects = Array.from(list.children, (child) => child.getBoundingClientRect());
        const lo = rects.map((rect) => (horizontal ? rect.left : rect.top));
        const hi = rects.map((rect) => (horizontal ? rect.right : rect.bottom));
        const last = rects.length - 1;
        const near = from < last ? from + 1 : from - 1;
        const gap = near < 0 ? 0 : Math.max(lo[near]! - hi[from]!, lo[from]! - hi[near]!);
        const scroller = scrollerOf(list, horizontal);
        return { lo, hi, dir: lo[last]! < lo[0]! ? -1 : 1, step: hi[from]! - lo[from]! + gap, scroller, scroll: scrollOf(scroller, horizontal) };
    };

    const drop = ({ from, to }: SortableDrag) => {
        say(labels.dropped, from, to);
        update(null);
        if (from === to) return;
        const next = current.slice();
        next.splice(to, 0, ...next.splice(from, 1));
        focusKey.current = getKey(current[from] as Item);
        setItems(next);
        onReorder?.(next, { from, to });
    };

    const cancel = (state: SortableDrag) => {
        say(labels.cancelled, state.from, state.from);
        update(null);
    };

    // React moves the dropped item's element, which can lose its focus; put it back.
    useLayoutEffect(() => {
        const key = focusKey.current;
        focusKey.current = null;
        const list = listRef.current;
        if (key == null || !list || list.contains(document.activeElement)) return;
        const row = list.children[current.findIndex((item) => getKey(item) === key)];
        (row?.querySelector<HTMLElement>(".ow-sortable__handle") ?? (row as HTMLElement | undefined))?.focus({ preventScroll: true });
    }, [current, getKey]);

    // Keep the item carried by keys in view.
    useLayoutEffect(() => {
        if (drag?.keyboard) listRef.current?.children[drag.from]?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [drag]);

    useEffect(() => () => stopPointer.current?.(), []);

    function onPointerDown(event: ReactPointerEvent<HTMLElement>, index: number) {
        if (disabled || dragRef.current || stopPointer.current || event.button !== 0) return;
        if (!handle && (event.target as Element).closest(ownClicks) !== event.currentTarget) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        const pointer = event.pointerId;
        const startX = event.clientX;
        const startY = event.clientY;
        const begin = horizontal ? startX : startY;
        let at = begin;
        let frame = 0;

        // Each frame: scroll when the pointer is near an edge of the scrolling box, then follow the pointer.
        const tick = () => {
            const state = dragRef.current;
            if (!state) return;
            const { geo } = state;
            const page = geo.scroller === document.scrollingElement;
            const box = geo.scroller.getBoundingClientRect();
            const start = page ? 0 : horizontal ? box.left : box.top;
            const end = page ? (horizontal ? innerWidth : innerHeight) : horizontal ? box.right : box.bottom;
            const depth = at < start + edge ? at - start - edge : at > end - edge ? at - end + edge : 0;
            if (depth) geo.scroller[horizontal ? "scrollLeft" : "scrollTop"] += Math.sign(depth) * Math.min(20, Math.ceil(Math.abs(depth) / 3));
            // It stays within the list, so it can't stretch the box it scrolls in.
            const offset = Math.min(
                Math.max(...geo.hi) - geo.hi[state.from]!,
                Math.max(Math.min(...geo.lo) - geo.lo[state.from]!, at - begin + scrollOf(geo.scroller, horizontal) - geo.scroll),
            );
            const to = targetOf(geo, state.from, (geo.lo[state.from]! + geo.hi[state.from]!) / 2 + offset);
            if (offset !== state.offset || to !== state.to) update({ ...state, offset, to });
            frame = requestAnimationFrame(tick);
        };

        const move = (moved: PointerEvent) => {
            if (moved.pointerId !== pointer) return;
            at = horizontal ? moved.clientX : moved.clientY;
            // A small threshold, so a click or a tap isn't a drag.
            if (dragRef.current || Math.hypot(moved.clientX - startX, moved.clientY - startY) < 4) return;
            update({ from: index, to: index, offset: 0, keyboard: false, geo: measure(index) });
            say(labels.pickedUp, index, index);
            document.documentElement.dataset.owSortableDrag = "";
            frame = requestAnimationFrame(tick);
        };

        const stop = (ended: Event) => {
            if (ended instanceof PointerEvent ? ended.pointerId !== pointer : (ended as globalThis.KeyboardEvent).key !== "Escape") return;
            end();
            const state = dragRef.current;
            if (!state) return;
            if (ended.type === "pointerup") {
                drop(state);
                // The drag ends in a click on the row; it shouldn't count as one.
                const swallow = (click: Event) => click.stopPropagation();
                window.addEventListener("click", swallow, { capture: true, once: true });
                setTimeout(() => window.removeEventListener("click", swallow, true));
            } else {
                // Escape puts it back, and doesn't also close a dialog it's in.
                ended.stopPropagation();
                cancel(state);
            }
        };

        const end = () => {
            cancelAnimationFrame(frame);
            delete document.documentElement.dataset.owSortableDrag;
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", stop);
            window.removeEventListener("pointercancel", stop);
            window.removeEventListener("keydown", stop, true);
            stopPointer.current = undefined;
        };

        stopPointer.current = end;
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", stop);
        window.addEventListener("pointercancel", stop);
        window.addEventListener("keydown", stop, true);
    }

    function onKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
        const state = dragRef.current;
        if (disabled || event.target !== event.currentTarget || state?.keyboard === false) return;
        const { key } = event;
        if (key === " " || key === "Enter") {
            event.preventDefault();
            if (state) drop(state);
            else {
                update({ from: index, to: index, offset: 0, keyboard: true, geo: measure(index) });
                say(labels.pickedUp, index, index);
            }
            return;
        }
        if (!state) return;
        const rtl = horizontal && getComputedStyle(event.currentTarget).direction === "rtl";
        const back = horizontal ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp";
        const forward = horizontal ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown";
        let to: number;
        if (key === back) to = Math.max(0, state.to - 1);
        else if (key === forward) to = Math.min(total - 1, state.to + 1);
        else if (key === "Home") to = 0;
        else if (key === "End") to = total - 1;
        else if (key === "Escape") {
            event.preventDefault();
            cancel(state);
            return;
        } else return;
        event.preventDefault();
        if (to === state.to) return;
        update({ ...state, to });
        say(labels.moved, state.from, to);
    }

    const descriptionId = `${baseId}-how`;

    return (
        <>
            <ol
                ref={listRef}
                aria-label={label}
                {...props}
                className={cx(
                    "ow-sortable",
                    `ow-sortable--${orientation}`,
                    drag && "ow-sortable--dragging",
                    disabled && "ow-sortable--disabled",
                    className,
                )}
            >
                {current.map((item, index) => {
                    const isDragging = drag?.from === index;
                    const shift = shiftOf(drag, index);
                    const contentId = `${baseId}-${index}`;
                    // What picks the item up: the whole row, or its grip.
                    const grab = {
                        tabIndex: disabled ? undefined : 0,
                        "aria-describedby": disabled ? undefined : descriptionId,
                        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => onPointerDown(event, index),
                        onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(event, index),
                        onBlur: () => dragRef.current?.keyboard && cancel(dragRef.current),
                    };
                    return (
                        <li
                            key={getKey(item)}
                            className={cx("ow-sortable__item", isDragging && "ow-sortable__item--dragging", !handle && "ow-sortable__item--row")}
                            style={shift ? { transform: `translate${horizontal ? "X" : "Y"}(${shift}px)` } : undefined}
                            {...(handle ? undefined : grab)}
                        >
                            {handle ? (
                                <button
                                    type="button"
                                    className="ow-sortable__handle"
                                    id={`${contentId}-grip`}
                                    aria-label={labels.handle}
                                    aria-labelledby={`${contentId}-grip ${contentId}`}
                                    disabled={disabled}
                                    {...grab}
                                >
                                    <GripIcon />
                                </button>
                            ) : null}
                            <div className="ow-sortable__content" id={contentId}>
                                {renderItem(item, { index, isDragging })}
                            </div>
                        </li>
                    );
                })}
            </ol>
            <span id={descriptionId} hidden>
                {labels.instructions}
            </span>
            <span className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {message}
            </span>
        </>
    );
}
