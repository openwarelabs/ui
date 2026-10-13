import { forwardRef, useMemo, useRef, useState, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { localeDigits, SegmentedField, type Part, type Segment, type SegmentValues } from "./SegmentedField";

export interface TimeFieldProps {
    /** The time on a 24-hour clock, "HH:MM", or "HH:MM:SS" when granularity is "second"; "" while any part is empty. */
    value?: string;
    /** @default "" */
    defaultValue?: string;
    /** Called with "HH:MM" (or "HH:MM:SS") when the time is complete and whenever it changes after that, and with "" when a part is cleared. */
    onChange?(value: string): void;
    /** 12 shows hours 1–12 and an AM/PM segment; 24 shows 00–23. Defaults to the locale's clock. */
    hourCycle?: 12 | 24;
    /** "second" adds a seconds segment.
     * @default "minute" */
    granularity?: "minute" | "second";
    /** Up and Down move the minutes by this much, landing on its multiples: 5, 15. Typed minutes can still be anything.
     * @default 1 */
    minuteStep?: number;
    /** The earliest valid time, "HH:MM". An earlier one shows the field as invalid. */
    min?: string;
    /** The latest valid time, "HH:MM". A later one shows the field as invalid. */
    max?: string;
    /** The separators, the AM/PM words and where they go follow this locale. Defaults to the browser's. */
    locale?: string;
    /** sm 32px for toolbars and settings rows, md 40px in forms.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows the field as wrong: a red border, and a red halo when focused. Also sets aria-invalid. A time outside
     * min and max does this by itself.
     * @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** The time can be focused and read but not changed.
     * @default false */
    readOnly?: boolean;
    /** The form field name: a hidden input carries the "HH:MM" value. */
    name?: string;
    /** Inside the field, before the time: a 16px clock icon. */
    startContent?: ReactNode;
    /** Goes on the group. Field sets it, and its label then names the group and focuses the first segment when clicked. */
    id?: string;
    /** Names the time for screen readers when there's no visible label. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    /** Field points it at its hint and error; each segment is described by them. */
    "aria-describedby"?: string;
    className?: string;
}

type TimeParts = { hour?: number | undefined; minute?: number | undefined; second?: number | undefined; dayPeriod?: number | undefined };

const pad = (n: number) => String(n).padStart(2, "0");

/** "09:30" or "09:30:15" as seconds since midnight, or undefined when it isn't a time. */
function toSeconds(time: string | undefined): number | undefined {
    const match = time ? /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(time) : null;
    if (!match) return undefined;
    const [hour, minute, second] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
    return hour < 24 && minute < 60 && second < 60 ? hour * 3600 + minute * 60 + second : undefined;
}

/** Splits seconds since midnight into the segments as shown: on a 12-hour clock, 1–12 and AM (0) or PM (1). */
function split(total: number, twelve: boolean, seconds: boolean): TimeParts {
    const hour = Math.floor(total / 3600);
    const parts: TimeParts = { hour, minute: Math.floor((total % 3600) / 60), second: seconds ? total % 60 : undefined };
    return twelve ? { ...parts, hour: hour % 12 || 12, dayPeriod: hour >= 12 ? 1 : 0 } : parts;
}

function toTime({ hour, minute, second, dayPeriod }: TimeParts, twelve: boolean, seconds: boolean): string {
    if (hour === undefined || minute === undefined || (seconds && second === undefined) || (twelve && dayPeriod === undefined)) return "";
    const hour24 = twelve ? (hour % 12) + (dayPeriod ? 12 : 0) : hour;
    return `${pad(hour24)}:${pad(minute)}${seconds ? `:${pad(second!)}` : ""}`;
}

function fromTime(time: string, twelve: boolean, seconds: boolean): TimeParts {
    const total = toSeconds(time);
    return total === undefined ? {} : split(total, twelve, seconds);
}

function localeHourCycle(locale: string | undefined): 12 | 24 {
    const options = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();
    if (options.hourCycle) return options.hourCycle === "h11" || options.hourCycle === "h12" ? 12 : 24;
    return options.hour12 ? 12 : 24;
}

type TimeLayout = Array<{ type: "hour" | "minute" | "second" | "dayPeriod" } | { type: "literal"; text: string }>;

/** The order of the segments, the separators and the AM/PM words, from the locale's time format. */
function timeLayout(locale: string | undefined, twelve: boolean, seconds: boolean) {
    const format = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        second: seconds ? "2-digit" : undefined,
        hourCycle: twelve ? "h12" : "h23",
        timeZone: "UTC",
    });
    const periodOf = (hour: number) => format.formatToParts(new Date(Date.UTC(2026, 0, 1, hour))).find((part) => part.type === "dayPeriod")?.value;
    const layout: TimeLayout = [];
    for (const part of format.formatToParts(new Date(Date.UTC(2026, 0, 1, 13, 45, 30)))) {
        if (part.type === "hour" || part.type === "minute" || part.type === "second" || (part.type === "dayPeriod" && twelve)) layout.push({ type: part.type });
        else if (part.type === "literal") layout.push({ type: "literal", text: part.value });
    }
    // Some locales put no AM/PM in a 12-hour time; add it at the end so the time can still be told apart.
    if (twelve && !layout.some((part) => part.type === "dayPeriod")) layout.push({ type: "literal", text: " " }, { type: "dayPeriod" });
    return { layout, am: periodOf(1) ?? "AM", pm: periodOf(13) ?? "PM" };
}

