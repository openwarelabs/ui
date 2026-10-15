import { Button, Card, Section, SectionHeading, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Section",
    category: "Layout",
    description:
        "A full-width band of a page with the blocks' space above and below, and their width and side margins inside, for your own sections between blocks.",
    source: "components/Section/Section.tsx",
    imports: ["Section"],
    notes: [
        "It renders a <section>. Name it with aria-labelledby pointing at its heading, as a block does.",
        "tone sets the ground: paper (the default) like the marketing blocks, canvas for the app's grey, surface for a white band that stands out.",
        "size sets the width inside, as for Container; size={false} leaves the content full width.",
        'spacing="md" is a block\'s space (96px, 72px on phones); sm is half, for sections that belong together.',
    ],
    related: ["Container", "SectionHeading", "Stack"],
    since: "0.11.0",
};

const steps = [
    ["Connect a repository", "Pick the repositories agents may work in."],
    ["Hand off an issue", "Assign it to an agent, as you would to a person."],
    ["Review and ship", "Every change comes back as a pull request."],
];

/** A section of your own between blocks: heading, cards and an action, lined up with the blocks around it. */
export function Basic() {
    return (
        <Section aria-labelledby="section-steps" spacing="sm" style={{ width: "100%" }}>
            <Stack gap="2xl">
                <SectionHeading
                    eyebrow="How it works"
                    title={<span id="section-steps">From issue to release</span>}
                    intro="Three steps, the same for people and agents."
                />
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 16,
                    }}
                >
                    {steps.map(([title, text], index) => (
                        <Card key={title} padding="lg">
                            <Text variant="caption">Step {index + 1}</Text>
                            <Text as="h3" variant="card-title">
                                {title}
                            </Text>
                            <Text variant="copy">{text}</Text>
                        </Card>
                    ))}
                </div>
                <div>
                    <Button variant="primary" shape="pill">
                        Start for free
                    </Button>
                </div>
            </Stack>
        </Section>
    );
}
Basic.layout = { fill: true };

/** A surface band, to set a section apart from the paper around it. */
export function Surface() {
    return (
        <Section tone="surface" spacing="sm" aria-label="Customers" style={{ width: "100%" }}>
            <Text variant="lead" align="center">
                Trusted by teams who ship every day.
            </Text>
        </Section>
    );
}
Surface.layout = { fill: true, ground: "paper" };
