import { useState } from "react";

import { ColorField, Field, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ColorField",
    category: "Forms",
    description:
        "A form field that shows a colour and its hex, and opens a ColorPicker in a popover.",
    source: "components/ColorPicker/ColorPicker.tsx",
    imports: ["ColorField"],
    keyboard: [
        ["Enter, Space or Down", "Opens the picker, with focus on the colour area."],
        ["Enter", "On the colour area or a slider, closes the picker and keeps the colour."],
        ["Escape", "Closes the picker and returns focus to the field."],
    ],
    notes: [
        "In a Field, the label names it and the hex is read as its description.",
        "It takes every ColorPicker prop: swatches, alpha, eyeDropper and showInput.",
    ],
    related: ["ColorPicker", "Select", "DatePicker"],
};

const brand = [
    { color: "#312c7e", name: "Midnight" },
    { color: "#004f8a", name: "Ocean" },
    { color: "#005959", name: "Teal" },
    { color: "#8e1331", name: "Rose" },
    { color: "#7b3700", name: "Ember" },
];

/** In a Field, with swatches for the usual choices. */
export function Basic() {
    const [color, setColor] = useState("#005959");
    return (
        <div style={{ width: 260, maxWidth: "100%" }}>
            <Field label="Brand colour" hint="Buttons, links and focus rings use it.">
                <ColorField value={color} onChange={setColor} swatches={brand} />
            </Field>
        </div>
    );
}
Basic.layout = { align: "start" as const, minHeight: 200 };

/** Small, invalid and disabled. */
export function States() {
    return (
        <Stack direction="row" gap="sm" wrap>
            <ColorField size="sm" aria-label="Accent" defaultValue="#d4a72c" />
            <ColorField aria-label="Background" defaultValue="#ffffff" isInvalid />
            <ColorField aria-label="Locked colour" defaultValue="#475569" disabled />
        </Stack>
    );
}