/**
 * A time typed into hour, minute and optional second segments, with AM/PM on a 12-hour clock. It works like
 * DateField: digits fill a segment and move on, the arrow keys step it, and the value is always on a 24-hour clock.
 */
export const TimeField = forwardRef<HTMLDivElement, TimeFieldProps>(function TimeField(
    {
        value,
        defaultValue = "",
        onChange,
        hourCycle,
        granularity = "minute",
        minuteStep = 1,
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
    const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
    const localeCycle = useMemo(() => localeHourCycle(locale), [locale]);
    const twelve = (hourCycle ?? localeCycle) === 12;
    const seconds = granularity === "second";
    const [parts, setParts] = useState<TimeParts>(() => fromTime(current, twelve, seconds));
    const partsRef = useRef(parts);
    partsRef.current = parts;
    // The segments can hold a time that isn't complete yet; they're set again from the value when it changes from
    // outside, or when the clock or granularity changes what they show.
    const shape = `${current}|${twelve}|${seconds}`;
    const [synced, setSynced] = useState(shape);
    if (shape !== synced) {
        setSynced(shape);
        if (current !== toTime(parts, twelve, seconds) || !synced.endsWith(`|${twelve}|${seconds}`)) setParts(fromTime(current, twelve, seconds));
    }

    function update(changes: SegmentValues) {
        const next = { ...partsRef.current, ...changes };
        // An hour typed on a 12-hour clock is AM, as the placeholder shows, until A or P says otherwise.
        if (twelve && changes.hour !== undefined && next.dayPeriod === undefined) next.dayPeriod = 0;
        partsRef.current = next;
        setParts(next);
        setCurrent(toTime(next, twelve, seconds));
    }

    const formats = useMemo(() => {
        const one = new Intl.NumberFormat(locale, { useGrouping: false });
        const two = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
        return { one, two, digits: localeDigits(locale), ...timeLayout(locale, twelve, seconds) };
    }, [locale, twelve, seconds]);

    // Up or Down on an empty segment starts from the current hour, or the nearest time min and max allow.
    const now = new Date();
    let reference = now.getHours() * 3600;
    const minSeconds = toSeconds(min);
    const maxSeconds = toSeconds(max);
    if (minSeconds !== undefined && reference < minSeconds) reference = minSeconds;
    if (maxSeconds !== undefined && reference > maxSeconds) reference = maxSeconds;
    const start = split(reference, twelve, true);
    const step = Math.max(1, Math.min(30, Math.round(minuteStep)));

    const letters: Record<string, number> = { a: 0, p: 1 };
    const amLetter = formats.am.charAt(0).toLowerCase();
    const pmLetter = formats.pm.charAt(0).toLowerCase();
    if (amLetter !== pmLetter) Object.assign(letters, { [amLetter]: 0, [pmLetter]: 1 });

    const segments: Record<"hour" | "minute" | "second" | "dayPeriod", Segment> = {
        hour: {
            type: "hour",
            label: "Hour",
            value: parts.hour,
            min: twelve ? 1 : 0,
            max: twelve ? 12 : 23,
            placeholder: "––",
            // 9:05 AM on a 12-hour clock, 09:05 on a 24-hour one.
            format: (n) => (twelve ? formats.one : formats.two).format(n),
            describe: String,
            start: start.hour ?? 0,
            page: 2,
            wrap: true,
            width: twelve ? undefined : 2,
        },
        minute: {
            type: "minute",
            label: "Minute",
            value: parts.minute,
            min: 0,
            max: 59,
            placeholder: "––",
            format: (n) => formats.two.format(n),
            describe: (n) => formats.two.format(n),
            start: Math.floor((start.minute ?? 0) / step) * step,
            step,
            page: Math.max(15, step),
            wrap: true,
            width: 2,
        },
        second: {
            type: "second",
            label: "Second",
            value: parts.second,
            min: 0,
            max: 59,
            placeholder: "––",
            format: (n) => formats.two.format(n),
            describe: (n) => formats.two.format(n),
            start: start.second ?? 0,
            page: 15,
            wrap: true,
            width: 2,
        },
        dayPeriod: {
            type: "dayPeriod",
            label: "AM/PM",
            value: parts.dayPeriod,
            min: 0,
            max: 1,
            placeholder: formats.am,
            format: (n) => (n ? formats.pm : formats.am),
            describe: (n) => (n ? formats.pm : formats.am),
            start: start.dayPeriod ?? 0,
            page: 1,
            wrap: true,
            letters,
        },
    };
    const layout: Part[] = formats.layout.map((part) => (part.type === "literal" ? part : segments[part.type]));

    const total = toSeconds(current);
    const outOfRange = total !== undefined && ((minSeconds !== undefined && total < minSeconds) || (maxSeconds !== undefined && total > maxSeconds));

    return (
        <SegmentedField
            parts={layout}
            value={current}
            onSegmentsChange={update}
            // "14:30" pastes as a 24-hour time even on a 12-hour clock; "2:30 pm" is read in the segments' order.
            parsePaste={(text) => (/^\d{1,2}:\d{2}(:\d{2})?$/.test(text) && toSeconds(text) !== undefined ? fromTime(text, twelve, seconds) : null)}
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
