import { useState, type FormEvent } from "react";

import { Button, DateField, Field, Stack, Text, TimeField } from "@openwarelabs/ui";
import { CalendarDays, Clock } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "TimeField",
    category: "Inputs",
    description:
        "A time typed into hour and minute segments, with seconds if you ask and AM/PM on a 12-hour clock. The value is always on a 24-hour clock.",
    source: "components/DateField/TimeField.tsx",
    keyboard: [
        [
            "Digits",
            "Fill the segment and move on once no other digit fits: 7 in the hour moves on, 1 waits for a second digit.",
        ],
        [": or Space", "After one digit, moves on to the next segment, so 1:30 is half past one."],
        ["A or P", "Sets AM or PM on a 12-hour clock, from any segment."],
        [
            "Up or Down",
            "Steps the segment, going round; minutes move by minuteStep. An empty one starts at the current hour.",
        ],
        ["Page Up or Page Down", "Steps further: two hours, or 15 minutes or seconds."],
        ["Home or End", "Goes to the segment's first or last value."],
        ["Left or Right", "Moves to the previous or next segment."],
        [
            "Backspace or Delete",
            "Clears the segment. Backspace on an empty one goes back a segment.",
        ],
    ],
    notes: [
        "Each segment is a spinbutton named Hour, Minute, Second or AM/PM, in a group named by the label. Clicking Field's label focuses the first segment.",
        'The value is "HH:MM" (or "HH:MM:SS") on a 24-hour clock whatever the field shows, and "" until every part is filled.',
        "The locale decides the clock, the separators and the AM/PM words; hourCycle overrides the clock.",
        "With name, a hidden input carries the value, so forms submit it.",
    ],
    related: ["DateField", "TimeRangeField", "DurationField", "NumberField", "Input"],
    since: "0.4.0",
};

/** In a Field, controlled; the clock follows the browser's locale. */
export function Basic() {
    const [time, setTime] = useState("14:30");
    return (
        <div style={{ width: 200, maxWidth: "100%" }}>
            <Field label="Daily run" hint={time ? `Saved as ${time}` : "Type an hour and minutes."}>
                <TimeField value={time} onChange={setTime} />
            </Field>
        </div>
    );
}

/** The same value on the locale's clock, and on a 12-hour clock where the locale's would be 24. */
export function HourCycles() {
    return (
        <Stack direction="row" gap="lg" wrap>
            <div style={{ width: 150 }}>
                <Field label="United States" hint="en-US">
                    <TimeField locale="en-US" defaultValue="14:30" />
                </Field>
            </div>
            <div style={{ width: 150 }}>
                <Field label="Switzerland" hint="de-CH">
                    <TimeField locale="de-CH" defaultValue="14:30" />
                </Field>
            </div>
            <div style={{ width: 150 }}>
                <Field label="Ireland" hint="en-IE, hourCycle 12">
                    <TimeField locale="en-IE" hourCycle={12} defaultValue="14:30" />
                </Field>
            </div>
        </Stack>
    );
}

/** granularity="second" adds a seconds segment; minuteStep makes Up and Down move in steps. */
export function SecondsAndSteps() {
    return (
        <Stack direction="row" gap="lg" wrap>
            <div style={{ width: 200 }}>
                <Field label="Deploy at" hint="To the second.">
                    <TimeField locale="en-IE" granularity="second" defaultValue="09:41:05" />
                </Field>
            </div>
            <div style={{ width: 200 }}>
                <Field label="Stand-up" hint="Up and Down move 15 minutes.">
                    <TimeField locale="en-IE" minuteStep={15} defaultValue="09:15" />
                </Field>
            </div>
        </Stack>
    );
}

/** min and max: a time outside them turns the field red. */
export function WorkingHours() {
    const [time, setTime] = useState("19:00");
    const error =
        time && (time < "09:00" || time > "17:30")
            ? "Agents run reviews between 09:00 and 17:30."
            : undefined;
    return (
        <div style={{ width: 280, maxWidth: "100%" }}>
            <Field label="Review at" error={error}>
                <TimeField locale="en-IE" min="09:00" max="17:30" value={time} onChange={setTime} />
            </Field>
        </div>
    );
}

/** A clock icon in startContent; then small, read-only, disabled and invalid. */
export function States() {
    return (
        <Stack gap="md" style={{ width: 200, maxWidth: "100%" }}>
            <TimeField
                aria-label="Starts"
                defaultValue="10:00"
                startContent={<Clock size={16} />}
            />
            <TimeField aria-label="Ends" size="sm" startContent={<Clock size={14} />} />
            <TimeField aria-label="Last run" defaultValue="06:12" readOnly />
            <TimeField aria-label="Quiet from" defaultValue="22:00" disabled />
            <TimeField aria-label="Retry at" isInvalid />
        </Stack>
    );
}

/** With name, each field adds a hidden input, so a form submits "2026-11-23" and "08:30". */
export function ScheduleForm() {
    const [submitted, setSubmitted] = useState("");
    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(
            `date=${data.get("date") || "(empty)"}, time=${data.get("time") || "(empty)"}`,
        );
    }
    return (
        <form onSubmit={onSubmit} style={{ width: 360, maxWidth: "100%" }}>
            <Stack gap="xl">
                <Stack direction="row" gap="sm">
                    <div style={{ flex: 3, minWidth: 0 }}>
                        <Field label="Run on">
                            <DateField
                                name="date"
                                defaultValue="2026-11-23"
                                startContent={<CalendarDays size={16} />}
                            />
                        </Field>
                    </div>
                    <div style={{ flex: 2, minWidth: 0 }}>
                        <Field label="At">
                            <TimeField
                                name="time"
                                defaultValue="08:30"
                                startContent={<Clock size={16} />}
                            />
                        </Field>
                    </div>
                </Stack>
                <Stack direction="row" gap="md" align="center" wrap>
                    <Button type="submit" variant="primary">
                        Schedule run
                    </Button>
                    {submitted ? <Text variant="caption">Submitted {submitted}</Text> : null}
                </Stack>
            </Stack>
        </form>
    );
}
ScheduleForm.layout = { align: "start" };
