import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type FocusEvent,
    type Key,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";
import type { KanbanColumn, KanbanDrag, KanbanProps } from "./Kanban.types";

export type { KanbanCardState, KanbanColumn, KanbanLabels, KanbanMove, KanbanProps } from "./Kanban.types";

const defaultLabels = {
    pickedUp: (card: string, column: string, position: number, total: number) => `Picked up ${card}. ${column}, position ${position} of ${total}.`,
    moved: (card: string, column: string, position: number, total: number) => `${card}, ${column}, position ${position} of ${total}.`,
    dropped: (card: string, column: string, position: number, total: number) => `Dropped ${card} in ${column}, position ${position} of ${total}.`,
    cancelled: (card: string, column: string, position: number, total: number) =>
        `Cancelled. ${card} is back in ${column}, position ${position} of ${total}.`,
    instructions:
        "The arrow keys move between cards. Press Space to pick a card up, the arrow keys to move it within and between columns, Space to drop it, Escape to cancel.",
    count: (count: number, limit?: number) => (limit === undefined ? `${count} cards` : `${count} of ${limit} cards`),
    empty: "No cards",
};

/** Things in a card that keep their own clicks: a pointer down on one doesn't start a drag. */
const ownClicks = "a,button,input,select,textarea,label,[contenteditable]";
const edge = 48;

const defaultKey = (card: unknown): Key => (card as { id: Key }).id;

/** The columns as they'd be with the dragged card where it would go. */
function moveCard<Card>(columns: Array<KanbanColumn<Card>>, drag: KanbanDrag | null) {
    if (!drag) return columns;
    const { from, to } = drag;
    if (from.column === to.column && from.index === to.index) return columns;
    const next = columns.map((column) => ({ ...column, cards: column.cards.slice() }));
    const [card] = next[from.column]!.cards.splice(from.index, 1);
    next[to.column]!.cards.splice(to.index, 0, card as Card);
    return next;
}

/** Scrolls `box` along one axis when `at` is near its edge; true when it scrolled. */
function scrollNear(box: Element, at: number, horizontal: boolean) {
    const rect = box.getBoundingClientRect();
    const start = horizontal ? rect.left : rect.top;
    const end = horizontal ? rect.right : rect.bottom;
    const depth = at < start + edge ? at - start - edge : at > end - edge ? at - end + edge : 0;
    if (!depth) return false;
    box[horizontal ? "scrollLeft" : "scrollTop"] += Math.sign(depth) * Math.min(20, Math.ceil(Math.abs(depth) / 3));
    return true;
}

/**
 * A board of columns holding cards: drag a card within its column or to another, or focus it, press Space, move it
 * with the arrow keys and press Space again. Each step is read out. For tasks, a hiring pipeline, a content calendar.
 */
