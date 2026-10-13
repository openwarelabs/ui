import { useState } from "react";

import { Button, ColorPicker, Stack, brandPresets } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ColorPicker",
    category: "Forms",
    description:
        "Picks a colour: a saturation area, a hue slider, a hex field, an eyedropper and swatches. Built on react-colorful.",
    source: "components/ColorPicker/ColorPicker.tsx",
    imports: ["ColorPicker"],
    keyboard: [
        ["Arrow keys", "On the colour area, move the colour; on a slider, move the hue or opacity."],
        ["Shift + arrow keys", "Move ten times as far."],
        ["Tab", "Moves between the area, the sliders, the hex field and the swatches."],
    ],
    notes: [
        "The area and sliders are react-colorful's: they're sliders with values read out, and they work by touch.",
        "The hex field only takes valid colours; anything else goes back to the last good one when you leave it.",
        "The eyedropper shows where the browser has one (Chrome and Edge), and picks from anywhere on the screen.",
        "Colours come back as lowercase hex, #rrggbb, or #rrggbbaa with alpha.",
        "For a colour in a form, use a ColorField: the same picker in a popover.",
    ],
    related: ["ColorField", "ColorSwatch", "Slider"],
};

/** The picker on its own. The value updates as you drag. */
export function Basic() {
    const [color, setColor] = useState("#0d9488");
    return (
        <Stack direction="row" gap="2xl" align="center" wrap>
            <ColorPicker value={color} onChange={setColor} />
            <Stack gap="xs">
                <span style={{ fontFamily: "var(--ow-font-mono)", fontSize: 13 }}>{color}</span>
                <Button size="sm" onClick={() => setColor("#312c7e")}>
                    Reset
                </Button>
            </Stack>
        </Stack>
    );
}

/** swatches puts ready-made colours under it, here Openware's brand presets. */
export function WithSwatches() {
    const [color, setColor] = useState(brandPresets[2]!.scale[600]);
    return (
        <ColorPicker
            value={color}
            onChange={setColor}
            swatches={brandPresets.map((preset) => ({ color: preset.scale[600], name: preset.name }))}
        />
    );
}

/** alpha adds an opacity slider; colours come back with two more digits. */
export function WithAlpha() {
    const [color, setColor] = useState("#312c7e99");
    return <ColorPicker alpha value={color} onChange={setColor} />;
}
