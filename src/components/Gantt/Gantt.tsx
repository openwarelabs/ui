import {
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type FocusEvent,
    type Key,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { addDays, addMonths, startOfMonth, toDate, toISO, todayISO, weekday, type ISODate } from "@/components/Calendar/dates";
import { colorOf } from "@/components/Chart/chartUtils";
import { manualPopover } from "@/hooks/useFloating";
import { cx } from "@/utils/cx";
import type { GanttChange, GanttDate, GanttDrag, GanttGroup, GanttProps, GanttRow, GanttScale, GanttSegment, GanttTask } from "./Gantt.types";

export type { GanttChange, GanttDate, GanttGroup, GanttLabels, GanttProps, GanttScale, GanttTask, GanttTaskState } from "./Gantt.types";

const defaultLabels = {
    task: "Task",
    timeline: "Timeline",
    today: "Today",
    milestone: "milestone",
    range: (start: string, end: string) => `${start} to ${end}`,
    done: (percent: number) => `${percent}% done`,
    pickedUp: (task: string, range: string) => `Picked up ${task}. ${range}.`,
    moved: (_task: string, range: string) => `${range}.`,
    dropped: (task: string, range: string) => `Dropped ${task}: ${range}.`,
    cancelled: (task: string, range: string) => `Cancelled. ${task} is back at ${range}.`,
    instructions:
        "The arrow keys move between tasks. Press Space to pick a task up, Left and Right to shift it a day, Shift with them to change its end, Space to drop it, Escape to cancel.",
};

/** Pixels per day at each scale. */
const dayWidths: Record<GanttScale, number> = { day: 40, week: 14, month: 4 };
const headHeight = 48;
const day = 86400000;

/** A Date or any date string as "YYYY-MM-DD"; a Date in local time, so it's the day on the calendar. */
function toISODate(value: GanttDate): ISODate {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = value instanceof Date ? value : new Date(value);
    return toISO(date.getFullYear(), date.getMonth(), date.getDate());
}

const daysBetween = (from: ISODate, to: ISODate) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / day);
const endOfMonth = (iso: ISODate) => addDays(startOfMonth(addMonths(startOfMonth(iso), 1)), -1);
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** The task's first and last day; a milestone is its first day only. */
function daysOf(task: GanttTask): GanttChange {
    const start = toISODate(task.start);
    const end = task.milestone ? start : toISODate(task.end);
    return { start, end: end < start ? start : end };
}

/** A task's days shifted or resized by the drag, kept within the range. */
function dragged(from: GanttChange, mode: GanttDrag["mode"], days: number, first: ISODate, last: ISODate): GanttChange {
    if (mode === "move") {
        const length = daysBetween(from.start, from.end);
        const start = addDays(from.start, clamp(days, -daysBetween(first, from.start), daysBetween(from.end, last)));
        return { start, end: addDays(start, length) };
    }
    if (mode === "start") return { start: addDays(from.start, clamp(days, -daysBetween(first, from.start), daysBetween(from.start, from.end))), end: from.end };
    return { start: from.start, end: addDays(from.end, clamp(days, -daysBetween(from.start, from.end), daysBetween(from.end, last))) };
}

/**
 * A timeline of tasks: a bar per task across the days it covers, under a header of months and days, with the
 * dependencies drawn between them and a line at today. With `onChange`, bars move and resize by pointer or keyboard,
 * and each step is read out. For a project plan, a roadmap, a release schedule.
 */
