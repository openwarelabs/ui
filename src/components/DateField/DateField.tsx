import { forwardRef, useMemo, useRef, useState, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { todayISO, type ISODate } from "../Calendar/dates";
import { localeDigits, SegmentedField, type Part, type Segment, type SegmentValues } from "./SegmentedField";

export interface DateFieldProps {
    /** The date as "YYYY-MM-DD", or "" while any part is empty. */
    value?: ISODate;
    /** @default "" */
    defaultValue?: ISODate;
    /** Called with "YYYY-MM-DD" when the date is complete and whenever it changes after that, and with "" when a part is cleared. */
    onChange?(value: ISODate): void;
    /** The earliest valid date, "YYYY-MM-DD". An earlier one shows the field as invalid. */
    min?: ISODate;
    /** The latest valid date, "YYYY-MM-DD". A later one shows the field as invalid. */
    max?: ISODate;
    /** The order of day, month and year and the separators between them follow this locale: dd/mm/yyyy in "en-IE",
     * mm/dd/yyyy in "en-US", dd.mm.yyyy in "de-CH". Defaults to the browser's. */
    locale?: string;
    /** sm 32px for toolbars and settings rows, md 40px in forms.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows the field as wrong: a red border, and a red halo when focused. Also sets aria-invalid. A date outside
     * min and max does this by itself.
     * @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** The date can be focused and read but not changed.
     * @default false */
    readOnly?: boolean;
    /** The form field name: a hidden input carries the "YYYY-MM-DD" value. */
    name?: string;
    /** Inside the field, before the date: a 16px calendar icon. */
    startContent?: ReactNode;
    /** Goes on the group. Field sets it, and its label then names the group and focuses the first segment when clicked. */
    id?: string;
    /** Names the date for screen readers when there's no visible label. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    /** Field points it at its hint and error; each segment is described by them. */
    "aria-describedby"?: string;
    className?: string;
}

type DateParts = { day?: number | undefined; month?: number | undefined; year?: number | undefined };

const pad = (n: number, length = 2) => String(n).padStart(length, "0");
const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** Days in a month (1–12); with no month, 31, and with no year, February has 29. */
function daysIn(year: number | undefined, month: number | undefined): number {
    if (month === undefined) return 31;
    if (month === 2) return year === undefined || isLeapYear(year) ? 29 : 28;
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function fromISO(iso: string): DateParts {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!match) return {};
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysIn(year, month)) return {};
    return { year, month, day };
}

function toISOValue({ day, month, year }: DateParts): ISODate {
    return day === undefined || month === undefined || year === undefined ? "" : `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

/** A day past the end of the month (31 when February is chosen) becomes its last day. */
function constrain(parts: DateParts): DateParts {
    const last = daysIn(parts.year, parts.month);
    return parts.day !== undefined && parts.day > last ? { ...parts, day: last } : parts;
}

type DateLayout = Array<{ type: "day" | "month" | "year" } | { type: "literal"; text: string }>;

/** The order of day, month and year and the separators between them, from the locale's short numeric date. */
function dateLayout(locale: string | undefined): DateLayout {
    const format = new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" });
    const layout: DateLayout = [];
    for (const part of format.formatToParts(new Date(Date.UTC(2026, 10, 23)))) {
        if (part.type === "day" || part.type === "month" || part.type === "year") layout.push({ type: part.type });
        else if (part.type === "literal") layout.push({ type: "literal", text: part.value });
    }
    return layout;
}

/**
 * A date typed into day, month and year segments in the locale's order, like macOS's date fields. Each segment
 * takes digits and moves on when it's full; the arrow keys step it. Pair it with a Calendar in a Popover, or use
 * DatePicker, when people would rather pick from a month.
 */
export const DateField = forwardRef<HTMLDivElement, DateFieldProps>(function DateField(
    {
        value,
        defaultValue = "",
        onChange,
        min,
        max,
        locale,
        size = "md",
        isInvalid = false,
        disabled = false,
        readOnly = false,
        name,
        startContent,
        id,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        className,
    },
    ref,
) {
    const [current, setCurrent] = useControllableState<ISODate>(value, defaultValue, onChange);
    // The segments can hold a date that isn't complete yet; the value is "" until it is.
    const [parts, setParts] = useState<DateParts>(() => fromISO(current));
    const partsRef = useRef(parts);
    partsRef.current = parts;
    const [synced, setSynced] = useState(current);
    if (current !== synced) {
        setSynced(current);
        if (current !== toISOValue(parts)) setParts(fromISO(current));
    }

    function update(changes: SegmentValues) {
        const next = constrain({ ...partsRef.current, ...changes });
        partsRef.current = next;
        setParts(next);
        setCurrent(toISOValue(next));
    }

    const formats = useMemo(() => {
        const two = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
        const four = new Intl.NumberFormat(locale, { minimumIntegerDigits: 4, useGrouping: false });
        const month = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" });
        const months = Array.from({ length: 12 }, (_, index) => month.format(new Date(Date.UTC(2026, index, 1))));
        return { two, four, months, digits: localeDigits(locale), layout: dateLayout(locale) };
    }, [locale]);

    // Up or Down on an empty segment starts from today, or the nearest date min and max allow.
    let reference = todayISO();
    if (min && reference < min) reference = min;
    if (max && reference > max) reference = max;
    const start = fromISO(reference);
    const lastDay = daysIn(parts.year, parts.month);

    const segments: Record<"day" | "month" | "year", Segment> = {
        day: {
            type: "day",
            label: "Day",
            value: parts.day,
            min: 1,
            max: lastDay,
            placeholder: "dd",
            format: (n) => formats.two.format(n),
            describe: String,
            start: Math.min(start.day ?? 1, lastDay),
            page: 7,
            wrap: true,
            width: 2,
        },
        month: {
            type: "month",
            label: "Month",
            value: parts.month,
            min: 1,
            max: 12,
            placeholder: "mm",
            format: (n) => formats.two.format(n),
            describe: (n) => `${n} – ${formats.months[n - 1]}`,
            start: start.month ?? 1,
            page: 2,
            wrap: true,
            width: 2,
        },
        year: {
            type: "year",
            label: "Year",
            value: parts.year,
            min: 1,
            max: 9999,
            placeholder: "yyyy",
            format: (n) => formats.four.format(n),
            describe: String,
            start: start.year ?? 2026,
            page: 5,
            wrap: false,
            deferTyping: true,
            width: 4,
        },
    };
    const layout: Part[] = formats.layout.map((part) => (part.type === "literal" ? part : segments[part.type]));

    const outOfRange = current !== "" && ((min !== undefined && current < min) || (max !== undefined && current > max));

    return (
        <SegmentedField
            parts={layout}
            value={current}
            onSegmentsChange={update}
            parsePaste={(text) => (/^\d{4}-\d{2}-\d{2}$/.test(text) && toISOValue(fromISO(text)) ? fromISO(text) : null)}
            digits={formats.digits}
            forwardedRef={ref}
            id={id}
            name={name}
            size={size}
            isInvalid={isInvalid || outOfRange}
            disabled={disabled}
            readOnly={readOnly}
            startContent={startContent}
            className={className}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
        />
    );
});
