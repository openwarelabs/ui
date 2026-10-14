import type { CalendarProps } from "./Calendar";

export interface DatePickerProps extends Omit<CalendarProps, "autoFocus" | "className"> {
    /** Shown when no date is chosen.
     * @default "Pick a date" */
    placeholder?: string;
    /** How the chosen date is written in the field.
     * @default { dateStyle: "medium" } */
    formatOptions?: Intl.DateTimeFormatOptions;
    /** @default "md" */
    size?: "sm" | "md";
    /** @default false */
    isInvalid?: boolean;
    disabled?: boolean;
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    className?: string;
}
