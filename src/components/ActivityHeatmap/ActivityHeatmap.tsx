import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type SyntheticEvent } from "react";

import { addDays, addMonths, clampDate, toDate, todayISO, weekday, type ISODate } from "@/components/Calendar/dates";
import { colorOf } from "@/components/Chart/chartUtils";
import { manualPopover } from "@/hooks/useFloating";
import { cx } from "@/utils/cx";
import type { ActivityHeatmapLabels, ActivityHeatmapProps, LocaleWeekInfo } from "./ActivityHeatmap.types";

export type { ActivityHeatmapDay, ActivityHeatmapLabels, ActivityHeatmapProps } from "./ActivityHeatmap.types";

/** The locale's first day of the week, where the browser knows it: Monday (1) or Sunday (0, for anything but Monday). */
function localeWeekStart(locale: string | undefined): 0 | 1 {
    try {
        const info = new Intl.Locale(new Intl.DateTimeFormat(locale).resolvedOptions().locale) as unknown as LocaleWeekInfo;
        const week = info.getWeekInfo?.() ?? info.weekInfo;
        if (week) return week.firstDay === 1 ? 1 : 0;
    } catch {
        // No Intl.Locale: fall back to Monday, as Calendar does.
    }
    return 1;
}

const utc = (locale: string | undefined, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" });

function defaultLabels(locale: string | undefined): Required<ActivityHeatmapLabels> {
    const number = new Intl.NumberFormat(locale);
    return {
        count: (count) => (count === 0 ? "No contributions" : count === 1 ? "1 contribution" : `${number.format(count)} contributions`),
        day: (count, date) => `${count} on ${date}`,
        summary: (total, busiest) => `${total} in total.${busiest ? ` The busiest day was ${busiest.date}, with ${busiest.count}.` : ""}`,
        less: "Less",
        more: "More",
    };
}

/**
 * A GitHub-style calendar of daily counts: a column per week, a row per weekday, each day shaded by its count.
 * It's a grid with one focusable day: the arrow keys move by day and week, and each day is read out in full,
 * with a tooltip showing the number. It scrolls sideways inside itself, starting at the latest week.
 */
export function ActivityHeatmap({
    data,
    label,
    start,
    end,
    weekStartsOn,
    levels = 5,
    thresholds,
    color = 1,
    locale,
    formatTooltip,
    onDayClick,
    cellSize = 12,
    showLegend = true,
    labels: labelsProp,
    className,
}: ActivityHeatmapProps) {
    const last = end ?? todayISO();
    const first = clampDate(start ?? addDays(last, -364), undefined, last);
    const weekStart = weekStartsOn ?? localeWeekStart(locale);
    const labels = { ...defaultLabels(locale), ...labelsProp };
    const summaryId = useId();
    const scrollRef = useRef<HTMLDivElement>(null);
    const bubbleRef = useRef<HTMLSpanElement>(null);
    const anchorRef = useRef<HTMLElement | null>(null);
    const [focused, setFocused] = useState<ISODate | null>(null);
    const [tip, setTip] = useState<ISODate | null>(null);
    const current = clampDate(focused ?? last, first, last);

    const formats = useMemo(
        () => ({
            full: utc(locale, { dateStyle: "full" }),
            short: utc(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
            month: utc(locale, { month: "short" }),
            weekday: utc(locale, { weekday: "short" }),
        }),
        [locale],
    );

    // A column per week, from the week `first` falls in to the one `last` does.
    const weeks = useMemo(() => {
        const columns: ISODate[] = [];
        for (let day = addDays(first, -((weekday(first) - weekStart + 7) % 7)); day <= last; day = addDays(day, 7)) columns.push(day);
        return columns;
    }, [first, last, weekStart]);

    const { counts, total, busiest } = useMemo(() => {
        const counts = new Map<ISODate, number>();
        for (const { date, count } of data) {
            if (date >= first && date <= last && Number.isFinite(count)) counts.set(date, (counts.get(date) ?? 0) + count);
        }
        let total = 0;
        let busiest: ISODate | undefined;
        for (const [date, count] of counts) {
            total += count;
            if (count > 0 && (!busiest || count > counts.get(busiest)! || (count === counts.get(busiest) && date < busiest))) busiest = date;
        }
        return { counts, total, busiest };
    }, [data, first, last]);

    // Shades above empty: one per threshold, or `levels - 1` equal steps up to the busiest day.
    const shades = thresholds?.length || Math.max(1, levels - 1);
    const most = busiest ? counts.get(busiest)! : 1;
    const levelOf = (count: number) =>
        thresholds ? thresholds.filter((low) => count >= low).length : count <= 0 ? 0 : Math.min(shades, Math.ceil((count / most) * shades));
    const mix = (level: number) => ({ "--ow-heatmap-mix": `${Math.round((level / shades) * 100)}%` }) as CSSProperties;

    const countOf = (date: ISODate) => counts.get(date) ?? 0;
    const summary = labels.summary(
        labels.count(total),
        busiest ? { date: formats.full.format(toDate(busiest)), count: labels.count(countOf(busiest)) } : undefined,
    );

    // Month names over the columns: a month starts at the first week that begins in it.
    const months: Array<{ key: string; span: number; name: string }> = [];
    weeks.forEach((week) => {
        const day = week < first ? first : week;
        const key = day.slice(0, 7);
        const previous = months[months.length - 1];
        if (previous?.key === key) previous.span += 1;
        else months.push({ key, span: 1, name: formats.month.format(toDate(day)) });
    });

    // Start at the latest week, and again when the range changes.
    useLayoutEffect(() => {
        const scroller = scrollRef.current;
        if (!scroller) return;
        scroller.scrollLeft = getComputedStyle(scroller).direction === "rtl" ? -scroller.scrollWidth : scroller.scrollWidth;
    }, [first, last]);

    // The tooltip sits in the top layer above its day (below, when there's no room), so the scroll area can't clip it.
    // It follows its day when the page or the grid scrolls.
    useLayoutEffect(() => {
        const bubble = bubbleRef.current;
        if (!tip || !bubble) return;
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

    const dayOf = (event: SyntheticEvent) => (event.target as Element).closest<HTMLElement>("[data-date]");
    const show = (element: HTMLElement) => {
        anchorRef.current = element;
        setTip(element.dataset.date!);
    };

    function onKeyDown(event: KeyboardEvent<HTMLTableElement>) {
        const element = dayOf(event);
        if (!element) return;
        if (event.key === "Escape") {
            if (tip) setTip(null);
            return;
        }
        const date = element.dataset.date!;
        const week = getComputedStyle(event.currentTarget).direction === "rtl" ? -7 : 7;
        const day = (weekday(date) - weekStart + 7) % 7;
        const moves: Record<string, () => ISODate> = {
            ArrowUp: () => addDays(date, -1),
            ArrowDown: () => addDays(date, 1),
            ArrowLeft: () => addDays(date, -week),
            ArrowRight: () => addDays(date, week),
            Home: () => (event.ctrlKey || event.metaKey ? first : addDays(date, -day)),
            End: () => (event.ctrlKey || event.metaKey ? last : addDays(date, 6 - day)),
            PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        const next = clampDate(move(), first, last);
        setFocused(next);
        event.currentTarget.querySelector<HTMLElement>(`[data-date="${next}"]`)?.focus();
    }

    const tipDay = tip ? { date: tip, count: countOf(tip) } : null;

    return (
        <div className={cx("ow-heatmap", className)} style={{ "--ow-heatmap-color": colorOf(color, 0), "--ow-heatmap-cell": `${cellSize}px` } as CSSProperties}>
            <p id={summaryId} className="ow-visually-hidden">
                {summary}
            </p>
            <div ref={scrollRef} className="ow-heatmap__scroll">
                <table
                    role="grid"
                    className="ow-heatmap__grid"
                    aria-label={label}
                    aria-describedby={summaryId}
                    onKeyDown={onKeyDown}
                    onFocus={(event) => {
                        const element = dayOf(event);
                        if (!element) return;
                        setFocused(element.dataset.date!);
                        if (element.matches(":focus-visible")) show(element);
                    }}
                    onBlur={() => setTip(null)}
                    onPointerOver={(event) => {
                        const element = dayOf(event);
                        if (element) show(element);
                        else setTip(null);
                    }}
                    onPointerLeave={() => setTip(null)}
                    onClick={(event) => {
                        const date = onDayClick && dayOf(event)?.dataset.date;
                        if (date) onDayClick({ date, count: countOf(date) });
                    }}
                >
                    <thead>
                        <tr>
                            <td />
                            {months.map((month) =>
                                month.span > 1 ? (
                                    <th key={month.key} scope="colgroup" colSpan={month.span} className="ow-heatmap__month">
                                        <span>{month.name}</span>
                                    </th>
                                ) : (
                                    <td key={month.key} />
                                ),
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 7 }, (_, row) => {
                            const rowDay = addDays(weeks[0]!, row);
                            // Like GitHub, only Monday, Wednesday and Friday are written; the rest are there for screen readers.
                            const written = [1, 3, 5].includes(weekday(rowDay));
                            return (
                                <tr key={row}>
                                    <th scope="row" className="ow-heatmap__weekday">
                                        <span className={written ? undefined : "ow-visually-hidden"}>{formats.weekday.format(toDate(rowDay))}</span>
                                    </th>
                                    {weeks.map((week) => {
                                        const date = addDays(week, row);
                                        if (date < first || date > last) return <td key={date} className="ow-heatmap__cell" />;
                                        const count = countOf(date);
                                        const day = {
                                            "data-date": date,
                                            tabIndex: date === current ? 0 : -1,
                                            "aria-label": labels.day(labels.count(count), formats.full.format(toDate(date))),
                                        };
                                        return (
                                            <td key={date} className="ow-heatmap__cell" style={mix(levelOf(count))} {...(onDayClick ? {} : day)}>
                                                {onDayClick ? (
                                                    <button type="button" className="ow-heatmap__day" {...day} />
                                                ) : (
                                                    <span className="ow-heatmap__day" />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {showLegend ? (
                <div className="ow-heatmap__legend" aria-hidden="true">
                    {labels.less}
                    {Array.from({ length: shades + 1 }, (_, level) => (
                        <span key={level} className="ow-heatmap__day" style={mix(level)} />
                    ))}
                    {labels.more}
                </div>
            ) : null}
            {tipDay ? (
                <span ref={bubbleRef} {...manualPopover} data-state="open" className="ow-tooltip__bubble ow-floating" aria-hidden="true">
                    {formatTooltip ? formatTooltip(tipDay) : labels.day(labels.count(tipDay.count), formats.short.format(toDate(tipDay.date)))}
                </span>
            ) : null}
        </div>
    );
}
