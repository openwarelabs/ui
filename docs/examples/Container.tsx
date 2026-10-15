import { Card, Container, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Container",
    category: "Layout",
    description:
        "Centres a page's content at a set width, with the side margins every block uses, so your own content lines up with the blocks around it.",
    source: "components/Container/Container.tsx",
    imports: ["Container"],
    notes: [
        "The side margins are 32px, and the phone gutter under 760px: the same as every block's, so text in a Container starts where a block's does.",
        'size="page" is the blocks\' width. Use narrow for reading (an article, a form, settings), wide for a dashboard, full for edge to edge with margins only.',
        "It's a plain element: pass as=\"main\" for a page's main content, so the landmark and the width come in one.",
        "For a full-width band with the blocks' space above and below, use Section, which puts a Container inside.",
    ],
    related: ["Section", "Stack", "Card"],
    since: "0.11.0",
};

const sizes = [
    { size: "narrow", width: "720px", use: "An article, a form, a settings page" },
    { size: "page", width: "1200px", use: "The default, as wide as the blocks" },
    { size: "wide", width: "1440px", use: "A dashboard or a big table" },
] as const;

/** Each size with its width. The box is narrower than a page, so here they reach its sides; on a page they stop at their width. */
export function Sizes() {
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            {sizes.map(({ size, width, use }) => (
                <Container key={size} size={size}>
                    <Card>
                        <Stack gap="3xs">
                            <Text variant="label">
                                {size} · {width}
                            </Text>
                            <Text variant="caption">{use}</Text>
                        </Stack>
                    </Card>
                </Container>
            ))}
        </Stack>
    );
}
Sizes.layout = { fill: true, ground: "canvas" };

/** An app page: the main landmark at a reading width. */
export function AppPage() {
    return (
        <Container as="main" size="narrow" style={{ paddingBlock: 32 }}>
            <Stack gap="lg">
                <Text as="h1" variant="heading">
                    Account
                </Text>
                <Card>
                    <Text variant="copy">
                        Your name, email and password, at a width that's easy to read.
                    </Text>
                </Card>
            </Stack>
        </Container>
    );
}
AppPage.layout = { fill: true, ground: "canvas" };
