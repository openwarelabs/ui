import { useState } from "react";

import { Button, Field, Form, Stack, Text, TimeRangeField, type TimeRange } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "TimeRangeField",
    category: "Inputs",
    description:
        "A start and an end time, each typed in segments like TimeField, joined by “to” in one group: opening hours, a shift, a quiet period. An end before the start shows as invalid unless the range may run overnight.",
    source: "components/DateField/TimeRangeField.tsx",
    imports: ["TimeRangeField", "type TimeRange"],
    props: ["TimeRangeFieldProps", "TimeRangeFieldLabels", "TimeRange"],
    keyboard: [
        ["Digits", "Fill the segment and move on once no other digit fits, as in TimeField."],
        ["Tab", "Moves through the segments, from the start time on into the end time."],
        ["Up or Down", "Steps the segment, going round; minutes move by minuteStep."],
        ["Left or Right", "Moves to the previous or next segment of that time."],
        ["A or P", "Sets AM or PM on a 12-hour clock."],
        ["Backspace or Delete", "Clears the segment."],
    ],
    notes: [
        "One group named by the label holds two TimeField groups named Start and End (change the words with labels). The “to” between them is only shown.",
        'Each time is "HH:MM" (or "HH:MM:SS") on a 24-hour clock whatever the field shows, and null until every segment is filled. onChange gets the whole range on every change.',
        "With name, two hidden inputs carry the times as nameStart and nameEnd, so a form submits both. Field shows the Form's error for name; use the Form's validate for the range as a whole.",
        "Without allowOvernight, an end before the start turns both times red and sets aria-invalid; the hint or error says why.",
    ],
    related: ["TimeField", "DateRangePicker", "DurationField", "NumberField"],
    since: "0.18.0",
};

/** In a Field, controlled: the hint reads the range back. */
export function Basic() {
    const [hours, setHours] = useState<TimeRange>({ start: "09:00", end: "17:30" });
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <Field
                label="Opening hours"
                hint={hours.start && hours.end ? `Open from ${hours.start} to ${hours.end}.` : "Type a start and an end time."}
            >
                <TimeRangeField locale="en-IE" value={hours} onChange={setHours} />
            </Field>
        </div>
    );
}
Basic.layout = { align: "start" as const };

/** "09:30" as minutes since midnight. */
function minutesOf(time: string | string[]) {
    const [hours = 0, minutes = 0] = String(time).split(":").map(Number);
    return hours * 60 + minutes;
}

/** With name, a Form gets shiftStart and shiftEnd; validate checks that the two are at least four hours apart. */
export function ShiftForm() {
    const [submitted, setSubmitted] = useState("");
    return (
        <Form
            style={{ width: 360, maxWidth: "100%" }}
            validate={({ shiftStart, shiftEnd }) => {
                if (!shiftStart || !shiftEnd) return { shift: "Enter both times." };
                if (minutesOf(shiftEnd) - minutesOf(shiftStart) < 4 * 60) return { shift: "A shift lasts at least four hours." };
                return undefined;
            }}
            onSubmit={(values) => setSubmitted(`shiftStart=${values.shiftStart}, shiftEnd=${values.shiftEnd}`)}
        >
            <Field label="Saoirse's shift" hint="Saturday, at the front desk.">
                <TimeRangeField locale="en-IE" name="shift" defaultValue={{ start: "08:00", end: null }} />
            </Field>
            <Stack direction="row" gap="md" align="center" wrap>
                <Button type="submit" variant="primary">
                    Save shift
                </Button>
                {submitted ? <Text variant="caption">Submitted {submitted}</Text> : null}
            </Stack>
        </Form>
    );
}
ShiftForm.layout = { align: "start" as const };

/** allowOvernight lets the end come before the start; without it, the second field shows the same range as wrong. */
export function Overnight() {
    const [quiet, setQuiet] = useState<TimeRange>({ start: "22:00", end: "07:00" });
    return (
        <Stack gap="xl" style={{ width: 360, maxWidth: "100%" }}>
            <Field label="Quiet hours" hint="Notifications wait until the morning.">
                <TimeRangeField locale="en-IE" allowOvernight value={quiet} onChange={setQuiet} />
            </Field>
            <Field
                label="Office hours"
                error={quiet.start && quiet.end && quiet.end < quiet.start ? "The office closes after it opens." : undefined}
            >
                <TimeRangeField locale="en-IE" hourCycle={12} value={quiet} onChange={setQuiet} />
            </Field>
        </Stack>
    );
}
Overnight.layout = { align: "start" as const };

/** Small, read-only and disabled. */
export function States() {
    return (
        <Stack gap="md" style={{ width: 360, maxWidth: "100%" }}>
            <TimeRangeField aria-label="Lunch" locale="en-IE" size="sm" defaultValue={{ start: "12:30", end: "13:30" }} />
            <TimeRangeField aria-label="Last maintenance window" locale="en-IE" defaultValue={{ start: "02:00", end: "04:00" }} readOnly />
            <TimeRangeField aria-label="Weekend hours" locale="en-IE" defaultValue={{ start: null, end: null }} disabled />
        </Stack>
    );
}
States.layout = { align: "start" as const };
