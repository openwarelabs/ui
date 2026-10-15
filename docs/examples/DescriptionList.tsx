import { Badge, Button, Card, Code, CopyButton, DescriptionItem, DescriptionList, Link, Stack, Text, User } from "@openwarelabs/ui";
import { Pencil } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "DescriptionList",
    category: "Data display",
    description:
        "Terms and their values, for a detail page, a summary of settings or a receipt: a label on the left and its value beside it, above it, or in a grid.",
    source: "components/DescriptionList/DescriptionList.tsx",
    imports: ["DescriptionList", "DescriptionItem"],
    props: ["DescriptionListProps", "DescriptionItemProps"],
    notes: [
        "It's a <dl>, with each DescriptionItem a <div> holding a <dt> and a <dd>, so screen readers announce it as a list and pair each term with its value.",
        "The horizontal layout stacks the term above its value when the list is narrower than 420px. It measures its own width, not the window's, so it stacks in a narrow card or side panel too.",
        "A grid has as many columns as you ask for while each can be at least 160px wide, and fewer when it can't.",
        'Name an action for its value: "Edit email", or an aria-label on an icon button. It is read after the value, inside the <dd>.',
        "Use it for one record's details; for many records with the same fields, use a Table.",
    ],
    related: ["Table", "SettingsRow", "Card", "Stat"],
    since: "0.14.0",
};

/** A detail page: terms on the left, rich values on the right, with a rule between rows. */
export function Horizontal() {
    return (
        <Card padding="lg" style={{ width: "100%" }}>
            <DescriptionList divided>
                <DescriptionItem term="Project">recipe-app</DescriptionItem>
                <DescriptionItem term="Owner">
                    <User name="Maya Chen" description="maya@example.com" size="sm" />
                </DescriptionItem>
                <DescriptionItem term="Status">
                    <Badge variant="success">Deployed</Badge>
                </DescriptionItem>
                <DescriptionItem term="Repository">
                    <Link href="#repository">github.com/openware/recipe-app</Link>
                </DescriptionItem>
                <DescriptionItem term="Last commit">
                    <Code>4f2a9c1</Code> Add a shopping list to every recipe
                </DescriptionItem>
            </DescriptionList>
        </Card>
    );
}
Horizontal.layout = { fill: true, ground: "canvas" };

/** Actions at the end of a row: edit a setting, or copy a value. */
export function WithActions() {
    return (
        <Card padding="lg" style={{ width: "100%" }}>
            <DescriptionList divided termWidth={140}>
                <DescriptionItem
                    term="Name"
                    action={
                        <Button variant="ghost" size="sm" startIcon={<Pencil size={16} />} aria-label="Edit name">
                            Edit
                        </Button>
                    }
                >
                    Maya Chen
                </DescriptionItem>
                <DescriptionItem
                    term="Email"
                    action={
                        <Button variant="ghost" size="sm" startIcon={<Pencil size={16} />} aria-label="Edit email">
                            Edit
                        </Button>
                    }
                >
                    maya@example.com
                </DescriptionItem>
                <DescriptionItem term="API key" action={<CopyButton value="ow_live_7Hc2kQ9xP4" label="Copy API key" iconOnly />}>
                    <Code>ow_live_7Hc2…</Code>
                </DescriptionItem>
            </DescriptionList>
        </Card>
    );
}
WithActions.layout = { fill: true, ground: "canvas" };

/** A grid of three columns, term above value, for a summary at a glance; the address takes the whole row. */
export function Grid() {
    return (
        <Card padding="lg" style={{ width: "100%" }}>
            <Stack gap="lg">
                <Text as="h3" variant="card-title">
                    Order #4821
                </Text>
                <DescriptionList layout="grid" columns={3} divided>
                    <DescriptionItem term="Placed">12 October 2026</DescriptionItem>
                    <DescriptionItem term="Payment">Visa ending 4242</DescriptionItem>
                    <DescriptionItem term="Status">
                        <Badge variant="active">Shipped</Badge>
                    </DescriptionItem>
                    <DescriptionItem term="Customer">Sam Okafor</DescriptionItem>
                    <DescriptionItem term="Total">€148.20</DescriptionItem>
                    <DescriptionItem term="Tracking">
                        <Link href="#tracking">DHL 00340434</Link>
                    </DescriptionItem>
                    <DescriptionItem term="Delivery address" span="full">
                        Keizersgracht 123, 1015 CJ Amsterdam, the Netherlands
                    </DescriptionItem>
                </DescriptionList>
            </Stack>
        </Card>
    );
}
Grid.layout = { fill: true, ground: "canvas" };

/** Vertical and compact, for a narrow side panel. */
export function Vertical() {
    return (
        <Card style={{ width: 280 }}>
            <DescriptionList layout="vertical" density="compact">
                <DescriptionItem term="Created">3 September 2026</DescriptionItem>
                <DescriptionItem term="Region">Frankfurt (eu-central-1)</DescriptionItem>
                <DescriptionItem term="Branch">
                    <Code>main</Code>
                </DescriptionItem>
                <DescriptionItem term="Build time">1m 42s</DescriptionItem>
            </DescriptionList>
        </Card>
    );
}
Vertical.layout = { ground: "canvas" };

/** A receipt: compact rows, the values lined up at the end. */
export function Receipt() {
    const lines = [
        ["Pro plan, October", "€40.00"],
        ["Extra seats (2)", "€16.00"],
        ["VAT (21%)", "€11.76"],
    ];
    return (
        <Card style={{ width: "100%", maxWidth: 480 }}>
            <DescriptionList divided density="compact" termWidth="1fr" style={{ fontVariantNumeric: "tabular-nums" }}>
                {lines.map(([term, value]) => (
                    <DescriptionItem key={term} term={term}>
                        <div style={{ textAlign: "end" }}>{value}</div>
                    </DescriptionItem>
                ))}
                <DescriptionItem term="Total" style={{ fontWeight: 600 }}>
                    <div style={{ textAlign: "end" }}>€67.76</div>
                </DescriptionItem>
            </DescriptionList>
        </Card>
    );
}
Receipt.layout = { fill: true, ground: "canvas" };
