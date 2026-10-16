import { forwardRef, useMemo, useRef, useState } from "react";

import { useControllableState } from "@/hooks/useControllableState";

import type { DurationFieldProps, DurationLabels, DurationUnit, DurationUnitEntry } from "./DurationField.types";
import { localeDigits, SegmentedField, type Part, type Segment, type SegmentValues } from "./SegmentedField";

export type { DurationFieldProps, DurationLabels, DurationUnit } from "./DurationField.types";

/** Each unit, largest first, with its segment and its length in seconds. */
const units: DurationUnitEntry[] = [
    { unit: "days", type: "day", seconds: 86400, label: "d", name: "Days", page: 7 },
    { unit: "hours", type: "hour", seconds: 3600, label: "h", name: "Hours", page: 6 },
    { unit: "minutes", type: "minute", seconds: 60, label: "min", name: "Minutes", page: 15 },
    { unit: "seconds", type: "second", seconds: 1, label: "s", name: "Seconds", page: 15 },
];

const wordUnits: Record<string, number> = {
    w: 604800,
    wk: 604800,
    wks: 604800,
    week: 604800,
    weeks: 604800,
    d: 86400,
    day: 86400,
    days: 86400,
    h: 3600,
    hr: 3600,
    hrs: 3600,
    hour: 3600,
    hours: 3600,
    m: 60,
    min: 60,
    mins: 60,
    minute: 60,
    minutes: 60,
    s: 1,
    sec: 1,
    secs: 1,
    second: 1,
    seconds: 1,
};

