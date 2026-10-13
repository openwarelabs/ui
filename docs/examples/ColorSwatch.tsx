import { ColorSwatch, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ColorSwatch",
    category: "Data display",
    description:
        "A sample of a colour, with its name and value if you give them. These docs use it for the palette.",
    source: "components/Tag/Tag.tsx",
    notes: [
        "It has a hairline inside the edge, so white and near-background colours still show.",
        "With a name it reads out as “Midnight, #1e3a8a”.",
    ],
    related: ["Tag"],
};

/** With names and values. */
export function Named() {
    return (
        <Stack direction="row" gap="xl" wrap>
            <ColorSwatch color="var(--ow-brand-600)" name="Midnight" value="brand-600" size="lg" />
            <ColorSwatch color="var(--ow-brass)" name="Brass" value="brass" size="lg" />
            <ColorSwatch color="var(--ow-surface)" name="Surface" value="surface" size="lg" />
        </Stack>
    );
}

/** Small circles, for a picker. */
export function Circles() {
    return (
        <Stack direction="row" gap="xs">
            {["#1e3a8a", "#0f766e", "#7c3aed", "#be123c", "#b45309", "#334155"].map((color) => (
                <ColorSwatch key={color} color={color} shape="circle" size="sm" />
            ))}
        </Stack>
    );
}
