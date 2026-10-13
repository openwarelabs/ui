import { Button, Menu, MenuItem, MenuLabel, MenuSeparator, toast } from "@openwarelabs/ui";
import { Copy, Ellipsis, Pencil, Share2, Trash } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Menu",
    category: "Overlays",
    description:
        "A dropdown menu of actions under a button. The keyboard moves through it like a native menu.",
    source: "components/Menu/Menu.tsx",
    imports: ["Menu", "MenuItem", "MenuLabel", "MenuSeparator"],
    props: ["MenuProps", "MenuItemProps"],
    keyboard: [
        ["Enter or Space", "Opens it from the trigger, on the first item."],
        ["Up or Down", "Moves between items, wrapping round."],
        ["Home or End", "Goes to the first or last item."],
        ["Escape", "Closes it and returns focus to the trigger."],
        ["Tab", "Closes it and moves on."],
    ],
    notes: [
        "Menus hold actions. To choose a value, use a Select.",
        "Mark actions that delete or can't be undone as destructive.",
        "It opens in the browser's top layer, grows from the edge of its trigger, and flips above when there's no room below.",
    ],
    related: ["Select", "Popover", "CommandPalette"],
};

/** Grouped items with icons, shortcuts and a destructive action. */
export function Basic() {
    return (
        <Menu
            label="Project"

            trigger={<Button endIcon={<Ellipsis size={16} />}>recipe-app</Button>}
        >
            <MenuLabel>Project</MenuLabel>
            <MenuItem icon={<Pencil size={15} />} shortcut="⌘R" onSelect={() => toast("Rename")}>
                Rename
            </MenuItem>
            <MenuItem icon={<Copy size={15} />} onSelect={() => toast("Duplicated")}>
                Duplicate
            </MenuItem>
            <MenuItem icon={<Share2 size={15} />} disabled>
                Share
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={<Trash size={15} />} destructive onSelect={() => toast("Deleted")}>
                Delete project
            </MenuItem>
        </Menu>
    );
}
Basic.layout = { minHeight: 220, align: "start" as const };

/** align="end" lines it up with the trigger's right edge, for a button at the end of a row. */
export function AlignedEnd() {
    return (
        <div style={{ display: "flex", width: 360, maxWidth: "100%", justifyContent: "flex-end" }}>
            <Menu
                label="More"
                align="end"
                trigger={
                    <Button iconOnly variant="ghost" aria-label="More">
                        <Ellipsis size={16} />
                    </Button>
                }
            >
                <MenuItem>Open in a new window</MenuItem>
                <MenuItem>Copy link</MenuItem>
            </Menu>
        </div>
    );
}
AlignedEnd.layout = { minHeight: 180, align: "start" as const };
