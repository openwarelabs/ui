import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { cx } from "../../utils/cx";
import { canShowAfter, canShowBefore, dateForKey, MonthGrid, MonthHeader, useSlide, type CalendarHandle } from "./Calendar";
import { addDays, addMonths, clampDate, formatDate, formatDateRange, monthIndex, parseISO, startOfMonth, todayISO, type ISODate } from "./dates";

/** A range of days, both ends included, as "YYYY-MM-DD". */
export interface DateRange {
    start: ISODate;
    end: ISODate;
}

export interface RangeCalendarProps {
    /** The chosen range, or null for none. */
    value?: DateRange | null;
    /** @default null */
    defaultValue?: DateRange | null;
    /** Called once both ends are picked, with the earlier day as the start. */
    onChange?(range: DateRange | null): void;
    /** The earliest day either end can be, "YYYY-MM-DD". */
    min?: ISODate;
    /** The latest day either end can be. */
    max?: ISODate;
    /** Return true for days that can't be an end of the range, such as weekends. A range can still run across them. */
    isDateDisabled?(date: ISODate): boolean;
    /** Month and day names follow this locale, e.g. "en-IE", "de-CH". Defaults to the browser's. */
    locale?: string;
    /** 1 starts weeks on Monday, 0 on Sunday.
     * @default 1 */
    weekStartsOn?: 0 | 1;
    /** How many months show side by side. Two stack when there isn't room for both.
     * @default 1 */
    visibleMonths?: 1 | 2;
    /** Focus the range's start (or today) on mount, for use in a popover.
     * @default false */
    autoFocus?: boolean;
    className?: string;
}

/**
 * Month grids for picking a range of days. The first pick sets the start and the range follows the pointer or the
 * focus until the second pick sets the end; Escape drops a half-picked range. The keys move as in Calendar.
 */
