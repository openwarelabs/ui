import { useState } from "react";

import { addDays, Calendar, formatDate, Stack, todayISO, weekday } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Calendar",
    category: "Dates",
    description:
        "A month grid for picking a date. Today has a brass dot; the chosen day is filled with the primary colour.",
    source: "components/Calendar/Calendar.tsx",
    imports: ["Calendar", "todayISO", "addDays", "formatDate"],
    keyboard: [
        ["Left or Right", "Moves a day."],
        ["Up or Down", "Moves a week."],
        ["Home or End", "Goes to the start or end of the week."],
        ["PageUp or PageDown", "Moves a month."],
        ["Shift + PageUp", "Moves a year back (Shift + PageDown forward)."],
        ["Enter or Space", "Picks the focused day."],
    ],
    notes: [
        'Dates are plain "YYYY-MM-DD" strings, so a date never shifts by a day across time zones.',
        "Month and day names come from the locale; weeks start on Monday unless weekStartsOn is 0.",
        "Each day is read in full, as in “Tuesday, 13 October 2026”, and the month is announced when it changes.",
    ],
    related: ["DatePicker"],
};

/** Pick a date; the chosen one is written out below. */
export function Basic() {
    const [date, setDate] = useState(todayISO());
    return (
        <Stack gap="md" align="center">
            <Calendar value={date} onChange={setDate} />
            <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>
                {formatDate(date, undefined, { dateStyle: "full" })}
            </span>
        </Stack>
    );
}

/** min and max limit the range; isDateDisabled rules out single days, here weekends. */
export function Limits() {
    const today = todayISO();
    return (
        <Calendar
            min={today}
            max={addDays(today, 45)}
            isDateDisabled={(date) => [0, 6].includes(weekday(date))}
        />
    );
}

/** Another locale, starting weeks on Sunday. */
export function Locale() {
    return <Calendar locale="pt-BR" weekStartsOn={0} defaultValue={todayISO()} />;
}