export function Gantt({
    tasks,
    groups: groupsProp,
    start: startProp,
    end: endProp,
    scale: scaleProp,
    today: todayProp,
    onChange,
    onTaskClick,
    renderTask,
    dependencies = true,
    rowHeight = 36,
    labelWidth = 200,
    height,
    maxHeight,
    locale,
    label,
    labels: labelsProp,
    className,
}: GanttProps) {
    const [drag, setDrag] = useState<GanttDrag | null>(null);
    const [message, setMessage] = useState("");
    const [active, setActive] = useState<Key | null>(null);
    const [tip, setTip] = useState<Key | null>(null);
    const [room, setRoom] = useState<number | null>(null);
    const baseId = useId();
    const scrollRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLSpanElement>(null);
    const anchorRef = useRef<HTMLElement | null>(null);
    const dragRef = useRef<GanttDrag | null>(null);
    const stopPointer = useRef<() => void>(undefined);
    const labels = { ...defaultLabels, ...labelsProp };
    const editable = Boolean(onChange);
    // On a narrow screen the titles give way to the timeline: never more than 45% of the width.
    const labelPx = room === null ? labelWidth : Math.min(labelWidth, Math.max(96, Math.floor(room * 0.45)));

    // Every task's days, worked out once, and the range they span, snapped to the scale's unit.
    const days = useMemo(() => new Map(tasks.map((task) => [task.id, daysOf(task)])), [tasks]);
    const { first, last, scale } = useMemo(() => {
        const all = Array.from(days.values());
        const today = todayISO();
        let first =
            startProp !== undefined
                ? toISODate(startProp)
                : all.length
                  ? all.reduce((low, item) => (item.start < low ? item.start : low), all[0]!.start)
                  : addDays(today, -14);
        let last =
            endProp !== undefined
                ? toISODate(endProp)
                : all.length
                  ? all.reduce((high, item) => (item.end > high ? item.end : high), all[0]!.end)
                  : addDays(today, 14);
        if (last < first) last = first;
        const span = daysBetween(first, last) + 1;
        const scale = scaleProp ?? (span <= 42 ? "day" : span <= 180 ? "week" : "month");
        if (startProp === undefined)
            first = scale === "day" ? addDays(first, -1) : scale === "week" ? addDays(first, -((weekday(first) + 6) % 7)) : startOfMonth(first);
        if (endProp === undefined) last = scale === "day" ? addDays(last, 1) : scale === "week" ? addDays(last, (7 - weekday(last)) % 7) : endOfMonth(last);
        return { first, last, scale };
    }, [days, startProp, endProp, scaleProp]);
    const dayWidth = dayWidths[scale];
    const total = daysBetween(first, last) + 1;
    const width = total * dayWidth;
    const x = (iso: ISODate) => daysBetween(first, iso) * dayWidth;

    // Rows: a flat list, or each group's heading over its tasks. Each group takes the next palette slot.
    const rows = useMemo(() => {
        const groups: GanttGroup[] = groupsProp ? groupsProp.slice() : [];
        if (!groupsProp) {
            for (const task of tasks) {
                if (task.group !== undefined && !groups.some((group) => group.id === task.group)) groups.push({ id: task.group, title: String(task.group) });
            }
        }
        const rows: GanttRow[] = [];
        const loose = tasks.filter((task) => task.group === undefined || !groups.some((group) => group.id === task.group));
        for (const task of loose) rows.push({ kind: "task", task, color: colorOf(task.color, 0) });
        groups.forEach((group, index) => {
            const own = tasks.filter((task) => task.group === group.id);
            const color = colorOf(undefined, groups.length > 1 || loose.length ? index + (loose.length ? 1 : 0) : 0);
            rows.push({ kind: "group", group, color });
            for (const task of own) rows.push({ kind: "task", task, color: colorOf(task.color, index + (loose.length ? 1 : 0)) });
        });
        return rows;
    }, [tasks, groupsProp]);
    const taskRows = rows.filter((row) => row.kind === "task");
    const rowIndex = new Map(rows.map((row, index) => [row.kind === "task" ? row.task.id : `group:${String(row.group.id)}`, index]));

    // The header's two tiers: months over days or weeks, years over months.
    const formats = useMemo(
        () => ({
            month: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }),
            shortMonth: new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }),
            dayNumber: new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: "UTC" }),
            dayMonth: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }),
            year: new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: "UTC" }),
            full: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
        }),
        [locale],
    );
    const { top, bottom, weekends } = useMemo(() => {
        const top: GanttSegment[] = [];
        const bottom: GanttSegment[] = [];
        const weekends: number[] = [];
        const push = (list: GanttSegment[], key: string, label: string, offset: number) => {
            const previous = list[list.length - 1];
            if (previous?.key === key) previous.length += 1;
            else list.push({ key, label, offset, length: 1 });
        };
        for (let offset = 0; offset < total; offset += 1) {
            const iso = addDays(first, offset);
            const date = toDate(iso);
            const week = weekday(iso);
            if (scale === "month") {
                push(top, iso.slice(0, 4), formats.year.format(date), offset);
                push(bottom, iso.slice(0, 7), formats.shortMonth.format(date), offset);
                continue;
            }
            push(top, iso.slice(0, 7), formats.month.format(date), offset);
            if (scale === "day") push(bottom, iso, formats.dayNumber.format(date), offset);
            else push(bottom, offset === 0 || week === 1 ? iso : bottom[bottom.length - 1]!.key, formats.dayMonth.format(date), offset);
            if (week === 0 || week === 6) weekends.push(offset);
        }
        return { top, bottom, weekends };
    }, [first, total, scale, formats]);

    const todayISODate = todayProp === null ? null : todayProp === undefined ? todayISO() : toISODate(todayProp);
    const showToday = todayISODate !== null && todayISODate >= first && todayISODate <= last;

    const update = (next: GanttDrag | null) => {
        dragRef.current = next;
        setDrag(next);
    };
    const shownDays = (task: GanttTask) => (drag?.id === task.id ? drag.to : days.get(task.id)!);
    const rangeOf = (span: GanttChange, milestone?: boolean) => {
        const sameYear = span.start.slice(0, 4) === span.end.slice(0, 4);
        const format = (iso: ISODate) => (sameYear ? formats.dayMonth : formats.full).format(toDate(iso));
        return milestone || span.start === span.end ? format(span.start) : labels.range(format(span.start), format(span.end));
    };
    const nameOf = (task: GanttTask, span: GanttChange) => {
        const parts = [task.title, task.milestone ? labels.milestone : "", rangeOf(span, task.milestone)];
        if (task.progress !== undefined && !task.milestone) parts.push(labels.done(Math.round(clamp(task.progress, 0, 1) * 100)));
        return parts.filter(Boolean).join(", ");
    };
    const barElements = () => Array.from(scrollRef.current?.querySelectorAll<HTMLElement>(".ow-gantt__bar[data-key]") ?? []);
    const elementOf = (key: Key) => barElements().find((element) => element.dataset.key === String(key));

    const drop = (state: GanttDrag) => {
        setMessage(labels.dropped(state.name, rangeOf(state.to)));
        update(null);
        const task = tasks.find((item) => item.id === state.id);
        if (task && (state.to.start !== state.from.start || state.to.end !== state.from.end)) onChange?.(task, state.to);
    };
    const cancel = (state: GanttDrag) => {
        setMessage(labels.cancelled(state.name, rangeOf(state.from)));
        update(null);
    };

    // When today would be out of sight at first, start with it in view, a third of the way in from the titles.
    useLayoutEffect(() => {
        const scroller = scrollRef.current;
        if (!scroller || !showToday) return;
        const visible = scroller.clientWidth - labelPx;
        const at = x(todayISODate) + dayWidth / 2;
        if (at < visible * 0.8) return;
        const rtl = getComputedStyle(scroller).direction === "rtl";
        const offset = at - Math.max(80, visible / 3);
        scroller.scrollLeft = rtl ? -offset : offset;
        // Only when the range changes: scrolling as tasks change would fight the person.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [first, last, scale]);

    // The tooltip sits in the top layer above its bar (below, when there's no room), so the scroll area can't clip it.
    useLayoutEffect(() => {
        const bubble = bubbleRef.current;
        if (tip === null || !bubble) return;
        try {
            if (!bubble.matches(":popover-open")) bubble.showPopover();
        } catch {
            // Without popover support it still shows as a fixed element.
        }
        const place = () => {
            const rect = anchorRef.current!.getBoundingClientRect();
            const above = rect.top - bubble.offsetHeight - 6 >= 8;
            bubble.dataset.side = above ? "top" : "bottom";
            Object.assign(bubble.style, {
                position: "fixed",
                inset: "auto",
                margin: "0",
                left: `${Math.max(8, Math.min(rect.left + rect.width / 2 - bubble.offsetWidth / 2, window.innerWidth - bubble.offsetWidth - 8))}px`,
                top: `${above ? rect.top - bubble.offsetHeight - 6 : rect.bottom + 6}px`,
            });
        };
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        return () => {
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
        };
    }, [tip]);

    useEffect(() => () => stopPointer.current?.(), []);

    useLayoutEffect(() => {
        const scroller = scrollRef.current;
        if (!scroller || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(() => setRoom(scroller.clientWidth));
        observer.observe(scroller);
        return () => observer.disconnect();
    }, []);

    function onPointerDown(event: ReactPointerEvent<HTMLElement>, task: GanttTask, mode: GanttDrag["mode"]) {
        if (!editable || dragRef.current || stopPointer.current || event.button !== 0) return;
        if ((event.target as Element).closest("a,button") && mode === "move") return;
        event.preventDefault();
        const bar = event.currentTarget;
        bar.focus({ preventScroll: true });
        const pointer = event.pointerId;
        const startX = event.clientX;
        const rtl = getComputedStyle(bar).direction === "rtl";
        const from = days.get(task.id)!;

        const move = (moved: PointerEvent) => {
            if (moved.pointerId !== pointer) return;
            const dx = (moved.clientX - startX) * (rtl ? -1 : 1);
            const state = dragRef.current;
            // A small threshold, so a click isn't a drag.
            if (!state && Math.abs(dx) < 4) return;
            const to = dragged(from, mode, Math.round(dx / dayWidth), first, last);
            if (!state) {
                setTip(null);
                document.documentElement.dataset.owGanttDrag = mode === "move" ? "move" : "resize";
                const next = { id: task.id, name: task.title, mode, from, to, keyboard: false };
                update(next);
                setMessage(labels.pickedUp(task.title, rangeOf(to)));
            } else if (to.start !== state.to.start || to.end !== state.to.end) {
                const next = { ...state, to };
                update(next);
                setMessage(labels.moved(task.title, rangeOf(to)));
            }
        };

        const stop = (ended: Event) => {
            if (ended instanceof PointerEvent ? ended.pointerId !== pointer : (ended as globalThis.KeyboardEvent).key !== "Escape") return;
            end();
            const state = dragRef.current;
            if (!state) return;
            if (ended.type === "pointerup") {
                drop(state);
                // The drag ends in a click on the bar; it shouldn't count as one.
                const swallow = (click: Event) => click.stopPropagation();
                window.addEventListener("click", swallow, { capture: true, once: true });
                setTimeout(() => window.removeEventListener("click", swallow, true));
            } else {
                ended.stopPropagation();
                cancel(state);
            }
        };

        const end = () => {
            delete document.documentElement.dataset.owGanttDrag;
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

    function onKeyDown(event: KeyboardEvent<HTMLElement>, task: GanttTask, index: number) {
        const state = dragRef.current;
        if (event.target !== event.currentTarget || state?.keyboard === false) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const step = { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 }[event.key as "ArrowLeft"] as number | undefined;

        if (event.key === " ") {
            if (!editable) return;
            event.preventDefault();
            if (state) drop(state);
            else {
                const from = days.get(task.id)!;
                const next = { id: task.id, name: task.title, mode: "move" as const, from, to: from, keyboard: true };
                setTip(null);
                update(next);
                setMessage(labels.pickedUp(task.title, rangeOf(from)));
            }
            return;
        }

        if (state) {
            // Carrying: shift it a day at a time, or with Shift, move its end.
            if (event.key === "Escape") {
                event.preventDefault();
                cancel(state);
                return;
            }
            if (!step) return;
            event.preventDefault();
            const to = dragged(state.to, event.shiftKey && !task.milestone ? "end" : "move", step, first, last);
            if (to.start === state.to.start && to.end === state.to.end) return;
            update({ ...state, to });
            setMessage(labels.moved(task.title, rangeOf(to)));
            return;
        }

        if (event.key === "Enter") {
            const link = event.currentTarget.querySelector<HTMLAnchorElement>("a");
            if (link && event.target === event.currentTarget) {
                event.preventDefault();
                link.click();
            } else if (onTaskClick) {
                event.preventDefault();
                onTaskClick(task);
            }
            return;
        }
        if (event.key === "Escape") {
            setTip(null);
            return;
        }

        // Not carrying: move between the bars.
        let target: number | undefined;
        if (event.key === "ArrowUp") target = Math.max(0, index - 1);
        else if (event.key === "ArrowDown") target = Math.min(taskRows.length - 1, index + 1);
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = taskRows.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        const next = (taskRows[target] as { task: GanttTask }).task.id;
        setActive(next);
        elementOf(next)?.focus();
    }

    function onBlur(event: FocusEvent<HTMLElement>) {
        const state = dragRef.current;
        if (state?.keyboard && event.relatedTarget) cancel(state);
        setTip(null);
    }

    const keys = taskRows.map((row) => (row as { task: GanttTask }).task.id);
    const tabStop = active !== null && keys.includes(active) ? active : keys[0];
    const descriptionId = `${baseId}-how`;
    const bodyHeight = rows.length * rowHeight;
    const tipTask = tip === null ? undefined : tasks.find((task) => task.id === tip);

    // Arrows from the end of each task to the start of the ones that depend on it.
    const arrows: Array<{ key: string; d: string }> = [];
    if (dependencies) {
        for (const task of tasks) {
            const toRow = rowIndex.get(task.id);
            if (toRow === undefined) continue;
            for (const id of task.dependsOn ?? []) {
                const fromRow = rowIndex.get(id);
                const fromTask = tasks.find((item) => item.id === id);
                if (fromRow === undefined || !fromTask) continue;
                const fromDays = shownDays(fromTask);
                const toDays = shownDays(task);
                const x1 = fromTask.milestone ? x(fromDays.start) + dayWidth / 2 + rowHeight / 4 : x(fromDays.end) + dayWidth;
                const x2 = task.milestone ? x(toDays.start) + dayWidth / 2 - rowHeight / 4 : x(toDays.start);
                const y1 = fromRow * rowHeight + rowHeight / 2;
                const y2 = toRow * rowHeight + rowHeight / 2;
                const half = (Math.sign(y2 - y1) || 1) * (rowHeight / 2);
                const d = x2 >= x1 + 16 ? `M${x1} ${y1} H${x1 + 8} V${y2} H${x2 - 1}` : `M${x1} ${y1} H${x1 + 8} V${y1 + half} H${x2 - 8} V${y2} H${x2 - 1}`;
                arrows.push({ key: `${String(id)}>${String(task.id)}`, d });
            }
        }
    }

    const style = {
        "--ow-gantt-row": `${rowHeight}px`,
        "--ow-gantt-label": `${labelPx}px`,
        "--ow-gantt-head": `${headHeight}px`,
    } as CSSProperties;

    return (
        <div className={cx("ow-gantt", drag && "ow-gantt--dragging", editable && "ow-gantt--editable", className)} style={style}>
            <div ref={scrollRef} className="ow-gantt__scroll" style={{ height, maxHeight }}>
                <div className="ow-gantt__canvas" style={{ width: labelPx + width, height: headHeight + bodyHeight }}>
                    {/* Behind the rows: the days' columns, with weekends shaded. */}
                    <div className="ow-gantt__columns" style={{ insetInlineStart: labelPx, width, height: bodyHeight }} aria-hidden="true">
                        {scale !== "month"
                            ? weekends.map((offset) => (
                                  <span key={offset} className="ow-gantt__weekend" style={{ insetInlineStart: offset * dayWidth, width: dayWidth }} />
                              ))
                            : null}
                        {bottom.map((segment) => (
                            <span key={segment.key} className="ow-gantt__line" style={{ insetInlineStart: segment.offset * dayWidth }} />
                        ))}
                        {rows.map((row, index) =>
                            row.kind === "group" ? (
                                <span key={String(row.group.id)} className="ow-gantt__band" style={{ top: index * rowHeight, height: rowHeight }} />
                            ) : null,
                        )}
                    </div>
                    <div role="grid" aria-label={label} className="ow-gantt__grid">
                        <div role="row" className="ow-gantt__head">
                            <div role="columnheader" className="ow-gantt__corner">
                                {labels.task}
                            </div>
                            <div role="columnheader" aria-label={labels.timeline} className="ow-gantt__timeline" style={{ width }}>
                                <div className="ow-gantt__tier">
                                    {top.map((segment) => (
                                        <span
                                            key={segment.key}
                                            className="ow-gantt__segment"
                                            style={{ insetInlineStart: segment.offset * dayWidth, width: segment.length * dayWidth }}
                                        >
                                            <span className="ow-gantt__segment-text">{segment.label}</span>
                                        </span>
                                    ))}
                                </div>
                                <div className="ow-gantt__tier ow-gantt__tier--fine">
                                    {bottom.map((segment) => {
                                        const weekend = scale === "day" && weekends.includes(segment.offset);
                                        return (
                                            <span
                                                key={segment.key}
                                                className={cx("ow-gantt__segment", weekend && "ow-gantt__segment--weekend")}
                                                style={{ insetInlineStart: segment.offset * dayWidth, width: segment.length * dayWidth }}
                                            >
                                                <span className="ow-gantt__segment-text">{segment.label}</span>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        {rows.map((row) => {
                            if (row.kind === "group") {
                                return (
                                    <div key={`group:${String(row.group.id)}`} role="row" className="ow-gantt__row ow-gantt__row--group">
                                        <div role="gridcell" aria-colspan={2} className="ow-gantt__title ow-gantt__title--group">
                                            <span className="ow-gantt__swatch" style={{ background: row.color }} aria-hidden="true" />
                                            {row.group.title}
                                        </div>
                                    </div>
                                );
                            }
                            const { task } = row;
                            const index = keys.indexOf(task.id);
                            const span = shownDays(task);
                            const isDragging = drag?.id === task.id;
                            const left = x(span.start);
                            const barWidth = (daysBetween(span.start, span.end) + 1) * dayWidth;
                            const inRange = span.end >= first && span.start <= last;
                            const progress = task.progress === undefined ? undefined : clamp(task.progress, 0, 1);
                            return (
                                <div key={task.id} role="row" className="ow-gantt__row">
                                    <div role="gridcell" className="ow-gantt__title">
                                        <span className="ow-gantt__title-text">{task.title}</span>
                                    </div>
                                    <div className="ow-gantt__track" style={{ width }}>
                                        {inRange ? (
                                            <div
                                                data-key={String(task.id)}
                                                className={cx(
                                                    "ow-gantt__bar",
                                                    task.milestone && "ow-gantt__bar--milestone",
                                                    isDragging && "ow-gantt__bar--dragging",
                                                    (onTaskClick || task.href) && "ow-gantt__bar--clickable",
                                                )}
                                                role="gridcell"
                                                tabIndex={task.id === tabStop ? 0 : -1}
                                                aria-label={nameOf(task, span)}
                                                aria-describedby={editable ? descriptionId : undefined}
                                                style={
                                                    task.milestone
                                                        ? ({ insetInlineStart: left + dayWidth / 2, "--ow-gantt-color": row.color } as CSSProperties)
                                                        : ({ insetInlineStart: left, width: barWidth, "--ow-gantt-color": row.color } as CSSProperties)
                                                }
                                                onFocus={(event) => {
                                                    if (event.target !== event.currentTarget) return;
                                                    setActive(task.id);
                                                    if (event.currentTarget.matches(":focus-visible") && !dragRef.current) {
                                                        anchorRef.current = event.currentTarget;
                                                        setTip(task.id);
                                                    }
                                                }}
                                                onBlur={onBlur}
                                                onPointerEnter={(event) => {
                                                    if (dragRef.current) return;
                                                    anchorRef.current = event.currentTarget;
                                                    setTip(task.id);
                                                }}
                                                onPointerLeave={() => setTip(null)}
                                                onPointerDown={(event) => onPointerDown(event, task, "move")}
                                                onKeyDown={(event) => onKeyDown(event, task, index)}
                                                onClick={(event) => {
                                                    if (onTaskClick && !(event.target as Element).closest("a")) onTaskClick(task);
                                                }}
                                            >
                                                {task.milestone ? (
                                                    <span className="ow-gantt__diamond" aria-hidden="true" />
                                                ) : (
                                                    <>
                                                        {progress !== undefined ? (
                                                            <span className="ow-gantt__progress" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
                                                        ) : null}
                                                        {editable ? (
                                                            <>
                                                                <span
                                                                    className="ow-gantt__handle ow-gantt__handle--start"
                                                                    onPointerDown={(event) => onPointerDown(event, task, "start")}
                                                                />
                                                                <span
                                                                    className="ow-gantt__handle ow-gantt__handle--end"
                                                                    onPointerDown={(event) => onPointerDown(event, task, "end")}
                                                                />
                                                            </>
                                                        ) : null}
                                                    </>
                                                )}
                                                <span className={cx("ow-gantt__bar-text", task.milestone && "ow-gantt__bar-text--beside")}>
                                                    {task.href ? (
                                                        <a href={task.href} tabIndex={-1} className="ow-gantt__link" draggable={false}>
                                                            {renderTask ? renderTask(task, { width: barWidth, isDragging }) : task.title}
                                                        </a>
                                                    ) : renderTask ? (
                                                        renderTask(task, { width: barWidth, isDragging })
                                                    ) : (
                                                        task.title
                                                    )}
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Over the rows, under the titles: the arrows and the today line. */}
                    {arrows.length ? (
                        <svg
                            className="ow-gantt__arrows"
                            style={{ insetInlineStart: labelPx, top: headHeight }}
                            width={width}
                            height={bodyHeight}
                            aria-hidden="true"
                        >
                            <defs>
                                <marker id={`${baseId}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                    <path d="M0 0 L8 4 L0 8 Z" />
                                </marker>
                            </defs>
                            {arrows.map((arrow) => (
                                <path key={arrow.key} d={arrow.d} markerEnd={`url(#${baseId}-arrow)`} />
                            ))}
                        </svg>
                    ) : null}
                    {showToday ? (
                        <span
                            className="ow-gantt__today"
                            style={{ insetInlineStart: labelPx + x(todayISODate) + dayWidth / 2, top: headHeight - 8, height: bodyHeight + 8 }}
                            title={labels.today}
                            aria-hidden="true"
                        />
                    ) : null}
                </div>
            </div>
            {editable ? (
                <span id={descriptionId} hidden>
                    {labels.instructions}
                </span>
            ) : null}
            <span className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {message}
            </span>
            {tipTask ? (
                <span ref={bubbleRef} {...manualPopover} data-state="open" className="ow-tooltip__bubble ow-floating ow-gantt__tip" aria-hidden="true">
                    <strong>{tipTask.title}</strong>
                    <span>{rangeOf(shownDays(tipTask), tipTask.milestone)}</span>
                    {tipTask.progress !== undefined && !tipTask.milestone ? <span>{labels.done(Math.round(clamp(tipTask.progress, 0, 1) * 100))}</span> : null}
                </span>
            ) : null}
        </div>
    );
}
