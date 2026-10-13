import { Button, DotGrid, SectionHeading, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "DotGrid",
    category: "Marketing",
    description:
        "A ground of 1px dots every 22px, like a sheet laid out for planning. Content goes inside.",
    source: "components/Marketing/Marketing.tsx",
    notes: [
        "The dots are decoration and hidden from screen readers.",
        "interactive turns the dots under the pointer brass; it does nothing for touch or keyboard, so don't put meaning in it.",
    ],
    related: ["SectionHeading", "SiteHeader"],
};

/** A hero on a fading, interactive grid. Move the pointer over it. */
export function Hero() {
    return (
        <DotGrid fade interactive style={{ width: "100%", padding: "56px 24px", borderRadius: 12 }}>
            <Stack gap="xl" align="center">
                <SectionHeading
                    align="center"
                    as="h3"
                    eyebrow="Openware"
                    title="Build the thing, not the buttons"
                    intro="Components that already look finished, in light and dark."
                />
                <Stack direction="row" gap="sm">
                    <Button variant="primary" shape="pill">
                        Get started
                    </Button>
                    <Button shape="pill">Browse components</Button>
                </Stack>
            </Stack>
        </DotGrid>
    );
}
Hero.layout = { fill: true, ground: "paper" as const };
