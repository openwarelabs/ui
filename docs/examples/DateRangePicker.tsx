import { useState } from "react";

import {
    addDays,
    addMonths,
    DateRangePicker,
    Field,
    parseISO,
    Stack,
    todayISO,
    toISO,
    weekday,
    type DateRange,
    type DateRangePreset,
} from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "DateRangePicker",
    category: "Pickers",
    description:
        "A field that opens a two-month RangeCalendar, with presets beside it if you give some. Picking the end day or a preset closes it.",
    source: "components/Calendar/DateRangePicker.tsx",
    imports: ["DateRangePicker", "type DateRange"],
    props: ["DateRangePickerProps", "RangeCalendarProps", "DateRangePreset"],
    keyboard: [
        ["Enter or Space or Down", "Opens the calendar on the range's start, or today."],
        [
            "Arrow keys",
            "Move through the days; Home, End, PageUp and PageDown work as in RangeCalendar.",
        ],
        ["Enter or Space", "Picks the start, then the end, and closes."],
        ["Shift + Tab", "Goes back to the month buttons, then the presets."],
        ["Up or Down", "Moves between the presets."],
        [
            "Escape",
            "Closes without a change, dropping a half-picked range, and returns focus to the field.",
        ],
    ],
    notes: [
        "The field is a button: its label names it and the range is read as its description.",
        "The range is written in the locale, sharing what both ends have in common: “3 – 9 Oct 2026”.",
        "Tabbing out of the panel or clicking outside it closes it without a change.",
        "Phones get one month, with the presets in rows above it.",
        "The clear button is a separate button after the field, named “Clear dates”.",
    ],
    related: ["RangeCalendar", "DatePicker", "Calendar"],
    since: "0.4.0",
};

/** In a Field, controlled. */
export function Basic() {
    const today = todayISO();
    const [sprint, setSprint] = useState<DateRange | null>({
        start: today,
        end: addDays(today, 13),
    });
    return (
        <Field label="Sprint dates" hint="Agents plan their work inside these dates.">
            <DateRangePicker value={sprint} onChange={setSprint} />
        </Field>
    );
}
Basic.layout = { minHeight: 200 };

function firstOfMonth(date: string) {
    const { year, month } = parseISO(date);
    return toISO(year, month, 1);
}

/** Presets beside the calendar, for a report that looks back: nothing after today can be picked. */
export function Presets() {
    const today = todayISO();
    const lastMonth = addMonths(firstOfMonth(today), -1);
    const presets: DateRangePreset[] = [
        { label: "Last 7 days", range: { start: addDays(today, -6), end: today } },
        { label: "Last 30 days", range: { start: addDays(today, -29), end: today } },
        { label: "This month", range: { start: firstOfMonth(today), end: today } },
        { label: "Last month", range: { start: lastMonth, end: addDays(firstOfMonth(today), -1) } },
    ];
    const [range, setRange] = useState<DateRange | null>(presets[0]!.range);
    return (
        <Field label="Agent activity">
            <DateRangePicker value={range} onChange={setRange} presets={presets} max={today} />
        </Field>
    );
}
Presets.layout = { minHeight: 200 };

/** Empty until picked, from today on; leave can run over a weekend but starts and ends on a weekday. */
export function Limits() {
    return (
        <Field label="Out of office" hint="Your reviews go to the on-call agent while you're away.">
            <DateRangePicker
                min={todayISO()}
                isDateDisabled={(date) => [0, 6].includes(weekday(date))}
                placeholder="Pick your days off"
            />
        </Field>
    );
}
Limits.layout = { minHeight: 200 };

/** Small, invalid and disabled. */
export function States() {
    const today = todayISO();
    return (
        <Stack direction="row" gap="xl" wrap align="start">
            <Field label="Billing period">
                <DateRangePicker
                    size="sm"
                    defaultValue={{ start: addDays(today, -30), end: today }}
                />
            </Field>
            <Field label="Release window" error="Pick when the window opens and closes.">
                <DateRangePicker />
            </Field>
            <Field label="Code freeze">
                <DateRangePicker
                    disabled
                    defaultValue={{ start: addDays(today, 20), end: addDays(today, 24) }}
                />
            </Field>
        </Stack>
    );
}
States.layout = { minHeight: 200 };
