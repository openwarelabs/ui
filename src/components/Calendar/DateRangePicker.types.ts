import type { DateRange, RangeCalendarProps } from "./RangeCalendar";

/** A named range to pick in one go, such as "Last 7 days". */
export interface DateRangePreset {
    /** What the list shows, in sentence case. */
    label: string;
    range: DateRange;
}

export interface DateRangePickerProps extends Omit<RangeCalendarProps, "autoFocus" | "className" | "visibleMonths"> {
    /** Ranges to pick in one go, listed beside the calendar: "Last 7 days", "This month". */
    presets?: DateRangePreset[];
    /** How many months the calendar shows side by side. Phones always get one.
     * @default 2 */
    visibleMonths?: 1 | 2;
    /** Shown when no range is chosen.
     * @default "Pick dates" */
    placeholder?: string;
    /** How each date is written in the field; dates the two ends share are written once, as in "3 – 9 Oct 2026".
     * @default { dateStyle: "medium" } */
    formatOptions?: Intl.DateTimeFormatOptions;
    /** md is 40px tall, sm 32px.
     * @default "md" */
    size?: "sm" | "md";
    /** @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** For the field's button, so a label can point at it. */
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    /** Classes for the field, e.g. a width. */
    className?: string;
}