export const RangeCalendar = forwardRef<CalendarHandle, RangeCalendarProps>(function RangeCalendar(
    { value, defaultValue = null, onChange, min, max, isDateDisabled, locale, weekStartsOn = 1, visibleMonths = 1, autoFocus = false, className },
    ref,
) {
    const months = visibleMonths;
    const [range, setRange] = useControllableState<DateRange | null>(value, defaultValue, onChange);
    const today = todayISO();
    const [focused, setFocused] = useState<ISODate>(() => (range ? ordered(range.start, range.end).start : clampDate(today, min, max)));
    const [firstMonth, setFirstMonth] = useState<ISODate>(() => fitMonths(startOfMonth(focused), months, min, max));
    // The first pick, while the second is still to come.
    const [anchor, setAnchor] = useState<ISODate | null>(null);
    const [hovered, setHovered] = useState<ISODate | null>(null);
    const [announcement, setAnnouncement] = useState("");
    const [shouldFocus, setShouldFocus] = useState(autoFocus);
    const rootRef = useRef<HTMLDivElement>(null);
    // The range this calendar last picked, so picking it doesn't move the view as a new value from outside does.
    const picked = useRef<DateRange | null>(null);
    const rangeId = useId();

    useImperativeHandle(ref, () => ({ focus: () => setShouldFocus(true) }), []);

    const start = range?.start;
    const end = range?.end;
    useEffect(() => {
        if (!start || !end || (picked.current?.start === start && picked.current.end === end)) return;
        picked.current = null;
        const first = ordered(start, end).start;
        setAnchor(null);
        setFocused(first);
        setFirstMonth((current) => monthsShowing(first, current, months, min, max));
        // Only a new range from outside moves the view; min and max don't.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [start, end]);

    // Going from two months to one (a phone turned upright) keeps the focused day in view.
    useEffect(() => {
        setFirstMonth((current) => monthsShowing(focused, current, months, min, max));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [months]);

    const focusFrame = useRef(0);
    useEffect(() => {
        if (!shouldFocus) return;
        setShouldFocus(false);
        const focusDay = () => rootRef.current?.querySelector<HTMLButtonElement>('.ow-calendar__day[tabindex="0"]')?.focus();
        focusDay();
        // A popover is hidden for its first frame while it's placed, and can't take focus until it shows.
        if (!rootRef.current?.contains(document.activeElement)) focusFrame.current = requestAnimationFrame(focusDay);
    }, [shouldFocus, focused, firstMonth]);
    useEffect(() => () => cancelAnimationFrame(focusFrame.current), []);

    const isDisabled = (date: ISODate) => (min !== undefined && date < min) || (max !== undefined && date > max) || Boolean(isDateDisabled?.(date));

    const shown = anchor ? ordered(anchor, hovered ?? focused) : range ? ordered(range.start, range.end) : null;
    const inShown = (date: ISODate) => Boolean(shown && date >= shown.start && date <= shown.end);
    const slide = useSlide(monthIndex(firstMonth));
    const fullDate = (date: ISODate) => formatDate(date, locale, { dateStyle: "full" });
    const fullRange = (dates: DateRange) => formatDateRange(dates.start, dates.end, locale, { dateStyle: "full" });

    function moveTo(date: ISODate) {
        const next = clampDate(date, min, max);
        setFocused(next);
        setFirstMonth((current) => monthsShowing(next, current, months, min, max));
        setHovered(null);
        setShouldFocus(true);
    }

    function showMonths(delta: 1 | -1) {
        const first = addMonths(firstMonth, delta);
        let next = clampDate(addMonths(focused, delta), min, max);
        const offset = monthIndex(next) - monthIndex(first);
        if (offset < 0 || offset >= months) next = clampDate(offset < 0 ? first : addMonths(first, months - 1), min, max);
        setFirstMonth(first);
        setFocused(next);
    }

    function choose(date: ISODate) {
        if (isDisabled(date)) return;
        setFocused(date);
        setHovered(null);
        if (!anchor) {
            setAnchor(date);
            setAnnouncement(`Start: ${fullDate(date)}. Pick the end date.`);
            return;
        }
        const next = ordered(anchor, date);
        setAnchor(null);
        picked.current = next;
        setRange(next);
        setAnnouncement(`Selected ${fullRange(next)}`);
    }

    function cellClassName(date: ISODate, column: number) {
        if (!shown || shown.start === shown.end || !inShown(date)) return undefined;
        const { day } = parseISO(date);
        // Side by side, a month's first and last days end the band too: the days beyond them are blank.
        const monthStart = months > 1 && day === 1;
        const monthEnd = months > 1 && parseISO(addDays(date, 1)).day === 1;
        return cx("ow-range-calendar__cell--in-range", {
            "ow-range-calendar__cell--start": date === shown.start,
            "ow-range-calendar__cell--end": date === shown.end,
            "ow-range-calendar__cell--row-start": column === 0 || monthStart,
            "ow-range-calendar__cell--row-end": column === 6 || monthEnd,
        });
    }

    return (
        <div
            ref={rootRef}
            className={cx("ow-range-calendar", className)}
            onPointerLeave={() => setHovered(null)}
            onKeyDown={(event) => {
                if (event.key !== "Escape" || !anchor) return;
                // Drop the half-picked range, not the popover or dialog around it.
                event.preventDefault();
                event.stopPropagation();
                setAnchor(null);
                setHovered(null);
                setAnnouncement(range ? `Start date cleared. Selected ${fullRange(ordered(range.start, range.end))}` : "Start date cleared");
            }}
        >
            {Array.from({ length: months }, (_, index) => {
                const month = addMonths(firstMonth, index);
                return (
                    <div key={index} className="ow-calendar ow-range-calendar__month">
                        <MonthHeader
                            month={month}
                            locale={locale}
                            slide={slide}
                            previous={index === 0 ? { disabled: !canShowBefore(firstMonth, min), onClick: () => showMonths(-1) } : null}
                            next={index === months - 1 ? { disabled: !canShowAfter(month, max), onClick: () => showMonths(1) } : null}
                        />
                        <MonthGrid
                            month={month}
                            focused={focused}
                            today={today}
                            locale={locale}
                            weekStartsOn={weekStartsOn}
                            slide={slide}
                            hideOutsideDays={months > 1}
                            isDisabled={isDisabled}
                            isSelected={inShown}
                            isFilled={(date) => date === shown?.start || date === shown?.end}
                            cellClassName={cellClassName}
                            dayClassName={(date) =>
                                inShown(date) && date !== shown?.start && date !== shown?.end ? "ow-range-calendar__day--in-range" : undefined
                            }
                            dayProps={(date) => (!anchor && range && (date === shown?.start || date === shown?.end) ? { "aria-describedby": rangeId } : {})}
                            onChoose={choose}
                            onDayKeyDown={(event, date) => {
                                const target = dateForKey(event, date, weekStartsOn);
                                if (target === undefined) return;
                                event.preventDefault();
                                moveTo(target);
                            }}
                            onDayFocus={(date) => date !== focused && setFocused(date)}
                            onDayPointerEnter={(date) => anchor && !isDisabled(date) && setHovered(date)}
                        />
                    </div>
                );
            })}
            {range ? (
                <span id={rangeId} hidden>
                    {`Selected range: ${fullRange(ordered(range.start, range.end))}`}
                </span>
            ) : null}
            <div className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {announcement}
            </div>
        </div>
    );
});

function ordered(a: ISODate, b: ISODate): DateRange {
    return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** Moves the first month shown back so no month wholly after max shows, and forward so none wholly before min does. */
function fitMonths(first: ISODate, months: number, min: ISODate | undefined, max: ISODate | undefined): ISODate {
    let result = first;
    if (max && result > addMonths(startOfMonth(max), 1 - months)) result = addMonths(startOfMonth(max), 1 - months);
    if (min && result < startOfMonth(min)) result = startOfMonth(min);
    return result;
}

/** The first month to show so that `date` is in view, moving as little as it can from `current`. */
function monthsShowing(date: ISODate, current: ISODate, months: number, min: ISODate | undefined, max: ISODate | undefined): ISODate {
    const offset = monthIndex(date) - monthIndex(current);
    if (offset < 0) return fitMonths(startOfMonth(date), months, min, max);
    if (offset >= months) return fitMonths(addMonths(startOfMonth(date), 1 - months), months, min, max);
    return current;
}
