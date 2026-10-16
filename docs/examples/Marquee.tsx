import { useState, type CSSProperties } from "react";

import { Marquee, Stack, Switch, Tag, Text } from "@openwarelabs/ui";
import { Anchor, Box, Hexagon, Layers, Mountain, Sun, Triangle, Waves } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Marquee",
    category: "Marketing",
    description:
        "Items that travel endlessly in one direction: a row of customers' logos, a ticker of figures or quotes, a tape of tags. For decoration and a feel of plenty; anything people must read goes in a list.",
    source: "components/Marquee/Marquee.tsx",
    imports: ["Marquee"],
    props: ["MarqueeProps", "MarqueeLabels"],
    keyboard: [
        ["Tab", "Moves to the pause button, and to any links among the items. While focus is inside, the items hold still."],
        ["Space or Enter", "On the button, stops the items or starts them again."],
    ],
    notes: [
        "The items are repeated to make the loop (autoFill adds enough copies to fill the strip). Screen readers get the first set only: every copy is aria-hidden and inert, so each link is reached once.",
        "With label, the strip is a region of that name.",
        "Moving content needs a way to stop it (WCAG 2.2.2), so controls is on by default: a small button in the end corner. Hover and focus only hold it still for a moment.",
        "With reduced motion nothing moves: the items stand in one row that wraps, with no fade and no button. On a vertical marquee they stand in a row too, so the height you set doesn't apply.",
        "speed is in pixels a second, so a longer list takes longer to go round but travels at the same pace. Keep it under about 60 for anything with words.",
        "up and down need a height on the Marquee itself, through style or className.",
        "The copies are visual, so don't put form controls, ids or anything stateful among the items.",
    ],
    related: ["Carousel", "Chip", "Tag"],
    since: "0.18.0",
};

// Invented companies, each lettered as its own wordmark. Swap in your customers' logos as SVGs in one colour.
const companies = [
    { name: "Halcyon", icon: Sun, style: { fontWeight: 600, letterSpacing: "-0.02em" } },
    { name: "QUARRY", icon: Box, style: { fontSize: 15, fontWeight: 800, letterSpacing: "0.12em" } },
    { name: "Basalt", icon: Hexagon, style: { fontWeight: 500 } },
    { name: "oakline", icon: Layers, style: { fontWeight: 600, letterSpacing: "-0.04em" } },
    { name: "FERRO", icon: Triangle, style: { fontSize: 15, fontWeight: 700, letterSpacing: "0.16em" } },
    { name: "lumen", icon: Waves, style: { fontSize: 22, fontWeight: 400 } },
    { name: "Pinecrest", icon: Mountain, style: { fontWeight: 600, letterSpacing: "-0.01em" } },
    { name: "Cobalt", icon: Anchor, style: { fontWeight: 800, letterSpacing: "-0.045em" } },
];

const wordmark: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "var(--ow-text-muted)",
    fontSize: 20,
    lineHeight: 1,
    whiteSpace: "nowrap",
};

/** Eight customers' wordmarks in a slow row that fades out at both ends. Rest the pointer on it to hold it still. */
export function Logos() {
    return (
        <Marquee label="Customer logos" gap={56} style={{ width: "100%", padding: "12px 0" }}>
            {companies.map(({ name, icon: Icon, style }) => (
                <span key={name} style={{ ...wordmark, ...style }}>
                    <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
                    {name}
                </span>
            ))}
        </Marquee>
    );
}
Logos.layout = { fill: true };

const figures = [
    { value: "4.2M", label: "requests a day", by: "Aoife Byrne, Tidy" },
    { value: "99.98%", label: "uptime over the year", by: "Cian Murphy, Lumen" },
    { value: "38 min", label: "from pull request to production", by: "Niamh Walsh, Orbit" },
    { value: "1,200", label: "teams on paid plans", by: "Saoirse Kelly, Kite" },
    { value: "€0", label: "spent on a second deploy tool", by: "Oisín Doyle, Northwind" },
];

/** A ticker of figures that climbs, in a box of a set height. The vertical directions need one. */
export function Stats() {
    return (
        <Marquee label="Figures from customers" direction="up" speed={24} gap="3xl" style={{ height: 220, width: "100%", maxWidth: 420 }}>
            {figures.map((figure) => (
                <Stack key={figure.value} gap="2xs">
                    <Stack direction="row" gap="sm" align="baseline">
                        <Text variant="section-title" as="span">
                            {figure.value}
                        </Text>
                        <Text variant="copy" tone="muted" as="span">
                            {figure.label}
                        </Text>
                    </Stack>
                    <Text variant="caption" tone="soft">
                        {figure.by}
                    </Text>
                </Stack>
            ))}
        </Marquee>
    );
}
Stats.layout = { fill: true };

const topics = ["Design systems", "Accessibility", "React", "Dark mode", "Tokens", "Typography", "Charts", "Forms", "Motion", "Icons", "Layout", "Colour"];

/** A fast tape of tags going the other way, stopped by a switch instead of the built-in button (`paused` is controlled). */
export function Tags() {
    const [paused, setPaused] = useState(false);
    return (
        <Stack gap="lg" style={{ width: "100%" }}>
            <Marquee label="Topics" direction="right" speed={90} gap="sm" controls={false} paused={paused} onPausedChange={setPaused}>
                {topics.map((topic) => (
                    <Tag key={topic}>{topic}</Tag>
                ))}
            </Marquee>
            <Stack direction="row" gap="sm" align="center">
                <Switch checked={paused} onChange={setPaused} aria-labelledby="marquee-tags-hold" />
                <Text as="span" variant="label" id="marquee-tags-hold">
                    Hold the tags still
                </Text>
            </Stack>
        </Stack>
    );
}
Tags.layout = { fill: true, align: "start" as const };
