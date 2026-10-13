import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent, type Ref } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { addDays, addMonths, clampDate, formatDate, monthIndex, monthWeeks, parseISO, startOfMonth, todayISO, toISO, weekday, type ISODate } from "./dates";

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

    const focusFrame = useRef(0);
    useEffect(() => {
        if (!shouldFocus) return;
        setShouldFocus(false);
        const focusDay = () => gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
        focusDay();
        // A popover (DatePicker's) is hidden for its first frame while it's placed, and can't take focus until it shows.
        if (!gridRef.current?.contains(document.activeElement)) focusFrame.current = requestAnimationFrame(focusDay);
    }, [shouldFocus, focused]);
    useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);

    const { year, month } = parseISO(focused);
    const first = toISO(year, month, 1);
    const slide = useSlide(monthIndex(first));

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

    return (
        <div className={cx("ow-calendar", className)}>
            <MonthHeader
                month={first}
                locale={locale}
                slide={slide}
                previous={{ disabled: !canShowBefore(first, min), onClick: () => setFocused(clampDate(addMonths(focused, -1), min, max)) }}
                next={{ disabled: !canShowAfter(first, max), onClick: () => setFocused(clampDate(addMonths(focused, 1), min, max)) }}
            />
            <MonthGrid
                gridRef={gridRef}
                month={first}
                focused={focused}
                today={today}
                locale={locale}
                weekStartsOn={weekStartsOn}
                slide={slide}
                isDisabled={isDisabled}
                isSelected={(date) => date === selected}
                isFilled={(date) => date === selected}
                onChoose={choose}
                onDayKeyDown={(event, date) => {
                    const target = dateForKey(event, date, weekStartsOn);
                    if (target === undefined) return;
                    event.preventDefault();
                    moveTo(target);
                }}
                onDayFocus={(date) => date !== focused && setFocused(date)}
            />
        </div>
    );
});

// The pieces below are shared with RangeCalendar, which shows the same month grid.

/** Whether the month before `first` has a day on or after `min`. */
export function canShowBefore(first: ISODate, min: ISODate | undefined): boolean {
    return !min || addDays(first, -1) >= min;
}

/** Whether the month after `last` (the first of the last month shown) has a day on or before `max`. */
export function canShowAfter(last: ISODate, max: ISODate | undefined): boolean {
    return !max || addMonths(last, 1) <= max;
}

/** Where a key moves the focus from `date`: a day, a week, the week's ends, a month (with Shift, a year). */
export function dateForKey(event: KeyboardEvent<HTMLElement>, date: ISODate, weekStartsOn: 0 | 1): ISODate | undefined {
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
    return moves[event.key]?.();
}

/** Which way the month changed since the last render, so the new one slides in from that side. */
export function useSlide(month: number): "next" | "previous" | undefined {
    const slide = useRef<{ month: number; direction?: "next" | "previous" }>({ month });
    if (slide.current.month !== month) {
        slide.current = { month, direction: month > slide.current.month ? "next" : "previous" };
    }
    return slide.current.direction;
}

interface MonthNavButton {
    disabled: boolean;
    onClick(): void;
}

export interface MonthHeaderProps {
    /** The first day of the month shown. */
    month: ISODate;
    locale?: string;
    slide?: "next" | "previous";
    /** The previous-month button, or null for an empty space of the same size. */
    previous: MonthNavButton | null;
    /** The next-month button, or null for an empty space of the same size. */
    next: MonthNavButton | null;
}

/** The month's name between the previous- and next-month buttons. */
export function MonthHeader({ month, locale, slide, previous, next }: MonthHeaderProps) {
    const monthLabel = (date: ISODate) => formatDate(date, locale, { month: "long", year: "numeric" });
    return (
        <div className="ow-calendar__header">
            {previous ? (
                <button
                    type="button"
                    className="ow-calendar__nav"
                    aria-label={`Previous month, ${monthLabel(addMonths(month, -1))}`}
                    disabled={previous.disabled}
                    onClick={previous.onClick}
                >
                    <ChevronLeftIcon size={16} />
                </button>
            ) : (
                <span className="ow-calendar__nav-space" />
            )}
            <h2 className="ow-calendar__title" aria-live="polite">
                <span key={monthIndex(month)} className={cx("ow-calendar__title-text", slide && `ow-calendar__slide--${slide}`)}>
                    {monthLabel(month)}
                </span>
            </h2>
            {next ? (
                <button
                    type="button"
                    className="ow-calendar__nav"
                    aria-label={`Next month, ${monthLabel(addMonths(month, 1))}`}
                    disabled={next.disabled}
                    onClick={next.onClick}
                >
                    <ChevronRightIcon size={16} />
                </button>
            ) : (
                <span className="ow-calendar__nav-space" />
            )}
        </div>
    );
}

