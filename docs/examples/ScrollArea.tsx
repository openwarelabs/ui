import { Avatar, Card, ScrollArea, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "ScrollArea",
    category: "Layout",
    description:
        "A scrolling area with its own thin scrollbars, drawn in the theme's colours over the content, that show on hover or while scrolling and fade away: a sidebar, a chat, a row of cards. The native scrollbar is hidden, not replaced, so the wheel, touch and the keyboard scroll it as usual.",
    source: "components/ScrollArea/ScrollArea.tsx",
    imports: ["ScrollArea"],
    props: ["ScrollAreaProps"],
    keyboard: [
        ["Tab", "Moves onto the viewport while it has something to scroll, then into any links and buttons inside."],
        ["Arrows, Page Up, Page Down, Home, End", "Scroll the viewport while it has focus, as any scrolling box does."],
    ],
    notes: [
        "The viewport is the real scroll container with its native scrollbar hidden by CSS; the thumbs are aria-hidden drawings of its position. Dragging a thumb scrolls it, and clicking the track pages towards the pointer.",
        "With the native scrollbar gone, the keyboard is the only other way to scroll without a wheel, so the viewport takes a Tab stop (tabIndex 0) while its content overflows, and none once it fits. Give it an aria-label and it's also a region, so a screen reader can land on it by name.",
        "Thumbs are sized from the viewport's scroll geometry through a ResizeObserver and its scroll event, and aren't in the page at all while there's nothing to scroll.",
        'type="hover" shows them while the pointer is over the area, while it has focus, and while it scrolls; "scroll" only while it scrolls (scrollHideDelay, 600ms by default); "always" keeps them whenever there\'s overflow.',
        "Under prefers-reduced-motion the thumbs still show and hide, without the fade, and a click on the track jumps rather than glides.",
        "In right-to-left text a horizontal thumb starts at the right and dragging follows the pointer.",
        "ScrollShadow fades the edges of a scrolling area and leaves its scrollbar as it is; VirtualList is for thousands of rows.",
    ],
    related: ["ScrollShadow", "VirtualList"],
    since: "0.18.0",
};

const people = [
    ["Aoife Byrne", "Design"],
    ["Cian Murphy", "Engineering"],
    ["Niamh Walsh", "Support"],
    ["Saoirse Kelly", "Engineering"],
    ["Oisín Doyle", "Marketing"],
    ["Eoin Brennan", "Engineering"],
    ["Fionn Ryan", "Sales"],
    ["Caoimhe Nolan", "Design"],
    ["Tadhg Quinn", "Finance"],
    ["Róisín Daly", "Support"],
    ["Darragh Moran", "Engineering"],
    ["Síofra Burke", "Legal"],
] as const;

/** A tall list capped by maxHeight. Hover over it, or scroll, to see the thumb. */
export function TallList() {
    return (
        <Card padding="none" style={{ width: 320, maxWidth: "100%" }}>
            <ScrollArea maxHeight={240} aria-label="People">
                <ul style={{ margin: 0, padding: "var(--ow-space-xs) 0", listStyle: "none" }}>
                    {people.map(([name, team]) => (
                        <li key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px" }}>
                            <Avatar name={name} size="sm" />
                            <Stack gap="3xs">
                                <Text variant="label">
                                    {name}
                                </Text>
                                <Text variant="caption" tone="muted">
                                    {team}
                                </Text>
                            </Stack>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </Card>
    );
}
TallList.layout = { align: "start" as const };

const releases = [
    ["0.17.0", "DataGrid and Kanban"],
    ["0.16.0", "Splitter and VirtualList"],
    ["0.15.0", "Charts take a brand palette"],
    ["0.14.0", "Calendar and DatePicker"],
    ["0.13.0", "CommandPalette"],
    ["0.12.0", "A dark theme"],
    ["0.11.0", "Forms and validation"],
] as const;

/** A horizontal row of cards; the thumb runs along the bottom. */
export function HorizontalRow() {
    return (
        <div style={{ width: 400, maxWidth: "100%" }}>
            <ScrollArea orientation="horizontal" aria-label="Releases">
                <div style={{ display: "flex", gap: 12, padding: "4px 4px 16px" }}>
                    {releases.map(([version, what]) => (
                        <Card key={version} style={{ width: 160, flexShrink: 0 }}>
                            <Stack gap="2xs">
                                <Text variant="label">
                                    {version}
                                </Text>
                                <Text variant="copy">
                                    {what}
                                </Text>
                            </Stack>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
HorizontalRow.layout = { align: "start" as const };

/** type="always" keeps the thumb in view, for a pane people need to know scrolls. */
export function Always() {
    return (
        <Card padding="none" style={{ width: 320, maxWidth: "100%" }}>
            <ScrollArea type="always" height={180} aria-label="Terms">
                <div style={{ padding: "12px 24px 12px 16px", display: "grid", gap: 12 }}>
                    <Text variant="label">
                        Terms of use
                    </Text>
                    <Text variant="copy">
                        You may use the service for your own projects and your clients&apos;. You may not resell access to it or pass your
                        account on to someone else.
                    </Text>
                    <Text variant="copy">
                        We keep your data in the region you chose when you signed up, and back it up daily. You can export all of it at
                        any time, in open formats.
                    </Text>
                    <Text variant="copy">
                        We tell you by email about changes to these terms at least 30 days before they take effect. If you don&apos;t
                        agree, you can close your account before then with no charge.
                    </Text>
                    <Text variant="copy">
                        Questions go to Niamh in support; she answers within a working day.
                    </Text>
                </div>
            </ScrollArea>
        </Card>
    );
}
Always.layout = { align: "start" as const };