/** Seconds as an ISO 8601 duration: 5400 is "PT1H30M", 0 is "PT0S", null is "". */
export function formatDuration(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return "";
    const total = Math.abs(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const rest = Number((total % 60).toFixed(3));
    const parts = `${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${rest || (!hours && !minutes) ? `${rest}S` : ""}`;
    return `${seconds < 0 ? "-" : ""}PT${parts}`;
}

/**
 * Reads a duration as seconds: ISO 8601 ("PT1H30M", "P2DT3H"), a clock ("1:30" is an hour and a half, "1:30:15" adds
 * seconds), or words ("1h 30m", "45 min", "2 days 3 hours"). Null when the text isn't one.
 */
export function parseDuration(text: string): number | null {
    const trimmed = text.trim();
    const iso = /^(-)?P(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i.exec(trimmed);
    if (iso) {
        const [, sign, weeks, days, hours, minutes, seconds] = iso;
        if ([weeks, days, hours, minutes, seconds].every((part) => part === undefined)) return null;
        const total = Number(weeks ?? 0) * 604800 + Number(days ?? 0) * 86400 + Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
        return sign ? -total : total;
    }
    const clock = /^(\d+):(\d{1,2})(?::(\d{1,2}))?$/.exec(trimmed);
    if (clock) {
        const [, hours, minutes, seconds] = clock;
        if (Number(minutes) > 59 || Number(seconds ?? 0) > 59) return null;
        return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds ?? 0);
    }
    let total = 0;
    let matched = false;
    const rest = trimmed.toLowerCase().replace(/(\d+(?:\.\d+)?)\s*([a-z]+)/g, (whole, amount: string, unit: string) => {
        const seconds = wordUnits[unit];
        if (seconds === undefined) return whole;
        matched = true;
        total += Number(amount) * seconds;
        return "";
    });
    return matched && /^[\s,]*(and[\s,]*)*$/.test(rest) ? total : null;
}

/** Splits seconds over the segments shown, largest first; what's left under the smallest is dropped. */
function split(total: number, shown: DurationUnitEntry[]): SegmentValues {
    const parts: SegmentValues = {};
    let rest = Math.max(0, Math.round(total));
    for (const entry of shown) {
        const amount = Math.floor(rest / entry.seconds);
        parts[entry.type] = amount;
        rest -= amount * entry.seconds;
    }
    return parts;
}

/** The total of the segments, an empty one counting as 0, or null when every one is empty. */
function toSeconds(parts: SegmentValues, shown: DurationUnitEntry[]): number | null {
    if (shown.every((entry) => parts[entry.type] === undefined)) return null;
    return shown.reduce((sum, entry) => sum + (parts[entry.type] ?? 0) * entry.seconds, 0);
}

function fromSeconds(total: number | null, shown: DurationUnitEntry[]): SegmentValues {
    return total === null ? {} : split(total, shown);
}

/**
 * A length of time typed into segments, one per unit, each followed by its unit: "1 h 30 min". It works like
 * TimeField: digits fill a segment and move on, the arrow keys step it, and the value is the total in seconds.
 */
export const DurationField = forwardRef<HTMLDivElement, DurationFieldProps>(function DurationField(
    {
        value,
        defaultValue = null,
        onChange,
        units: unitsProp,
        step = 1,
        min,
        max,
        labels,
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
    const unitsKey = (unitsProp ?? ["hours", "minutes"]).join(",");
    // Always largest first, whatever order they were given in; with none that fit, hours and minutes.
    const shown = useMemo(() => {
        const wanted = new Set(unitsKey.split(","));
        const picked = units.filter((entry) => wanted.has(entry.unit));
        return picked.length ? picked : units.slice(1, 3);
    }, [unitsKey]);

    const [parts, setParts] = useState<SegmentValues>(() => fromSeconds(current, shown));
    const partsRef = useRef(parts);
    partsRef.current = parts;
    // The segments can hold a duration with empty parts; they're set again from the value when it changes from
    // outside, or when the units change what they show.
    const shape = `${current}|${unitsKey}`;
    const [synced, setSynced] = useState(shape);
    if (shape !== synced) {
        setSynced(shape);
        if (current !== toSeconds(parts, shown) || !synced.endsWith(`|${unitsKey}`)) setParts(fromSeconds(current, shown));
    }

    function update(changes: SegmentValues) {
        const next = { ...partsRef.current, ...changes };
        partsRef.current = next;
        setParts(next);
        setCurrent(toSeconds(next, shown));
    }

    const formats = useMemo(() => {
        const one = new Intl.NumberFormat(locale, { useGrouping: false });
        const two = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
        return { one, two, digits: localeDigits(locale) };
    }, [locale]);

    // Up or Down on an empty segment starts at nothing, or the shortest duration min allows.
    const start = split(min ?? 0, shown);
    const smallest = shown[shown.length - 1]!;
    const unitStep = Math.max(1, Math.round(step));

    const layout: Part[] = [];
    shown.forEach((entry, index) => {
        const largest = index === 0;
        const segment: Segment = {
            type: entry.type,
            label: entry.name,
            value: parts[entry.type],
            min: 0,
            // The largest segment runs on: 999 days, or 99 hours; the others stop where the next unit starts.
            max: largest ? (entry.unit === "days" ? 999 : 99) : entry.unit === "hours" ? 23 : 59,
            placeholder: "––",
            format: (n) => (largest ? formats.one : formats.two).format(n),
            describe: (n) => formats.one.format(n),
            start: start[entry.type] ?? 0,
            step: entry === smallest ? unitStep : undefined,
            page: largest ? 10 : Math.max(entry.page, entry === smallest ? unitStep : 1),
            wrap: !largest,
            width: largest ? undefined : 2,
        };
        layout.push(segment, { type: "literal", text: ` ${labels?.[entry.unit] ?? entry.label}${index < shown.length - 1 ? "  " : ""}` });
    });

    const outOfRange = current !== null && ((min !== undefined && current < min) || (max !== undefined && current > max));

    return (
        <SegmentedField
            parts={layout}
            value={formatDuration(current)}
            onSegmentsChange={update}
            // "1:30" is read in the segments' order (digits go to the segments in turn); words and ISO 8601 by their units.
            parsePaste={(text) => {
                if (/^[\d\s:.,]*$/.test(text)) return null;
                const total = parseDuration(text);
                return total === null ? null : split(total, shown);
            }}
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
