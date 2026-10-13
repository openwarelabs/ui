import { useState } from "react";

import { addDays, DatePicker, Field, Stack, todayISO } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "DatePicker",
    category: "Pickers",
    description:
        "A field that opens a Calendar. Choosing a day closes it; Escape closes it without a change.",
    source: "components/Calendar/DatePicker.tsx",
    props: ["DatePickerProps", "CalendarProps"],
    keyboard: [
        ["Enter or Space or Down", "Opens the calendar on the chosen day, or today."],
        ["Escape", "Closes it and returns focus to the field."],
    ],
    notes: [
        "The field is a button: its label names it and the chosen date is read as its description.",
    ],
    related: ["Calendar", "Select"],
};

/** In a Field. */
export function Basic() {
    const [due, setDue] = useState(addDays(todayISO(), 7));
    return (
        <Field label="Due date">
            <DatePicker value={due} onChange={setDue} />
        </Field>
    );
}

/** Empty until picked, with limits and a longer format. */
export function EmptyWithLimits() {
    return (
        <Field label="Launch" hint="In the next three months.">
            <DatePicker
                min={todayISO()}
                max={addDays(todayISO(), 90)}
                formatOptions={{ weekday: "short", day: "numeric", month: "long", year: "numeric" }}
            />
        </Field>
    );
}

/** Small and invalid. */
export function States() {
    return (
        <Stack direction="row" gap="sm" wrap>
            <DatePicker size="sm" aria-label="From" defaultValue={todayISO()} />
            <DatePicker aria-label="To" isInvalid placeholder="Required" />
        </Stack>
    );
}