export function Kanban<Card>({
    columns,
    defaultColumns = [],
    onChange,
    renderCard,
    getKey = defaultKey,
    cardLabel,
    canMove,
    columnActions,
    columnFooter,
    label,
    headingLevel = 3,
    height,
    disabled = false,
    labels: labelsProp,
    className,
}: KanbanProps<Card>) {
    const [current, setColumns] = useControllableState(columns, defaultColumns);
    const [drag, setDrag] = useState<KanbanDrag | null>(null);
    const [message, setMessage] = useState("");
    const [active, setActive] = useState<Key | null>(null);
    const [overlay, setOverlay] = useState<{ left: number; top: number; width: number } | null>(null);
    const baseId = useId();
    const boardRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<KanbanDrag | null>(null);
    const focusKey = useRef<Key | null>(null);
    const moving = useRef(false);
    const stopPointer = useRef<() => void>(undefined);
    const labels = { ...defaultLabels, ...labelsProp };
    const Heading = `h${headingLevel}` as "h3";
    const shown = moveCard(current, drag);

    const update = (next: KanbanDrag | null) => {
        dragRef.current = next;
        setDrag(next);
    };

    const cardElements = () => Array.from(boardRef.current?.querySelectorAll<HTMLElement>(".ow-kanban__card[data-key]") ?? []);
    const elementOf = (key: Key) => cardElements().find((element) => element.dataset.key === String(key));
    const nameOf = (key: Key) => {
        for (const column of current) {
            const card = column.cards.find((item) => getKey(item) === key);
            // Its first line of text, such as the title, rather than every word on it run together.
            if (card !== undefined) return cardLabel ? cardLabel(card) : (elementOf(key)?.innerText.trim().split("\n")[0] ?? "");
        }
        return "";
    };
    const say = (words: (card: string, column: string, position: number, total: number) => string, state: KanbanDrag, at = state.to) => {
        const total = current[at.column]!.cards.length + (at.column === state.from.column ? 0 : 1);
        setMessage(words(state.name, current[at.column]!.title, at.index + 1, total));
    };
    const allowed = (state: KanbanDrag, column: number) => {
        if (column === state.from.column || !canMove) return true;
        const card = current[state.from.column]!.cards[state.from.index] as Card;
        return canMove(card, current[state.from.column]!.id, current[column]!.id);
    };

    const drop = (state: KanbanDrag) => {
        say(labels.dropped, state);
        const { from, to } = state;
        const next = moveCard(current, state);
        focusKey.current = state.key;
        moving.current = true;
        update(null);
        if (next === current) return;
        setColumns(next);
        onChange?.(next, {
            card: current[from.column]!.cards[from.index] as Card,
            from: { columnId: current[from.column]!.id, index: from.index },
            to: { columnId: current[to.column]!.id, index: to.index },
        });
    };

    const cancel = (state: KanbanDrag) => {
        say(labels.cancelled, state, state.from);
        focusKey.current = state.key;
        moving.current = true;
        update(null);
    };

    // A card that changes column is a new element, which loses focus; put it back.
    useLayoutEffect(() => {
        const key = focusKey.current;
        moving.current = false;
        if (key == null) return;
        focusKey.current = null;
        const element = elementOf(key);
        if (element && document.activeElement !== element) element.focus({ preventScroll: true });
        element?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });

    useEffect(() => () => stopPointer.current?.(), []);

    function onPointerDown(event: ReactPointerEvent<HTMLElement>, key: Key, column: number, index: number) {
        if (disabled || dragRef.current || stopPointer.current || event.button !== 0) return;
        const own = (event.target as Element).closest(ownClicks);
        if (own && event.currentTarget.contains(own)) return;
        event.preventDefault();
        const card = event.currentTarget;
        card.focus({ preventScroll: true });
        const pointer = event.pointerId;
        const startX = event.clientX;
        const startY = event.clientY;
        const rect = card.getBoundingClientRect();
        const grabX = startX - rect.left;
        const grabY = startY - rect.top;
        let x = startX;
        let y = startY;
        let frame = 0;

        // Each frame: scroll near the edges, then work out the column under the pointer and the place in it.
        const tick = () => {
            const state = dragRef.current;
            const board = boardRef.current;
            if (!state || !board) return;
            scrollNear(board, x, true);
            const columnElements = Array.from(board.querySelectorAll<HTMLElement>(".ow-kanban__column"));
            let target = state.to.column;
            let nearest = Infinity;
            columnElements.forEach((element, index) => {
                const box = element.getBoundingClientRect();
                const distance = x < box.left ? box.left - x : x > box.right ? x - box.right : 0;
                if (distance < nearest && allowed(state, index)) {
                    nearest = distance;
                    target = index;
                }
            });
            const list = columnElements[target]?.querySelector<HTMLElement>(".ow-kanban__list");
            if (list) scrollNear(list, y, false);
            const others = Array.from(list?.querySelectorAll<HTMLElement>(".ow-kanban__card[data-key]") ?? []).filter(
                (element) => element.dataset.key !== String(state.key),
            );
            let index = others.findIndex((element) => {
                const box = element.getBoundingClientRect();
                return y < box.top + box.height / 2;
            });
            if (index < 0) index = others.length;
            if (target !== state.to.column || index !== state.to.index) {
                const next = { ...state, to: { column: target, index } };
                update(next);
                say(labels.moved, next);
            }
            if (overlayRef.current) overlayRef.current.style.transform = `translate(${x - startX}px, ${y - startY}px)`;
            frame = requestAnimationFrame(tick);
        };

        const move = (moved: PointerEvent) => {
            if (moved.pointerId !== pointer) return;
            x = moved.clientX;
            y = moved.clientY;
            // A small threshold, so a click or a tap isn't a drag.
            if (dragRef.current || Math.hypot(x - startX, y - startY) < 4) return;
            const state = { key, name: nameOf(key), from: { column, index }, to: { column, index }, keyboard: false };
            update(state);
            say(labels.pickedUp, state);
            setOverlay({ left: startX - grabX, top: startY - grabY, width: rect.width });
            document.documentElement.dataset.owKanbanDrag = "";
            frame = requestAnimationFrame(tick);
        };

        const stop = (ended: Event) => {
            if (ended instanceof PointerEvent ? ended.pointerId !== pointer : (ended as globalThis.KeyboardEvent).key !== "Escape") return;
            end();
            const state = dragRef.current;
            if (!state) return;
            if (ended.type === "pointerup") {
                drop(state);
                // The drag ends in a click on the card; it shouldn't count as one.
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
            setOverlay(null);
            delete document.documentElement.dataset.owKanbanDrag;
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

    function onKeyDown(event: KeyboardEvent<HTMLElement>, key: Key, column: number, index: number) {
        const state = dragRef.current;
        if (event.target !== event.currentTarget || state?.keyboard === false) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[event.key as "ArrowLeft"] as number | undefined;

        if (event.key === " " || event.key === "Enter") {
            if (disabled) return;
            event.preventDefault();
            if (state) drop(state);
            else {
                const next = { key, name: nameOf(key), from: { column, index }, to: { column, index }, keyboard: true };
                update(next);
                say(labels.pickedUp, next);
            }
            return;
        }

        if (state) {
            // Carrying: move it within the column, or to the next column it may go into.
            if (event.key === "Escape") {
                event.preventDefault();
                cancel(state);
                return;
            }
            const size = (target: number) => current[target]!.cards.length - (target === state.from.column ? 1 : 0);
            let to = state.to;
            if (event.key === "ArrowUp") to = { ...to, index: Math.max(0, to.index - 1) };
            else if (event.key === "ArrowDown") to = { ...to, index: Math.min(size(to.column), to.index + 1) };
            else if (event.key === "Home") to = { ...to, index: 0 };
            else if (event.key === "End") to = { ...to, index: size(to.column) };
            else if (step) {
                let target = to.column + step;
                while (target >= 0 && target < current.length && !allowed(state, target)) target += step;
                if (target >= 0 && target < current.length) to = { column: target, index: Math.min(to.index, size(target)) };
            } else return;
            event.preventDefault();
            if (to.column === state.to.column && to.index === state.to.index) return;
            const next = { ...state, to };
            focusKey.current = key;
            moving.current = true;
            update(next);
            say(labels.moved, next);
            return;
        }

        // Not carrying: move focus between cards, Left and Right to the nearest card in the next column with any.
        let target: { column: number; index: number } | undefined;
        const cards = (at: number) => shown[at]!.cards.length;
        if (event.key === "ArrowUp" && index > 0) target = { column, index: index - 1 };
        else if (event.key === "ArrowDown" && index < cards(column) - 1) target = { column, index: index + 1 };
        else if (event.key === "Home") target = { column, index: 0 };
        else if (event.key === "End") target = { column, index: cards(column) - 1 };
        else if (step) {
            let at = column + step;
            while (at >= 0 && at < shown.length && cards(at) === 0) at += step;
            if (at >= 0 && at < shown.length) target = { column: at, index: Math.min(index, cards(at) - 1) };
        }
        if (!target) return;
        event.preventDefault();
        const next = getKey(shown[target.column]!.cards[target.index] as Card);
        setActive(next);
        elementOf(next)?.focus();
    }

    function onBlur(event: FocusEvent<HTMLElement>) {
        const state = dragRef.current;
        // Moving to another column remounts the card; only cancel when focus really goes elsewhere.
        if (state?.keyboard && !moving.current && event.relatedTarget) cancel(state);
    }

    const allKeys = shown.flatMap((column) => column.cards.map(getKey));
    const tabStop = active != null && allKeys.includes(active) ? active : allKeys[0];
    const descriptionId = `${baseId}-how`;
    const dragged = drag ? shown[drag.to.column]?.cards[drag.to.index] : undefined;

    return (
        <div
            ref={boardRef}
            role="group"
            aria-label={label}
            className={cx("ow-kanban", drag && "ow-kanban--dragging", height !== undefined && "ow-kanban--fixed", disabled && "ow-kanban--disabled", className)}
            style={height !== undefined ? { height } : undefined}
        >
            {shown.map((column, columnIndex) => {
                const headingId = `${baseId}-${columnIndex}`;
                const count = column.cards.length;
                const over = column.limit !== undefined && count > column.limit;
                const target = drag?.to.column === columnIndex;
                return (
                    <section
                        key={column.id}
                        className={cx("ow-kanban__column", target && "ow-kanban__column--target", over && "ow-kanban__column--over")}
                        aria-labelledby={headingId}
                    >
                        <div className="ow-kanban__head">
                            <Heading id={headingId} className="ow-kanban__title">
                                {column.title}
                            </Heading>
                            <span className="ow-kanban__count">
                                <span aria-hidden="true">{column.limit === undefined ? count : `${count} / ${column.limit}`}</span>
                                <span className="ow-visually-hidden">{labels.count(count, column.limit)}</span>
                            </span>
                            {columnActions ? <div className="ow-kanban__actions">{columnActions(column)}</div> : null}
                        </div>
                        <div className="ow-kanban__list">
                            <ul className="ow-kanban__cards" aria-labelledby={headingId}>
                                {column.cards.map((card, index) => {
                                    const key = getKey(card);
                                    const isDragging = drag?.key === key;
                                    return (
                                        <li
                                            key={key}
                                            data-key={String(key)}
                                            className={cx(
                                                "ow-kanban__card",
                                                isDragging && (drag.keyboard ? "ow-kanban__card--lifted" : "ow-kanban__card--placeholder"),
                                            )}
                                            tabIndex={key === tabStop ? 0 : -1}
                                            aria-describedby={disabled ? undefined : descriptionId}
                                            onFocus={(event) => {
                                                if (event.target === event.currentTarget) setActive(key);
                                            }}
                                            onPointerDown={(event) => onPointerDown(event, key, columnIndex, index)}
                                            onKeyDown={(event) => onKeyDown(event, key, columnIndex, index)}
                                            onBlur={onBlur}
                                        >
                                            {renderCard(card, { columnId: column.id, index, isDragging })}
                                        </li>
                                    );
                                })}
                            </ul>
                            {count === 0 ? <p className="ow-kanban__empty">{labels.empty}</p> : null}
                        </div>
                        {columnFooter ? <div className="ow-kanban__footer">{columnFooter(column)}</div> : null}
                    </section>
                );
            })}
            {overlay && drag && dragged !== undefined ? (
                <div
                    ref={overlayRef}
                    className="ow-kanban__card ow-kanban__card--overlay"
                    style={{ left: overlay.left, top: overlay.top, width: overlay.width }}
                    aria-hidden="true"
                >
                    {renderCard(dragged, { columnId: shown[drag.to.column]!.id, index: drag.to.index, isDragging: true })}
                </div>
            ) : null}
            <span id={descriptionId} hidden>
                {labels.instructions}
            </span>
            <span className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {message}
            </span>
        </div>
    );
}
