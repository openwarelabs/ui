import { useState } from "react";

import { ColorArea, ColorField, ColorSlider, ColorSwatch, Field, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ColorArea",
    category: "Pickers",
    description:
        "A square of one hue, saturation across and brightness up and down, for picking a colour by eye. Pair it with a hue ColorSlider.",
    source: "components/ColorPicker/ColorArea.tsx",
    keyboard: [
        ["Left or Right", "Lowers or raises the saturation by 1%."],
        ["Up or Down", "Raises or lowers the brightness by 1%."],
        ["Shift + arrow keys", "Move by 10%."],
        ["PageUp or PageDown", "Raises or lowers the brightness by 10%."],
        ["Home or End", "Sets the saturation to 0% or 100%."],
    ],
    notes: [
        "To screen readers it's a group of two sliders, saturation and brightness, each reading out both values and the colour: “Saturation 72%, brightness 40%, dark teal”.",
        "Only one of the two is a tab stop; the arrow keys move focus to the slider whose value they change.",
        "A grey has no hue, so the area keeps its last one: drag into a corner and back out and the hue is still there.",
        "With a hue ColorSlider, pass the slider's onHueChange to the area's hue, so moving the hue of a grey or black still moves the area's.",
        "Colours come back as lowercase hex, #rrggbb; a value with alpha keeps it.",
    ],
    related: ["ColorSlider", "ColorPicker", "ColorField"],
    since: "0.4.0",
};

/** A hue slider and the area editing one colour, with a ColorField that shows the hex and takes a typed one. */
export function WithHueSlider() {
    const [color, setColor] = useState("#0d9488");
    const [hue, setHue] = useState<number>();
    return (
        <Stack gap="lg" style={{ width: 232, maxWidth: "100%" }}>
            <ColorArea aria-label="Agent colour" value={color} onChange={setColor} hue={hue} />
            <ColorSlider
                channel="hue"
                value={color}
                onChange={setColor}
                hue={hue}
                onHueChange={setHue}
            />
            <Field label="Agent colour" hint="Marks the changes this agent makes in reviews.">
                <ColorField value={color} onChange={setColor} />
            </Field>
        </Stack>
    );
}

/** onChange runs as you drag; onChangeEnd once you let go, for saving or anything slow. */
export function SaveWhenReleased() {
    const [color, setColor] = useState("#312c7e");
    const [saved, setSaved] = useState("#312c7e");
    return (
        <Stack direction="row" gap="2xl" align="center" wrap>
            <ColorArea
                aria-label="Status page accent"
                value={color}
                onChange={setColor}
                onChangeEnd={setSaved}
                width={200}
                height={140}
            />
            <Stack gap="lg">
                <ColorSwatch color={color} name="Preview" value={color} size="lg" />
                <ColorSwatch color={saved} name="Saved" value={saved} size="lg" />
            </Stack>
        </Stack>
    );
}

/** width and height size it: a square beside a vertical hue slider makes a compact picker. */
export function Compact() {
    const [color, setColor] = useState("#b43b4e");
    const [hue, setHue] = useState<number>();
    return (
        <Stack direction="row" gap="lg" align="center">
            <ColorArea
                aria-label="Label colour"
                value={color}
                onChange={setColor}
                hue={hue}
                width={152}
                height={152}
            />
            <ColorSlider
                channel="hue"
                orientation="vertical"
                value={color}
                onChange={setColor}
                hue={hue}
                onHueChange={setHue}
            />
        </Stack>
    );
}

/** Disabled, it fades and ignores the pointer and the keys. */
export function Disabled() {
    return <ColorArea aria-label="Workspace colour" defaultValue="#005959" disabled />;
}
