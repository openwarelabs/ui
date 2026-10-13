import { useId, useState } from "react";

import {
    Button,
    ColorSwatch,
    ColorSwatchPicker,
    Popover,
    Stack,
    Tag,
    Text,
} from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ColorSwatchPicker",
    category: "Pickers",
    description:
        "Picks one colour from a set of swatches in rows that wrap: label colours, themes and other short palettes.",
    source: "components/ColorPicker/ColorSwatchPicker.tsx",
    props: ["ColorSwatchPickerProps", "ColorSwatchPickerOption"],
    keyboard: [
        ["Tab", "Moves into the picker, onto the chosen swatch, or the first when none is."],
        [
            "Left or Right or Up or Down",
            "Chooses the previous or next swatch, on into the next row, and round from the last to the first.",
        ],
        ["Home or End", "Chooses the first or last swatch."],
        ["Space", "Chooses the focused swatch, when none is chosen yet."],
    ],
    notes: [
        "It's a radio group: give it an aria-label or aria-labelledby that says what the colour is for.",
        "Each swatch is a radio named by its label, or by a description of the colour (“dark teal”) when it has none.",
        "The chosen swatch has a ring and a check mark, white or slate, whichever reads better on it, so it doesn't rely on colour alone.",
        "onChange gets the option's value as you wrote it; value matches an option whatever its case.",
    ],
    related: ["ColorSwatch", "ColorPicker", "RadioGroup"],
    since: "0.4.0",
};

const labelColours = [
    { value: "#475569", label: "Slate" },
    { value: "#312c7e", label: "Midnight" },
    { value: "#004f8a", label: "Ocean" },
    { value: "#005959", label: "Teal" },
    { value: "#005d2d", label: "Forest" },
    { value: "#d4a72c", label: "Brass" },
    { value: "#7b3700", label: "Ember" },
    { value: "#8e1331", label: "Rose" },
    { value: "#732778", label: "Plum" },
];

/** Colours for Acme's labels, each with a name for screen readers, and the label as it will look. */
export function LabelColours() {
    const headingId = useId();
    const [color, setColor] = useState("#005959");
    return (
        <Stack gap="lg" style={{ width: 360, maxWidth: "100%" }}>
            <Stack gap="sm">
                <Text variant="label" id={headingId}>
                    Label colour
                </Text>
                <ColorSwatchPicker
                    aria-labelledby={headingId}
                    options={labelColours}
                    value={color}
                    onChange={setColor}
                />
            </Stack>
            <Stack direction="row" gap="sm" align="center">
                <Text variant="caption">Preview</Text>
                <Tag icon={<ColorSwatch color={color} size="sm" shape="circle" />}>
                    Ready for an agent
                </Tag>
            </Stack>
        </Stack>
    );
}
LabelColours.layout = { align: "start" as const };

/** A compact picker in a Popover, opened from a button that shows the colour. */
export function InPopover() {
    const [color, setColor] = useState("#004f8a");
    const name = labelColours.find((option) => option.value === color)?.label;
    return (
        <Popover
            title="Project colour"
            width={220}
            trigger={
                <Button startIcon={<ColorSwatch color={color} size="sm" />}>
                    {name ?? "Project colour"}
                </Button>
            }
        >
            <ColorSwatchPicker
                aria-label="Project colour"
                size="sm"
                options={labelColours}
                value={color}
                onChange={setColor}
            />
        </Popover>
    );
}
InPopover.layout = { minHeight: 220 };

/** sm and md, square or circle. Plain hex options are read out by a description of the colour. */
export function SizesAndShapes() {
    const palette = [
        "#0f172a",
        "#2563eb",
        "#0d9488",
        "#16a34a",
        "#eab308",
        "#ea580c",
        "#dc2626",
        "#db2777",
    ];
    return (
        <Stack gap="xl">
            <ColorSwatchPicker aria-label="Chart colour" options={palette} defaultValue="#2563eb" />
            <ColorSwatchPicker
                aria-label="Avatar colour"
                options={palette}
                defaultValue="#16a34a"
                shape="circle"
            />
            <ColorSwatchPicker
                aria-label="Marker colour"
                options={palette}
                defaultValue="#eab308"
                size="sm"
            />
        </Stack>
    );
}

/** An option can be disabled, here a colour another label has taken, or the whole picker. */
export function Disabled() {
    return (
        <Stack gap="xl">
            <ColorSwatchPicker
                aria-label="Label colour"
                options={labelColours.map((option) =>
                    option.label === "Brass"
                        ? { ...option, label: "Brass, used by Releases", disabled: true }
                        : option,
                )}
                defaultValue="#312c7e"
            />
            <ColorSwatchPicker
                aria-label="Workspace colour"
                options={labelColours}
                defaultValue="#005959"
                disabled
            />
        </Stack>
    );
}
