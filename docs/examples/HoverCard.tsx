import { useState } from "react";

import { Badge, Button, HoverCard, Link, Stack, Text, User } from "@openwarelabs/ui";
import { CalendarDays, FileText, UserPlus } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "HoverCard",
    category: "Overlays",
    description:
        "A preview card that opens when the pointer rests on a link, such as a person's name or a link to a page, so people can see what's behind it without following it.",
    source: "components/HoverCard/HoverCard.tsx",
    keyboard: [
        [
            "Tab",
            "Focusing the trigger opens it at once; Tab again moves into the card's links and buttons, and out of it closes it.",
        ],
        ["Escape", "Closes it. From inside the card, focus goes back to the trigger."],
    ],
    notes: [
        "It waits 500ms before opening, so it doesn't flash as the pointer crosses the page, and 250ms before closing, so the pointer can move into the card.",
        "It's extra: everything in it must also be reachable by following the trigger. Touch screens don't open it, so a tap just follows the link.",
        "It doesn't trap focus or announce itself; it renders right after the trigger, so Tab reaches its controls next.",
        "The card is a div, so put the trigger in a block such as a div, not inside a p.",
        "For controls opened by a click, use Popover; for a few words naming an icon, use Tooltip.",
    ],
    related: ["Popover", "Tooltip", "Link"],
    since: "0.14.0",
};

/** A person's name that previews their profile, with a button in the card. */
export function Profile() {
    return (
        <HoverCard trigger={<Link href="#/people/alex">@alexsilver</Link>}>
            <User name="Alex Silver" description="@alexsilver" size="lg" />
            <Text variant="body">
                Designs and builds Openware UI. Midnight, brass and tactile buttons.
            </Text>
            <Stack direction="row" justify="between" align="center">
                <Text variant="caption" tone="muted">
                    6 projects · 1.2k followers
                </Text>
                <Button size="sm" startIcon={<UserPlus size={16} />}>
                    Follow
                </Button>
            </Stack>
        </HoverCard>
    );
}

/** A link in running text that previews the page it goes to. */
export function LinkPreview() {
    return (
        <Text as="div" style={{ maxWidth: 420 }}>
            Before you start, read{" "}
            <HoverCard width={300} trigger={<Link href="#/theming">the theming guide</Link>}>
                <Stack direction="row" gap="xs" align="center">
                    <FileText size={16} aria-hidden="true" />
                    <Text variant="card-title" as="span">
                        Theming
                    </Text>
                </Stack>
                <Text variant="body" tone="muted">
                    Light and dark themes, the brand colour, and the tokens every component reads
                    its colours from.
                </Text>
                <Stack direction="row" gap="xs" align="center">
                    <CalendarDays size={16} aria-hidden="true" />
                    <Text variant="caption" tone="muted">
                        Updated 2 October 2026
                    </Text>
                </Stack>
            </HoverCard>{" "}
            so your brand colour carries through.
        </Text>
    );
}

/** placement="top" above the trigger, and shorter delays for a list people scan. */
export function PlacementAndDelay() {
    return (
        <HoverCard
            placement="top"
            openDelay={200}
            closeDelay={100}
            width={260}
            trigger={<Link href="#/releases/0.14.0">Release 0.14.0</Link>}
        >
            <Stack direction="row" justify="between" align="center">
                <Text variant="card-title" as="span">
                    0.14.0
                </Text>
                <Badge variant="success">Latest</Badge>
            </Stack>
            <Text variant="body" tone="muted">
                Adds HoverCard, a preview for links.
            </Text>
        </HoverCard>
    );
}

/** open and onOpenChange keep whether it's showing in your own state. */
export function Controlled() {
    const [open, setOpen] = useState(false);
    return (
        <Stack gap="sm" align="center">
            <HoverCard
                open={open}
                onOpenChange={setOpen}
                trigger={<Link href="#/people/fionn">Fionn Gallagher</Link>}
            >
                <User name="Fionn Gallagher" description="Engineering · Lisbon" size="lg" />
            </HoverCard>
            <Text variant="caption" tone="muted">
                The card is {open ? "open" : "closed"}.
            </Text>
        </Stack>
    );
}
