import { useState } from "react";

import { Slider, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Slider",
    category: "Forms",
    description: "Picks a number, or a range, by dragging. It's built on native range inputs.",
    source: "components/Slider/Slider.tsx",
    keyboard: [
        ["Left or Right or Up or Down", "Moves by one step."],
        ["PageUp or PageDown", "Moves by a larger step."],
        ["Home or End", "Goes to the minimum or maximum."],
    ],
    notes: [
        "Each handle is a native slider, read with its label and the formatted value from formatValue.",
        "For a value that needs to be exact, pair it with a NumberField or use one instead.",
    ],
    related: ["NumberField", "ProgressBar"],
};

/** A label, the value at the right, and a format for it. */
export function Basic() {
    const [volume, setVolume] = useState(60);
    return (
        <div style={{ width: 320, maxWidth: "100%" }}>
            <Slider
                label="Volume"
                value={volume}
                onChange={setVolume}
                formatValue={(value) => `${value}%`}
            />
        </div>
    );
}

/** A [low, high] value gives two handles. */
export function Range() {
    const [price, setPrice] = useState<[number, number]>([20, 80]);
    return (
        <div style={{ width: 320, maxWidth: "100%" }}>
            <Slider
                label="Price"
                value={price}
                onChange={setPrice}
                min={0}
                max={200}
                step={5}
                formatValue={(value) => `€${value}`}
            />
        </div>
    );
}

/** Steps, no visible label, and disabled. */
export function Variations() {
    return (
        <Stack gap="2xl" style={{ width: 320, maxWidth: "100%" }}>
            <Slider
                aria-label="Temperature"
                defaultValue={0.7}
                min={0}
                max={2}
                step={0.1}
                showValue
                formatValue={(value) => value.toFixed(1)}
            />
            <Slider label="Agents at once" defaultValue={3} min={1} max={6} disabled />
        </Stack>
    );
}
