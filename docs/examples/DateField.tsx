import { useState } from "react";

import { addDays, DateField, Field, formatDate, Stack, todayISO } from "@openwarelabs/ui";
import { CalendarDays } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "DateField",
    category: "Inputs",
    description:
        "A date typed into day, month and year segments, in the locale's order and with its separators. Digits fill a segment and move on; the arrow keys step it.",
    source: "components/DateField/DateField.tsx",
    keyboard: [
        [
            "Digits",
            "Fill the segment and move on once no other digit fits: 4 in the month moves on, 1 waits for a second digit.",
        ],
        [
            "/ or . or Space",
            "After one digit, moves on to the next segment, so 1/5 is the 1st of May.",
        ],
        [
            "Up or Down",
            "Steps the segment; days and months go round from last to first. An empty one starts at today's.",
        ],
        ["Page Up or Page Down", "Steps further: a week of days, two months or five years."],
        ["Home or End", "Goes to the segment's first or last value."],
        ["Left or Right", "Moves to the previous or next segment."],
        [
            "Backspace or Delete",
            "Clears the segment. Backspace on an empty one goes back a segment.",
        ],
        ["Tab", "Moves through the segments, then on to the next control."],
    ],
    notes: [
        "Each segment is a spinbutton named Day, Month or Year, in a group named by the label. Clicking Field's label focuses the first segment.",
        'The value stays "" until every part is filled, so a half-typed date never reaches your state.',
        'Pasting "2026-11-23", or a date written in the field\'s own order, fills every segment at once.',
        'With name, a hidden input carries the "YYYY-MM-DD" value, so forms submit it.',
        "Use DatePicker when people would rather pick from a month than type.",
    ],
    related: ["TimeField", "DatePicker", "Calendar", "Input"],
    since: "0.4.0",
};

/** In a Field, controlled. The value stays "" until day, month and year are all filled. */
export function Basic() {
    const [due, setDue] = useState("2026-11-23");
    return (
        <div style={{ width: 260, maxWidth: "100%" }}>
            <Field label="Due date" hint={due ? `Saved as ${due}` : "Type a day, month and year."}>
                <DateField value={due} onChange={setDue} />
            </Field>
        </div>
    );
}

/** The locale sets the order, the separators and the placeholders: empty here, so they show. */
export function Locales() {
    const locales = [
        ["en-IE", "Ireland"],
        ["en-US", "United States"],
        ["de-CH", "Switzerland"],
        ["ja-JP", "Japan"],
    ];
    return (
        <Stack direction="row" gap="lg" wrap>
            {locales.map(([locale, country]) => (
                <div key={locale} style={{ width: 170 }}>
                    <Field label={country} hint={locale}>
                        <DateField locale={locale} />
                    </Field>
                </div>
            ))}
        </Stack>
    );
}

/** min and max: a date outside them turns the field red, and the error says what's allowed. */
export function WithLimits() {
    const today = todayISO();
    const last = addDays(today, 90);
    const [launch, setLaunch] = useState(addDays(today, 120));
    const longDate = (date: string) => formatDate(date, "en-IE", { dateStyle: "long" });
    const error =
        launch && launch < today
            ? "Pick today or a later date."
            : launch > last
              ? `Pick a date up to ${longDate(last)}.`
              : undefined;
    return (
        <div style={{ width: 260, maxWidth: "100%" }}>
            <Field label="Launch date" hint="In the next 90 days." error={error}>
                <DateField
                    locale="en-IE"
                    min={today}
                    max={last}
                    value={launch}
                    onChange={setLaunch}
                />
            </Field>
        </div>
    );
}

/** A calendar icon in startContent; then small, read-only, disabled and invalid. */
export function States() {
    return (
        <Stack gap="md" style={{ width: 240, maxWidth: "100%" }}>
            <DateField
                aria-label="Sprint starts"
                defaultValue="2026-11-02"
                startContent={<CalendarDays size={16} />}
            />
            <DateField
                aria-label="Sprint ends"
                size="sm"
                startContent={<CalendarDays size={14} />}
            />
            <DateField aria-label="Created" defaultValue="2026-09-14" readOnly />
            <DateField aria-label="Archived" defaultValue="2026-09-30" disabled />
            <DateField aria-label="Review by" isInvalid />
        </Stack>
    );
}
