import { Badge, Button, Card, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Card",
    category: "Layout",
    description:
        "A surface with a hairline border and no shadow, to group related content. Borders before shadows.",
    source: "components/Card/Card.tsx",
    notes: [
        "It's a plain div. Give it a heading inside, or aria-labelledby, when it stands for a section.",
        'padding="none" lets a list or table run edge to edge.',
    ],
    related: ["SettingsRow", "Stack"],
};

/** A project card. */
export function Basic() {
    return (
        <Card style={{ width: 320, maxWidth: "100%" }}>
            <Stack gap="sm">
                <Stack direction="row" justify="between" align="center">
                    <strong style={{ fontWeight: 600 }}>recipe-app</strong>
                    <Badge variant="success" size="sm">
                        Live
                    </Badge>
                </Stack>
                <p style={{ margin: 0, color: "var(--ow-text-muted)", fontSize: 14 }}>
                    A shared shopping list that sorts itself by aisle.
                </p>
                <Stack direction="row" gap="xs" style={{ marginTop: 8 }}>
                    <Button size="sm" variant="primary">
                        Open
                    </Button>
                    <Button size="sm">Settings</Button>
                </Stack>
            </Stack>
        </Card>
    );
}
Basic.layout = { ground: "canvas" as const };

/** Three paddings: none, md (16px) and lg (24px). */
export function Padding() {
    return (
        <Stack direction="row" gap="md" wrap align="start">
            {(["none", "md", "lg"] as const).map((padding) => (
                <Card key={padding} padding={padding}>
                    <div
                        style={{
                            background: "var(--ow-primary-subtle)",
                            color: "var(--ow-primary-text)",
                            padding: "8px 12px",
                            borderRadius: 6,
                            fontSize: 13,
                        }}
                    >
                        padding="{padding}"
                    </div>
                </Card>
            ))}
        </Stack>
    );
}
Padding.layout = { ground: "canvas" as const };
