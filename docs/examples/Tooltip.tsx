import { Button, Stack, Tooltip } from "@openwarelabs/ui";
import { Copy, FolderKanban, Gauge, Inbox, Pencil, Trash } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Tooltip",
    category: "Feedback",
    description:
        "A small dark label beside its child on hover or keyboard focus, naming an icon-only control.",
    source: "components/Tooltip/Tooltip.tsx",
    keyboard: [
        ["Tab", "Focusing the child shows it at once."],
        ["Escape", "Hides it without moving focus."],
    ],
    notes: [
        "It's for sighted people only: the child carries the same words in its aria-label, so they aren't read twice.",
        "It waits 400ms before showing on hover; moving along a row of buttons after that shows the next one at once.",
        "It sits in the browser's top layer, so scroll areas and dialogs can't clip it, and it flips to the other side when there's no room.",
        "Touch screens can't hover. Never put information only in a tooltip.",
    ],
    related: ["Button", "Popover"],
};

/** Hover or tab to each button. */
export function IconButtons() {
    return (
        <Stack direction="row" gap="xs">
            <Tooltip label="Rename">
                <Button iconOnly variant="ghost" aria-label="Rename">
                    <Pencil size={16} />
                </Button>
            </Tooltip>
            <Tooltip label="Duplicate">
                <Button iconOnly variant="ghost" aria-label="Duplicate">
                    <Copy size={16} />
                </Button>
            </Tooltip>
            <Tooltip label="Delete">
                <Button iconOnly variant="ghost" aria-label="Delete">
                    <Trash size={16} />
                </Button>
            </Tooltip>
        </Stack>
    );
}

/** placement="bottom" for controls along the top of the window; a shorter delay for a toolbar people scan. */
export function PlacementAndDelay() {
    return (
        <Stack direction="row" gap="md" align="center">
            <Tooltip label="Opens below" placement="bottom">
                <Button>Below</Button>
            </Tooltip>
            <Tooltip label="No wait" delay={0}>
                <Button>Instant</Button>
            </Tooltip>
        </Stack>
    );
}

/** placement="right" (or "left") for icons in a folded sidebar, where above would cover the icon before it. */
export function Beside() {
    return (
        <Stack gap="2xs">
            <Tooltip label="Overview" placement="right">
                <Button iconOnly variant="ghost" aria-label="Overview">
                    <Gauge size={16} />
                </Button>
            </Tooltip>
            <Tooltip label="Projects" placement="right">
                <Button iconOnly variant="ghost" aria-label="Projects">
                    <FolderKanban size={16} />
                </Button>
            </Tooltip>
            <Tooltip label="Inbox" placement="right">
                <Button iconOnly variant="ghost" aria-label="Inbox">
                    <Inbox size={16} />
                </Button>
            </Tooltip>
        </Stack>
    );
}
