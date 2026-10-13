import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { addDays, addMonths, formatDate, parseISO, todayISO, toISO, weekday, type ISODate } from "./dates";

export interface CalendarProps {
    /** The chosen date as "YYYY-MM-DD", or "" for none. */
    value?: ISODate;
    /** @default "" */
    defaultValue?: ISODate;
    onChange?(value: ISODate): void;
    /** The earliest date that can be chosen, "YYYY-MM-DD". */
    min?: ISODate;
    /** The latest date that can be chosen. */
    max?: ISODate;
    /** Return true for dates that can't be chosen, such as weekends. */
    isDateDisabled?(date: ISODate): boolean;
    /** Month and day names follow this locale, e.g. "en-IE", "de-CH". Defaults to the browser's. */
    locale?: string;
    /** 1 starts weeks on Monday, 0 on Sunday.
     * @default 1 */
    weekStartsOn?: 0 | 1;
    /** Focus the chosen (or today's) date on mount, for use in a popover.
     * @default false */
    autoFocus?: boolean;
    className?: string;
}

export interface CalendarHandle {
    focus(): void;
}

/**
 * A month grid for picking a date. Arrow keys move by day and week, PageUp and PageDown by month
 * (with Shift, by year), Home and End to the week's ends. Today is marked with a brass dot.
 */
export const Calendar = forwardRef<CalendarHandle, CalendarProps>(function Calendar(
    { value, defaultValue = "", onChange, min, max, isDateDisabled, locale, weekStartsOn = 1, autoFocus = false, className },
    ref,
) {
    const [selected, setSelected] = useControllableState(value, defaultValue, onChange);
    const today = todayISO();
    const [focused, setFocused] = useState<ISODate>(() => selected || clampDate(today, min, max));
    const [shouldFocus, setShouldFocus] = useState(autoFocus);
    const gridRef = useRef<HTMLTableElement>(null);

    useImperativeHandle(ref, () => ({ focus: () => setShouldFocus(true) }), []);

    useEffect(() => {
        if (selected) setFocused(selected);
    }, [selected]);

    useEffect(() => {
        if (!shouldFocus) return;
        gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
        setShouldFocus(false);
    }, [shouldFocus, focused]);

    const { year, month } = parseISO(focused);
    const first = toISO(year, month, 1);

    // Which way the month changed, so the new one slides in from that side.
    const monthIndex = year * 12 + month;
    const slide = useRef<{ month: number; direction?: "next" | "previous" }>({ month: monthIndex });
    if (slide.current.month !== monthIndex) {
        slide.current = { month: monthIndex, direction: monthIndex > slide.current.month ? "next" : "previous" };
    }
    const offset = (weekday(first) - weekStartsOn + 7) % 7;
    const gridStart = addDays(first, -offset);
    const weeks = useMemo(() => Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d))), [gridStart]);
    const weekdayNames = weeks[0]!.map((date) => ({
        short: formatDate(date, locale, { weekday: "short" }),
        long: formatDate(date, locale, { weekday: "long" }),
    }));

    const isDisabled = (date: ISODate) => (min !== undefined && date < min) || (max !== undefined && date > max) || Boolean(isDateDisabled?.(date));

    function moveTo(date: ISODate) {
        setFocused(clampDate(date, min, max));
        setShouldFocus(true);
    }

    function choose(date: ISODate) {
        if (isDisabled(date)) return;
        setSelected(date);
        setFocused(date);
    }

    function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: ISODate) {
        const day = (weekday(date) - weekStartsOn + 7) % 7;
        const moves: Record<string, () => ISODate> = {
            ArrowLeft: () => addDays(date, -1),
            ArrowRight: () => addDays(date, 1),
            ArrowUp: () => addDays(date, -7),
            ArrowDown: () => addDays(date, 7),
            Home: () => addDays(date, -day),
            End: () => addDays(date, 6 - day),
            PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
        };
        const move = moves[event.key];
        if (move) {
            event.preventDefault();
            moveTo(move());
        }
    }

    const monthLabel = formatDate(first, locale, { month: "long", year: "numeric" });
    const prevMonth = addMonths(first, -1);
    const nextMonth = addMonths(first, 1);
    const canGoBack = !min || toISO(year, month, 0) >= min;
    const canGoForward = !max || nextMonth <= max;

    return (
        <div className={cx("ow-calendar", className)}>
            <div className="ow-calendar__header">
                <button
                    type="button"
                    className="ow-calendar__nav"
                    aria-label={`Previous month, ${formatDate(prevMonth, locale, { month: "long", year: "numeric" })}`}
                    disabled={!canGoBack}
                    onClick={() => setFocused(clampDate(addMonths(focused, -1), min, max))}
                >
                    <ChevronLeftIcon size={16} />
                </button>
                <h2 className="ow-calendar__title" aria-live="polite">
                    <span
                        key={monthIndex}
                        className={cx("ow-calendar__title-text", slide.current.direction && `ow-calendar__slide--${slide.current.direction}`)}
                    >
                        {monthLabel}
                    </span>
                </h2>
                <button
                    type="button"
                    className="ow-calendar__nav"
                    aria-label={`Next month, ${formatDate(nextMonth, locale, { month: "long", year: "numeric" })}`}
                    disabled={!canGoForward}
                    onClick={() => setFocused(clampDate(addMonths(focused, 1), min, max))}
                >
                    <ChevronRightIcon size={16} />
                </button>
            </div>
            <table ref={gridRef} role="grid" className="ow-calendar__grid" aria-label={monthLabel}>
                <thead>
                    <tr>
                        {weekdayNames.map((name) => (
                            <th key={name.long} scope="col" abbr={name.long} className="ow-calendar__weekday">
                                {name.short.slice(0, 2)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody key={monthIndex} className={cx(slide.current.direction && `ow-calendar__slide--${slide.current.direction}`)}>
                    {weeks.map((week) => (
                        <tr key={week[0]}>
                            {week.map((date) => {
                                const inMonth = parseISO(date).month === month;
                                const isSelected = date === selected;
                                const disabled = isDisabled(date);
                                return (
                                    <td key={date} role="gridcell" aria-selected={isSelected} className="ow-calendar__cell">
                                        <button
                                            type="button"
                                            tabIndex={date === focused ? 0 : -1}
                                            aria-label={formatDate(date, locale, { dateStyle: "full" })}
                                            aria-current={date === today ? "date" : undefined}
                                            aria-disabled={disabled || undefined}
                                            className={cx("ow-calendar__day", {
                                                "ow-calendar__day--outside": !inMonth,
                                                "ow-calendar__day--selected": isSelected,
                                                "ow-calendar__day--today": date === today,
                                                "ow-calendar__day--disabled": disabled,
                                            })}
                                            onClick={() => choose(date)}
                                            onKeyDown={(event) => onKeyDown(event, date)}
                                            onFocus={() => date !== focused && setFocused(date)}
                                        >
                                            {parseISO(date).day}
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

function clampDate(date: ISODate, min: ISODate | undefined, max: ISODate | undefined): ISODate {
    if (min && date < min) return min;
    if (max && date > max) return max;
    return date;
}
