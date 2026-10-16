import type { ReactNode } from "react";

/** A start and an end time on a 24-hour clock, "HH:MM" (or "HH:MM:SS"); null while that end is empty. */
export interface TimeRange {
    start: string | null;
    end: string | null;
}

export interface TimeRangeFieldLabels {
    /** Names the first time for screen readers.
     * @default "Start" */
    start?: string;
    /** Names the second time for screen readers.
     * @default "End" */
    end?: string;
    /** The word between the two times.
     * @default "to" */
    to?: string;
}

export interface TimeRangeFieldProps {
    /** The two times, each "HH:MM" (or "HH:MM:SS" when granularity is "second") on a 24-hour clock, or null while empty. */
    value?: TimeRange;
    /** @default { start: null, end: null } */
    defaultValue?: TimeRange;
    /** Called whenever either time completes, changes or is cleared. */
    onChange?(value: TimeRange): void;
    /** 12 shows hours 1–12 and an AM/PM segment; 24 shows 00–23. Defaults to the locale's clock. */
    hourCycle?: 12 | 24;
    /** "second" adds a seconds segment to both times.
     * @default "minute" */
    granularity?: "minute" | "second";
    /** Up and Down move the minutes by this much, landing on its multiples: 5, 15.
     * @default 1 */
    minuteStep?: number;
    /** The earliest valid time, "HH:MM", for both ends. An earlier one shows that time as invalid. */
    min?: string;
    /** The latest valid time, "HH:MM", for both ends. A later one shows that time as invalid. */
    max?: string;
    /**
     * Lets the end come before the start, for a range that runs past midnight (22:00 to 06:00). Otherwise an end
     * before the start shows both times as invalid; inside a Form, say why with `validate`.
     * @default false
     */
    allowOvernight?: boolean;
    /** The separators, the AM/PM words and where they go follow this locale. Defaults to the browser's. */
    locale?: string;
    /** sm 32px for toolbars and settings rows, md 40px in forms.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows both times as wrong: a red border, and a red halo when focused. Also sets aria-invalid.
     * @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** The times can be focused and read but not changed.
     * @default false */
    readOnly?: boolean;
    /** The form field name: two hidden inputs carry the times, as `${name}Start` and `${name}End` ("shiftStart", "shiftEnd"). */
    name?: string;
    /** The words screen readers hear for each end, and the one shown between them. */
    labels?: TimeRangeFieldLabels;
    /** Inside each time, before its digits: a 16px clock icon. */
    startContent?: ReactNode;
    /** Goes on the group. Field sets it, and its label then names the group and focuses the first segment when clicked. */
    id?: string;
    /** Names the range for screen readers when there's no visible label. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    /** Field points it at its hint and error; each segment is described by them. */
    "aria-describedby"?: string;
    className?: string;
}
