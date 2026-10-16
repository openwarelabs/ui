import { useRef, useState } from "react";

import { Affix, Badge, Button, Stack, Text, Toolbar } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Affix",
    category: "Layout",
    description:
        "Keeps a toolbar, a header or a bar of actions at the top or bottom of the scroll area once it would scroll past, and knows when it's pinned so it can gain a shadow or change.",
    source: "components/Affix/Affix.tsx",
    imports: ["Affix"],
    props: ["AffixProps", "AffixState"],
    notes: [
        "It's `position: sticky` by default, which needs no element between it and the scroll container to clip overflow (`overflow: hidden` or `auto`), and pins within its parent: when the parent scrolls out, so does it. Where that can't be arranged, `mode=\"fixed\"` pins it to the viewport and leaves a placeholder of its height in flow.",
        "Whether it's pinned comes from an IntersectionObserver on the element (or, in fixed mode, its placeholder), not a scroll listener, so the shadow and `onChange` are exact and cost nothing while nothing changes.",
        "Pass `container` when a box scrolls rather than the window, as in these examples, so the observer watches that box's edge.",
        "It's presentational: the content stays where it is in the document and reading order, and nothing is hidden. `data-affixed` is `\"true\"` or `\"false\"` on the element for your own CSS.",
        "A pinned bar can cover what the keyboard moves focus to. Give the scroll container `scroll-padding-top` (or `-bottom`) of the bar's height plus `offset`, so the browser scrolls focused controls and anchor targets out from under it.",
        "SiteHeader is the marketing header's look, a floating pill; it doesn't pin itself. Wrap it in Affix to keep it in view, and use the function child to change it once pinned.",
    ],
    related: ["SiteHeader", "ScrollShadow", "Toolbar"],
    since: "0.18.0",
};

const box = {
    height: 260,
    overflowY: "auto" as const,
    border: "1px solid var(--ow-border)",
    borderRadius: "var(--ow-radius-container)",
    background: "var(--ow-surface)",
};

const notes = [
    "Aoife opened with the numbers: 412 teams on the new plans, churn down a point, and support tickets about billing halved since the invoice redesign.",
    "Cian walked through the import pipeline. The CSV parser now streams, so a 300 MB export from the old system finishes in under a minute rather than timing out.",
    "Niamh raised the login redirect loop again. It only shows up when the session cookie expires mid-request; Eoin has a fix in review.",
    "Saoirse asked for a dark map style before the conference. Oisín will take it once the chart colours are signed off.",
    "Next week: rate-limit the export endpoint, write the release notes, and decide whether the mobile drawer keeps the search box.",
    "Open questions went to the board: the pricing page's annual toggle, and whether trials need a card up front.",
];

function Paragraphs() {
    return (
        <Stack gap="md" style={{ padding: "var(--ow-space-lg)" }}>
            {notes.map((note) => (
                <Text key={note} variant="body" tone="soft">
                    {note}
                </Text>
            ))}
        </Stack>
    );
}

/** A toolbar that sticks to the top of the scrolling box; the function child shows a badge while it's pinned. */
export function StickyToolbar() {
    const scroller = useRef<HTMLDivElement>(null);
    return (
        <div ref={scroller} style={box}>
            <div style={{ padding: "var(--ow-space-lg) var(--ow-space-lg) 0" }}>
                <Text variant="card-title">Weekly sync, 14 October</Text>
            </div>
            <Affix container={scroller}>
                {({ affixed }) => (
                    <Toolbar aria-label="Notes" variant="plain" size="sm">
                        <Button size="sm" variant="secondary">
                            Edit
                        </Button>
                        <Button size="sm" variant="secondary">
                            Share
                        </Button>
                        {affixed ? <Badge variant="active">Affixed</Badge> : null}
                    </Toolbar>
                )}
            </Affix>
            <Paragraphs />
        </div>
    );
}
StickyToolbar.layout = { align: "start" as const, fill: true, minHeight: 300 };

/** A bar of actions pinned to the bottom until the end of the form scrolls into view. */
export function BottomActions() {
    const scroller = useRef<HTMLDivElement>(null);
    const [pinned, setPinned] = useState(false);
    return (
        <Stack gap="sm" style={{ width: "100%" }}>
            <div ref={scroller} style={box}>
                <Paragraphs />
                <Affix position="bottom" container={scroller} onChange={setPinned}>
                    <Stack direction="row" gap="sm" justify="end" style={{ padding: "var(--ow-space-sm) var(--ow-space-lg)" }}>
                        <Button size="sm" variant="secondary">
                            Discard
                        </Button>
                        <Button size="sm" variant="primary">
                            Save notes
                        </Button>
                    </Stack>
                </Affix>
                <Text variant="caption" tone="muted" style={{ padding: "var(--ow-space-sm) var(--ow-space-lg) var(--ow-space-lg)" }}>
                    Last edited by Niamh Byrne, 14 October.
                </Text>
            </div>
            <Text variant="caption" tone="muted">
                {pinned ? "The bar is pinned to the bottom." : "The bar is in its place at the end."}
            </Text>
        </Stack>
    );
}
BottomActions.layout = { align: "start" as const, fill: true, minHeight: 320 };

/** `mode="fixed"` for layouts where sticky can't work: a placeholder keeps the space, and `offset` leaves a gap at the edge. */
export function FixedWithOffset() {
    const scroller = useRef<HTMLDivElement>(null);
    return (
        <div ref={scroller} style={box}>
            <div style={{ padding: "var(--ow-space-lg) var(--ow-space-lg) 0" }}>
                <Text variant="card-title">Release 0.18</Text>
            </div>
            <Affix mode="fixed" offset={12} container={scroller} style={{ padding: "var(--ow-space-sm) var(--ow-space-lg)" }}>
                <Stack direction="row" gap="sm" align="center" justify="between">
                    <Stack direction="row" gap="sm" align="center">
                        <Text variant="label">Draft</Text>
                        <Badge>Unpublished</Badge>
                    </Stack>
                    <Button size="sm" variant="primary">
                        Publish
                    </Button>
                </Stack>
            </Affix>
            <Paragraphs />
        </div>
    );
}
FixedWithOffset.layout = { align: "start" as const, fill: true, minHeight: 300 };
