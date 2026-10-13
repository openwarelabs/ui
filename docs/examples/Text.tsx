import { Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Text",
    category: "Typography",
    description:
        "Text in one of the styles on the Typography page, by the same names: a hero, a lead, a caption, an overline.",
    source: "components/Text/Text.tsx",
    props: ["TextProps"],
    notes: [
        "The variant sets the look and a sensible element; set as to keep the page's outline right, such as a section-title on an h3.",
        "Lead, copy, caption and overline are muted unless you give a tone; the rest take the colour around them.",
        "The display styles (hero, page-title, section-title, heading) shrink on screens under 760px wide.",
    ],
    related: ["SectionHeading", "Code", "Kbd"],
    since: "0.3.0",
};

/** The display styles, for marketing pages and long reading. */
export function Display() {
    return (
        <Stack gap="lg">
            <Text variant="hero">Ship more of what you plan</Text>
            <Text variant="page-title" as="p">
                Pricing
            </Text>
            <Text variant="section-title" as="p">
                Everything in one place
            </Text>
            <Text variant="heading" as="p">
                How agents work
            </Text>
            <Text variant="lead">Plan the work, hand the routine parts to agents, review every change and ship it.</Text>
            <Text variant="prose">
                Each run starts from a fresh copy of your repository, set up the way your CI sets it up, and ends in a pull
                request your team reviews like any other.
            </Text>
        </Stack>
    );
}
Display.layout = { align: "start" as const, ground: "paper" as const };

/** The interface styles, for the app itself. */
export function Interface() {
    return (
        <Stack gap="md">
            <Text variant="overline">Workspace</Text>
            <Text variant="dialog-title">Rename project</Text>
            <Text variant="card-title">billing-api</Text>
            <Text variant="body">Deploys from main when checks pass.</Text>
            <Text variant="copy">The folder on disk keeps its name, and so do its links.</Text>
            <Text variant="label">Project name</Text>
            <Text variant="caption">Letters, numbers and dashes.</Text>
        </Stack>
    );
}
Interface.layout = { align: "start" as const };

/** Tones for status and emphasis; the variant still sets the size. */
export function Tones() {
    return (
        <Stack gap="xs">
            <Text tone="default">Default: the text colour</Text>
            <Text tone="soft">Soft: secondary labels</Text>
            <Text tone="muted">Muted: descriptions and hints</Text>
            <Text tone="primary">Primary: a selected value</Text>
            <Text tone="success">Success: deployed to production</Text>
            <Text tone="warning">Warning: the build is slow today</Text>
            <Text tone="danger">Danger: the deploy failed</Text>
        </Stack>
    );
}
Tones.layout = { align: "start" as const };

/** truncate keeps a long value to one line; align centres or ends it. */
export function TruncateAndAlign() {
    return (
        <Stack gap="md" style={{ width: 280, maxWidth: "100%" }}>
            <Text truncate title="fix/invoice-dates-for-customers-outside-the-utc-time-zone">
                fix/invoice-dates-for-customers-outside-the-utc-time-zone
            </Text>
            <Text variant="caption" align="center">
                Centred caption under a chart
            </Text>
            <Text variant="code" tone="muted" align="end">
                3f9c2a1
            </Text>
        </Stack>
    );
}
