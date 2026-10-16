import type { ReactNode } from "react";

import type { SegmentType } from "./SegmentedField";

/** The segments a duration can be typed in, largest first. */
export type DurationUnit = "days" | "hours" | "minutes" | "seconds";

/** The short words shown after each segment. */
export interface DurationLabels {
    /** @default "d" */
    days?: string;
    /** @default "h" */
    hours?: string;
    /** @default "min" */
    minutes?: string;
    /** @default "s" */
    seconds?: string;
}

export interface DurationFieldProps {
    /** The length of time in seconds, or null while every segment is empty. An empty segment beside a filled one counts as 0. */
    value?: number | null;
    /** @default null */
    defaultValue?: number | null;
    /** Called with the total seconds whenever a segment changes, and with null when the last one is cleared. */
    onChange?(seconds: number | null): void;
    /** Which segments to show, in any order; they're laid out largest first.
     * @default ["hours", "minutes"] */
    units?: DurationUnit[];
    /** Up and Down move the smallest segment by this much, landing on its multiples: 5 or 15 minutes.
     * @default 1 */
    step?: number;
    /** The shortest valid duration, in seconds. A shorter one shows the field as invalid. */
    min?: number;
    /** The longest valid duration, in seconds. A longer one shows the field as invalid. */
    max?: number;
    /** The words shown after each segment: "h", "min", or longer ones like "hours". */
    labels?: DurationLabels;
    /** The digits follow this locale's numbering. Defaults to the browser's. */
    locale?: string;
    /** sm 32px for toolbars and settings rows, md 40px in forms.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows the field as wrong: a red border, and a red halo when focused. Also sets aria-invalid. A duration
     * outside min and max does this by itself.
     * @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** The duration can be focused and read but not changed.
     * @default false */
    readOnly?: boolean;
    /** The form field name: a hidden input carries the duration as ISO 8601, "PT1H30M" (read it back with parseDuration). */
    name?: string;
    /** Inside the field, before the segments: a 16px timer icon. */
    startContent?: ReactNode;
    /** Goes on the group. Field sets it, and its label then names the group and focuses the first segment when clicked. */
    id?: string;
    /** Names the duration for screen readers when there's no visible label. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    /** Field points it at its hint and error; each segment is described by them. */
    "aria-describedby"?: string;
    className?: string;
}

/** @internal One unit as the field lays it out: its segment, its length in seconds, the word shown after it and the one read out. */
export interface DurationUnitEntry {
    unit: DurationUnit;
    type: SegmentType;
    seconds: number;
    label: string;
    name: string;
    /** PageUp and PageDown move by this. */
    page: number;
}
