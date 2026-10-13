import { useState } from "react";

import {
    addDays,
    formatDateRange,
    RangeCalendar,
    Stack,
    todayISO,
    weekday,
    type DateRange,
} from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "RangeCalendar",
    category: "Pickers",
    description:
        "Calendar's month grid for picking a range of days: the first pick sets the start, the second the end. One month, or two side by side.",
    source: "components/Calendar/RangeCalendar.tsx",
    imports: ["RangeCalendar", "formatDateRange", "type DateRange"],
    props: ["RangeCalendarProps", "DateRange"],
    keyboard: [
        ["Left or Right", "Moves a day."],
        ["Up or Down", "Moves a week."],
        ["Home or End", "Goes to the start or end of the week."],
        ["PageUp or PageDown", "Moves a month."],
        ["Shift + PageUp", "Moves a year back (Shift + PageDown forward)."],
        ["Enter or Space", "Picks the focused day: first the start, then the end."],
        ["Escape", "Drops a half-picked range and shows the last one again."],
    ],
    notes: [
        "Until the end is picked, the range follows the pointer or the focus; picking a day before the start swaps them.",
        "onChange is called once both ends are picked, with the earlier day as the start.",
        "Every day in the range is aria-selected, and a polite live region says the start, then the whole range.",
        "isDateDisabled stops a day being an end, but a range can run across disabled days, such as a weekend.",
        "With two months, the second stacks under the first when there isn't room for both.",
    ],
    related: ["DateRangePicker", "Calendar"],
    since: "0.4.0",
};

const dayCount = (range: DateRange) =>
    (Date.parse(range.end) - Date.parse(range.start)) / 86_400_000 + 1;

/** Pick the sprint's first and last days; the range is written out below. */
export function Basic() {
    const today = todayISO();
    const [sprint, setSprint] = useState<DateRange | null>({
        start: today,
        end: addDays(today, 9),
    });
    return (
        <Stack gap="md" align="center">
            <RangeCalendar value={sprint} onChange={setSprint} />
            <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>
                {sprint
                    ? `Sprint 14: ${formatDateRange(sprint.start, sprint.end, undefined, { dateStyle: "medium" })}, ${dayCount(sprint)} days`
                    : "No dates yet"}
            </span>
        </Stack>
    );
}

/** Two months side by side, for a range that crosses into the next one. */
export function TwoMonths() {
    const today = todayISO();
    return (
        <RangeCalendar
            visibleMonths={2}
            defaultValue={{ start: addDays(today, 14), end: addDays(today, 27) }}
        />
    );
}

/** A code freeze in the next two months: it can run over a weekend, but has to start and end on a weekday. */
export function Limits() {
    const today = todayISO();
    return (
        <RangeCalendar
            min={today}
            max={addDays(today, 60)}
            isDateDisabled={(date) => [0, 6].includes(weekday(date))}
        />
    );
}

/** Another locale, with weeks starting on Sunday. */
export function Locale() {
    const today = todayISO();
    return (
        <RangeCalendar
            locale="en-US"
            weekStartsOn={0}
            defaultValue={{ start: addDays(today, -3), end: addDays(today, 3) }}
        />
    );
}
