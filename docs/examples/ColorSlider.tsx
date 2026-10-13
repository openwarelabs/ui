import { useState } from "react";

import { ColorArea, ColorSlider, ColorSwatch, Field, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ColorSlider",
    category: "Pickers",
    description:
        "Changes one channel of a colour (hue, saturation, lightness, alpha, red, green or blue) over a track that shows that channel's range.",
    source: "components/ColorPicker/ColorSlider.tsx",
    keyboard: [
        ["Left or Right or Up or Down", "Moves by one: a degree of hue, a percent, or one of 255."],
        ["Shift + arrow keys", "Moves by ten."],
        ["PageUp or PageDown", "Moves by ten."],
        ["Home or End", "Goes to the minimum or maximum."],
    ],
    notes: [
        "It's a slider to screen readers, named by its label or its channel (“Hue”, “Opacity”), reading out the value and the colour: “174°, teal”.",
        "In a Field, the Field's label names it.",
        "Saturation and lightness are HSL's. A grey keeps its hue, and black and white their saturation, so passing through them loses nothing.",
        "The alpha channel takes and returns #rrggbbaa; the other channels keep whatever alpha the colour has.",
    ],
    related: ["ColorArea", "Slider", "ColorPicker"],
    since: "0.4.0",
};

/** A hue slider with a label and the value above, like Slider. */
export function Hue() {
    const [color, setColor] = useState("#0d9488");
    return (
        <div style={{ width: 280, maxWidth: "100%" }}>
            <ColorSlider channel="hue" label="Hue" value={color} onChange={setColor} />
        </div>
    );
}

/** The alpha channel, over a checkerboard; colours come back as #rrggbbaa. */
export function Alpha() {
    const [color, setColor] = useState("#d4a72c66");
    return (
        <Stack gap="lg" style={{ width: 300, maxWidth: "100%" }}>
            <ColorSlider
                channel="alpha"
                label="Highlight opacity"
                value={color}
                onChange={setColor}
            />
            <code
                style={{
                    padding: "6px 10px",
                    borderRadius: "var(--ow-radius-md)",
                    background: color,
                    fontFamily: "var(--ow-font-mono)",
                    fontSize: 13,
                }}
            >
                + await review.approve(change);
            </code>
        </Stack>
    );
}

/** Red, green and blue sliders editing one colour. */
export function RgbChannels() {
    const [color, setColor] = useState("#312c7e");
    return (
        <Stack gap="lg" style={{ width: 280, maxWidth: "100%" }}>
            <ColorSwatch color={color} name="Brand colour" value={color} size="lg" />
            <ColorSlider channel="red" label="Red" value={color} onChange={setColor} />
            <ColorSlider channel="green" label="Green" value={color} onChange={setColor} />
            <ColorSlider channel="blue" label="Blue" value={color} onChange={setColor} />
        </Stack>
    );
}

/** Hue, saturation and lightness; each track shows its channel for the colour as it is now. */
export function HslChannels() {
    const [color, setColor] = useState("#b43b4e");
    const [hue, setHue] = useState<number>();
    return (
        <Stack gap="lg" style={{ width: 280, maxWidth: "100%" }}>
            <ColorSwatch color={color} name="Label colour" value={color} size="lg" />
            <ColorSlider
                channel="hue"
                label="Hue"
                value={color}
                onChange={setColor}
                hue={hue}
                onHueChange={setHue}
            />
            <ColorSlider
                channel="saturation"
                label="Saturation"
                value={color}
                onChange={setColor}
                hue={hue}
            />
            <ColorSlider
                channel="lightness"
                label="Lightness"
                value={color}
                onChange={setColor}
                hue={hue}
            />
        </Stack>
    );
}

/** orientation="vertical", 152px tall to sit beside a ColorArea. */
export function Vertical() {
    const [color, setColor] = useState("#004f8acc");
    const [hue, setHue] = useState<number>();
    return (
        <Stack direction="row" gap="lg" align="center">
            <ColorArea
                aria-label="Chart colour"
                value={color}
                onChange={setColor}
                hue={hue}
                width={152}
            />
            <ColorSlider
                channel="hue"
                orientation="vertical"
                value={color}
                onChange={setColor}
                hue={hue}
                onHueChange={setHue}
            />
            <ColorSlider channel="alpha" orientation="vertical" value={color} onChange={setColor} />
        </Stack>
    );
}

/** In a Field, whose label names it; disabled, it fades and ignores the pointer and the keys. */
export function InAFieldAndDisabled() {
    return (
        <div style={{ width: 280, maxWidth: "100%" }}>
            <Field label="Sidebar lightness" hint="Set by your workspace's theme.">
                <ColorSlider channel="lightness" defaultValue="#5856ad" disabled />
            </Field>
        </div>
    );
}
