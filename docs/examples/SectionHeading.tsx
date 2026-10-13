import { SectionHeading } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "SectionHeading",
    category: "Marketing",
    description:
        "How a marketing section opens: a Chip, a big light title, then an intro in muted text.",
    source: "components/Marketing/Marketing.tsx",
    notes: ["Set as to keep the page's heading outline in order: one h1, then h2s."],
    related: ["Chip", "SiteHeader"],
};

/** Centred, at the top of a section. */
export function Centred() {
    return (
        <SectionHeading
            align="center"
            eyebrow="How it works"
            title="Describe it. Watch it get built."
            intro="A team of agents plans, writes and reviews the code. You decide what ships."
        />
    );
}
Centred.layout = { ground: "paper" as const };

/** Start-aligned, beside content. */
export function Start() {
    return (
        <SectionHeading
            eyebrow="Pricing"
            title="Pay for what you run"
            intro="Bring your own keys. No seats, no markup."
            as="h3"
        />
    );
}
Start.layout = { ground: "paper" as const, align: "start" as const };
