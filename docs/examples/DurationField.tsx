import { useState } from "react";

import { Button, DurationField, Field, Form, formatDuration, parseDuration, Stack, Text } from "@openwarelabs/ui";
import { Timer } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "DurationField",
    category: "Inputs",
    description:
        "A length of time typed into segments, each followed by its unit: hours and minutes by default, or days to seconds. The value is the total in seconds; formatDuration and parseDuration turn it to and from ISO 8601.",
    source: "components/DateField/DurationField.tsx",
    imports: ["DurationField", "formatDuration", "parseDuration"],
    props: ["DurationFieldProps", "DurationLabels"],
    keyboard: [
        ["Digits", "Fill the segment and move on once no other digit fits: 7 in the minutes waits for a second digit, 70 doesn't fit so it starts again."],
        [": or Space", "After one digit, moves on to the next segment, so 1:30 is an hour and a half."],
        ["Up or Down", "Steps the segment; the smallest moves by step. The largest stops at its end, the others go round."],
        ["Page Up or Page Down", "Steps further: ten of the largest unit, six hours, or 15 minutes or seconds."],
        ["Home or End", "Goes to the segment's first or last value."],
        ["Left or Right", "Moves to the previous or next segment."],
        ["Backspace or Delete", "Clears the segment. Backspace on an empty one goes back a segment."],
    ],
    notes: [
        "Each segment is a spinbutton named Days, Hours, Minutes or Seconds, in a group named by the label. The unit words after them are only shown.",
        "The value is the total in seconds. An empty segment beside a filled one counts as 0, so typing 30 in the minutes alone gives 1800; it's null once every segment is cleared.",
        'With name, a hidden input carries the duration as ISO 8601 ("PT1H30M"); parseDuration reads it back, and also takes "1:30" and "1h 30m". Pasting any of those fills the segments.',
        "The largest segment runs up to 99 (999 for days); the others stop where the next unit starts, so 90 minutes is typed as 1 h 30 min.",
    ],
    related: ["TimeField", "TimeRangeField", "NumberField", "DateRangePicker"],
    since: "0.18.0",
};

/** In a Field, controlled; the hint reads the seconds back. */
export function Basic() {
    const [length, setLength] = useState<number | null>(5400);
    return (
        <div style={{ width: 240, maxWidth: "100%" }}>
            <Field label="Session length" hint={length === null ? "Type hours and minutes." : `${length} seconds, ${formatDuration(length)}.`}>
                <DurationField value={length} onChange={setLength} startContent={<Timer size={16} />} />
            </Field>
        </div>
    );
}
Basic.layout = { align: "start" as const };

/** units picks the segments: days to hours for a long one, minutes and seconds for a short one, with longer words in labels. */
export function Units() {
    return (
        <Stack direction="row" gap="lg" wrap>
            <div style={{ width: 240 }}>
                <Field label="Keep backups for" hint="Days and hours.">
                    <DurationField units={["days", "hours"]} defaultValue={7 * 86400 + 12 * 3600} />
                </Field>
            </div>
            <div style={{ width: 240 }}>
                <Field label="Rest between sets" hint="Up and Down move 15 seconds.">
                    <DurationField units={["minutes", "seconds"]} step={15} defaultValue={90} />
                </Field>
            </div>
            <div style={{ width: 280 }}>
                <Field label="Talk length" hint="Long unit words.">
                    <DurationField labels={{ hours: "hours", minutes: "minutes" }} defaultValue={45 * 60} />
                </Field>
            </div>
        </Stack>
    );
}

/** In a Form with name: the form gets "PT1H30M". min and max in seconds turn the field red by themselves; validate says why. */
export function TimeoutForm() {
    const [submitted, setSubmitted] = useState("");
    return (
        <Form
            style={{ width: 360, maxWidth: "100%" }}
            validate={({ timeout }) => {
                const seconds = parseDuration(String(timeout));
                if (seconds === null) return { timeout: "Enter how long an agent may run." };
                if (seconds < 60) return { timeout: "Give it at least a minute." };
                if (seconds > 8 * 3600) return { timeout: "Runs stop after eight hours at most." };
                return undefined;
            }}
            onSubmit={(values) => setSubmitted(`timeout=${values.timeout} (${parseDuration(String(values.timeout))} seconds)`)}
        >
            <Field label="Stop a run after" hint="Between a minute and eight hours.">
                <DurationField name="timeout" min={60} max={8 * 3600} defaultValue={30 * 60} />
            </Field>
            <Stack direction="row" gap="md" align="center" wrap>
                <Button type="submit" variant="primary">
                    Save limit
                </Button>
                {submitted ? <Text variant="caption">Submitted {submitted}</Text> : null}
            </Stack>
        </Form>
    );
}
TimeoutForm.layout = { align: "start" as const };

/** Small, read-only, disabled and invalid. */
export function States() {
    return (
        <Stack gap="md" style={{ width: 240, maxWidth: "100%" }}>
            <DurationField aria-label="Snooze for" size="sm" defaultValue={600} />
            <DurationField aria-label="Last run took" defaultValue={2 * 3600 + 14 * 60} readOnly />
            <DurationField aria-label="Cooldown" defaultValue={300} disabled />
            <DurationField aria-label="Retry after" isInvalid />
        </Stack>
    );
}
States.layout = { align: "start" as const };