export interface MonthGridProps {
    /** The first day of the month shown. */
    month: ISODate;
    /** The day that takes Tab focus (roving tabindex). */
    focused: ISODate;
    today: ISODate;
    locale?: string;
    weekStartsOn: 0 | 1;
    slide?: "next" | "previous";
    /** Leaves the days of the months either side empty, for months shown side by side. */
    hideOutsideDays?: boolean;
    isDisabled(date: ISODate): boolean;
    /** aria-selected on the day's cell. */
    isSelected(date: ISODate): boolean;
    /** Fills the day with the primary colour. */
    isFilled(date: ISODate): boolean;
    /** Extra classes for a day's cell; `column` is 0 to 6 across the week. */
    cellClassName?(date: ISODate, column: number): string | undefined;
    /** Extra classes for a day's button. */
    dayClassName?(date: ISODate): string | undefined;
    /** Extra attributes for a day's button. */
    dayProps?(date: ISODate): { "aria-describedby"?: string };
    onChoose(date: ISODate): void;
    onDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: ISODate): void;
    onDayFocus(date: ISODate): void;
    onDayPointerEnter?(date: ISODate): void;
    gridRef?: Ref<HTMLTableElement>;
}

/** One month as a grid of day buttons: six weeks, weekday names above, each day read out in full. */
export function MonthGrid({
    month,
    focused,
    today,
    locale,
    weekStartsOn,
    slide,
    hideOutsideDays = false,
    isDisabled,
    isSelected,
    isFilled,
    cellClassName,
    dayClassName,
    dayProps,
    onChoose,
    onDayKeyDown,
    onDayFocus,
    onDayPointerEnter,
    gridRef,
}: MonthGridProps) {
    const first = startOfMonth(month);
    const { month: monthNumber } = parseISO(first);
    const weeks = useMemo(() => monthWeeks(first, weekStartsOn), [first, weekStartsOn]);
    const weekdayNames = weeks[0]!.map((date) => ({
        short: formatDate(date, locale, { weekday: "short" }),
        long: formatDate(date, locale, { weekday: "long" }),
    }));

    return (
        <table ref={gridRef} role="grid" className="ow-calendar__grid" aria-label={formatDate(first, locale, { month: "long", year: "numeric" })}>
            <thead>
                <tr>
                    {weekdayNames.map((name) => (
                        <th key={name.long} scope="col" abbr={name.long} className="ow-calendar__weekday">
                            {name.short.slice(0, 2)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody key={monthIndex(first)} className={cx(slide && `ow-calendar__slide--${slide}`)}>
                {weeks.map((week) => (
                    <tr key={week[0]}>
                        {week.map((date, column) => {
                            const inMonth = parseISO(date).month === monthNumber;
                            if (!inMonth && hideOutsideDays) return <td key={date} role="gridcell" className="ow-calendar__cell" />;
                            const selected = isSelected(date);
                            const disabled = isDisabled(date);
                            return (
                                <td key={date} role="gridcell" aria-selected={selected} className={cx("ow-calendar__cell", cellClassName?.(date, column))}>
                                    <button
                                        type="button"
                                        tabIndex={date === focused ? 0 : -1}
                                        aria-label={formatDate(date, locale, { dateStyle: "full" })}
                                        aria-current={date === today ? "date" : undefined}
                                        aria-disabled={disabled || undefined}
                                        {...dayProps?.(date)}
                                        className={cx(
                                            "ow-calendar__day",
                                            {
                                                "ow-calendar__day--outside": !inMonth,
                                                "ow-calendar__day--selected": isFilled(date),
                                                "ow-calendar__day--today": date === today,
                                                "ow-calendar__day--disabled": disabled,
                                            },
                                            dayClassName?.(date),
                                        )}
                                        onClick={() => onChoose(date)}
                                        onKeyDown={(event) => onDayKeyDown(event, date)}
                                        // A day from the next or previous month doesn't turn the page when it takes focus from a click,
                                        // or the button would move out from under the pointer and the click would be lost; choosing it does.
                                        onFocus={() => inMonth && onDayFocus(date)}
                                        onPointerEnter={onDayPointerEnter ? () => onDayPointerEnter(date) : undefined}
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
    );
}
