import { Avatar, Badge, Card, Link, Stack, Text, Timeline, TimelineItem } from "@openwarelabs/ui";
import { Bot, Check, CircleX, GitMerge, PackageCheck, Rocket, Truck } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Timeline",
    category: "Data display",
    description:
        "Events down a line: an activity feed of who did what, a changelog, or the history of an order or a ticket.",
    source: "components/Timeline/Timeline.tsx",
    imports: ["Timeline", "TimelineItem"],
    props: ["TimelineProps", "TimelineItemProps"],
    notes: [
        "It's an ordered list, one item per event. Give it an aria-label (\"Activity\") when there's no heading above it.",
        "Pass dateTime with time (\"2026-10-13T14:32\") and the time is a <time> element, so it can be read by machines as well as people.",
        'density="compact" is for a feed: the title is the sentence, with the people and things in it in <strong>, and the time follows it. density="comfortable" is for a changelog or a history, with room for a description or a card.',
        "The marker is decoration: the tone's colour never says something the words don't. An avatar beside a name is hidden from screen readers too.",
        "A pending item is something still to come: its marker is hollow, the line to it dashed, and screen readers hear \"Upcoming\" before its title.",
    ],
    related: ["Steps", "Avatar", "Badge", "User"],
    since: "0.14.0",
};

/** An activity feed: compact, with who did it on the line and a comment quoted under its event. */
export function ActivityFeed() {
    return (
        <Timeline density="compact" aria-label="Activity" style={{ width: 440, maxWidth: "100%" }}>
            <TimelineItem
                avatar={<Avatar name="Clodagh Nolan" size="sm" />}
                title={
                    <>
                        <strong>Clodagh Nolan</strong> merged <strong>#42 Round VAT per line</strong>
                    </>
                }
                time="2h ago"
                dateTime="2026-10-13T12:30"
            />
            <TimelineItem
                avatar={<Avatar name="Aoife O'Sullivan" size="sm" />}
                title={
                    <>
                        <strong>Aoife O'Sullivan</strong> commented on <strong>#42</strong>
                    </>
                }
                time="3h ago"
                dateTime="2026-10-13T11:47"
            >
                <Card style={{ marginTop: 4, background: "var(--ow-surface-muted)" }}>
                    <Text variant="caption" tone="soft" as="p">
                        The rounding looks right now. Can we add a test for a customer in Dublin at 23:30 UTC?
                    </Text>
                </Card>
            </TimelineItem>
            <TimelineItem
                icon={<Bot size={14} />}
                tone="brand"
                title={
                    <>
                        An agent opened <strong>#42</strong> for Ciarán Kelly
                    </>
                }
                time="5h ago"
                dateTime="2026-10-13T09:05"
            >
                6 files changed in billing-api
            </TimelineItem>
            <TimelineItem
                avatar={<Avatar name="Ciarán Kelly" size="sm" />}
                title={
                    <>
                        <strong>Ciarán Kelly</strong> created the issue
                    </>
                }
                time="Yesterday"
                dateTime="2026-10-12"
            />
        </Timeline>
    );
}
ActivityFeed.layout = { align: "start" as const };

/** A changelog: roomy, with a dot for each release and what changed under it. */
export function Changelog() {
    return (
        <Timeline aria-label="Releases" style={{ width: 480, maxWidth: "100%" }}>
            <TimelineItem tone="brand" title="0.13.0" time="14 Oct 2026" dateTime="2026-10-14">
                Table gets an inset style, its rows on a raised panel inside a tinted tray.
            </TimelineItem>
            <TimelineItem title="0.12.2" time="12 Oct 2026" dateTime="2026-10-12">
                Fixes the focus ring on segmented controls in dark mode.
            </TimelineItem>
            <TimelineItem title="0.12.0" time="9 Oct 2026" dateTime="2026-10-09">
                <Stack gap="sm">
                    <span>AppShell, a sidebar and page frame that folds into a drawer on narrow screens.</span>
                    <Link href="#" variant="standalone">
                        Read the release notes
                    </Link>
                </Stack>
            </TimelineItem>
        </Timeline>
    );
}
Changelog.layout = { align: "start" as const };

/** Icons and tones: a deploy history, where the colour of each circle matches what happened. */
export function Tones() {
    return (
        <Timeline aria-label="Deploys" style={{ width: 480, maxWidth: "100%" }}>
            <TimelineItem
                icon={<Rocket size={14} />}
                tone="success"
                title="Deployed to production"
                time="14:32"
                dateTime="2026-10-13T14:32"
            >
                <Stack direction="row" gap="sm" align="center" wrap>
                    <Badge size="sm" variant="success">
                        Live
                    </Badge>
                    <span>main · 3f9c2a1 · built in 48 s</span>
                </Stack>
            </TimelineItem>
            <TimelineItem
                icon={<CircleX size={14} />}
                tone="danger"
                title="Deploy failed"
                time="13:10"
                dateTime="2026-10-13T13:10"
            >
                Tests failed in checkout.spec.ts.
            </TimelineItem>
            <TimelineItem
                icon={<GitMerge size={14} />}
                title="Merged #479 Pricing page copy"
                time="11:47"
                dateTime="2026-10-13T11:47"
            />
            <TimelineItem tone="warning" title="Build cache cleared" time="09:20" dateTime="2026-10-13T09:20">
                The next build will take longer than usual.
            </TimelineItem>
        </Timeline>
    );
}
Tones.layout = { align: "start" as const };

/** What's still to come: pending items have a hollow marker and a dashed line, here on an order's way to you. */
export function Pending() {
    return (
        <Timeline aria-label="Order status" style={{ width: 400, maxWidth: "100%" }}>
            <TimelineItem icon={<Check size={14} />} tone="success" title="Order placed" time="Mon 12 Oct" dateTime="2026-10-12" />
            <TimelineItem icon={<Truck size={14} />} tone="brand" title="On its way" time="Tue 13 Oct" dateTime="2026-10-13">
                With the courier, due by 6pm tomorrow.
            </TimelineItem>
            <TimelineItem icon={<PackageCheck size={14} />} pending title="Delivered" time="Wed 14 Oct" />
        </Timeline>
    );
}
Pending.layout = { align: "start" as const };
