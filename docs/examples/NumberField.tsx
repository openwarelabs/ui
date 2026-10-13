import { useState } from "react";

import { Field, NumberField, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "NumberField",
    category: "Inputs",
    description: "A number with − and + buttons either side, clamped to a minimum and maximum.",
    source: "components/NumberField/NumberField.tsx",
    keyboard: [
        ["Up or Down", "Adds or takes away one step."],
        ["PageUp or PageDown", "Ten steps."],
        ["Home or End", "Jumps to the minimum or maximum, when set."],
        ["Enter", "Applies what was typed."],
    ],
    notes: [
        "It's a spinbutton to screen readers, with its value, minimum and maximum.",
        "The − and + buttons are skipped by Tab: the arrow keys do the same from the field.",
    ],
    related: ["Input", "Slider", "Field"],
};

/** In a Field, with a minimum and maximum. */
export function Basic() {
    const [seats, setSeats] = useState<number | null>(3);
    return (
        <Field label="Seats" hint="Between 1 and 50.">
            <NumberField value={seats} onChange={setSeats} min={1} max={50} />
        </Field>
    );
}

/** Steps and formatting: the value is shown as currency until you edit it. */
export function Formatted() {
    return (
        <Stack direction="row" gap="xl" wrap>
            <Field label="Monthly budget">
                <NumberField
                    defaultValue={20}
                    min={0}
                    step={5}
                    formatOptions={{ style: "currency", currency: "EUR" }}
                />
            </Field>
            <Field label="Temperature">
                <NumberField defaultValue={0.7} min={0} max={2} step={0.1} />
            </Field>
        </Stack>
    );
}

/** The small size, for settings rows. */
export function Small() {
    return <NumberField size="sm" aria-label="Retries" defaultValue={3} min={0} max={10} />;
}
