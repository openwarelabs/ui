import { Button, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Stack",
    category: "Layout",
    description: "Lays children out in a row or a column, with a gap from the spacing scale.",
    source: "components/Layout/Layout.tsx",
    imports: ["Stack", "type SpaceToken"],
    notes: [
        'It\'s a flexbox with nothing else on it. Use as="ul", as="section" and so on to keep the markup meaningful.',
    ],
    related: ["Separator", "Card"],
};

function Box({ children }: { children: string }) {
    return (
        <div
            style={{
                background: "var(--ow-primary-subtle)",
                color: "var(--ow-primary-text)",
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: 13,
            }}
        >
            {children}
        </div>
    );
}

/** A column (the default) and a row. */
export function Directions() {
    return (
        <Stack direction="row" gap="4xl" align="start">
            <Stack gap="sm">
                <Box>One</Box>
                <Box>Two</Box>
                <Box>Three</Box>
            </Stack>
            <Stack direction="row" gap="sm">
                <Box>One</Box>
                <Box>Two</Box>
                <Box>Three</Box>
            </Stack>
        </Stack>
    );
}

/** justify="between" pushes the ends apart, for a toolbar. */
export function Toolbar() {
    return (
        <Stack direction="row" justify="between" align="center" style={{ width: "100%" }}>
            <strong style={{ fontWeight: 600 }}>12 runs</strong>
            <Stack direction="row" gap="xs">
                <Button size="sm">Export</Button>
                <Button size="sm" variant="primary">
                    New run
                </Button>
            </Stack>
        </Stack>
    );
}
Toolbar.layout = { fill: true };

/** The gap scale, from 3xs (2px) to 2xl (24px). */
export function Gaps() {
    return (
        <Stack gap="lg">
            {(["3xs", "xs", "md", "xl", "2xl"] as const).map((gap) => (
                <Stack key={gap} direction="row" gap="md" align="center">
                    <code style={{ fontFamily: "var(--ow-font-mono)", fontSize: 12, width: 36 }}>
                        {gap}
                    </code>
                    <Stack direction="row" gap={gap}>
                        <Box>A</Box>
                        <Box>B</Box>
                        <Box>C</Box>
                    </Stack>
                </Stack>
            ))}
        </Stack>
    );
}
