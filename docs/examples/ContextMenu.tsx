import { useState } from "react";

import {
    Button,
    Card,
    ContextMenu,
    Kbd,
    Menu,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    Text,
    toast,
} from "@openwarelabs/ui";
import {
    ClipboardPaste,
    Copy,
    Download,
    Ellipsis,
    FileText,
    FolderPlus,
    Pencil,
    Scissors,
    Share2,
    Star,
    Trash,
} from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "ContextMenu",
    category: "Overlays",
    description:
        "A menu of actions that opens where you right-click an area, or long-press it on a touch screen. It uses Menu's items and looks the same.",
    source: "components/ContextMenu/ContextMenu.tsx",
    imports: ["ContextMenu", "MenuItem", "MenuLabel", "MenuSeparator"],
    props: ["ContextMenuProps", "MenuItemProps"],
    keyboard: [
        [
            "Shift+F10 or the context menu key",
            "Opens it at the focused element, on the first item.",
        ],
        ["Up or Down", "Moves between items, wrapping round."],
        ["Home or End", "Goes to the first or last item."],
        ["Escape", "Closes it and returns focus to where it was."],
        ["Tab", "Closes it and moves on."],
    ],
    notes: [
        "Nobody finds a context menu by looking, so keep its actions somewhere visible too, such as a Menu on the row or a toolbar.",
        "Put something focusable in the area, so the keyboard can reach it and open the menu with Shift+F10.",
        "It opens at the pointer in the browser's top layer, flips up or in when it would run off the screen, and closes when the page scrolls.",
        "Set disabled to give the browser's own menu back, for text people will want to copy.",
    ],
    related: ["Menu", "Popover", "CommandPalette"],
    since: "0.14.0",
};

/** Right-click anywhere in the box, or focus it and press Shift+F10. */
export function Basic() {
    return (
        <ContextMenu
            label="Canvas"
            menu={
                <>
                    <MenuItem
                        icon={<Scissors size={15} />}
                        shortcut="⌘X"
                        onSelect={() => toast("Cut")}
                    >
                        Cut
                    </MenuItem>
                    <MenuItem
                        icon={<Copy size={15} />}
                        shortcut="⌘C"
                        onSelect={() => toast("Copied")}
                    >
                        Copy
                    </MenuItem>
                    <MenuItem icon={<ClipboardPaste size={15} />} shortcut="⌘V" disabled>
                        Paste
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                        icon={<Trash size={15} />}
                        destructive
                        onSelect={() => toast("Deleted")}
                    >
                        Delete
                    </MenuItem>
                </>
            }
        >
            <div
                tabIndex={0}
                style={{
                    display: "grid",
                    width: 360,
                    maxWidth: "100%",
                    height: 180,
                    placeItems: "center",
                    border: "1px dashed var(--ow-border-strong)",
                    borderRadius: "var(--ow-radius-container)",
                    color: "var(--ow-text-muted)",
                    fontSize: 14,
                }}
            >
                <span>
                    Right-click here, or press <Kbd>Shift</Kbd> <Kbd>F10</Kbd>
                </span>
            </div>
        </ContextMenu>
    );
}
Basic.layout = { minHeight: 260 };

const files = ["Brief.pdf", "Moodboard.fig", "Invoice 0142.pdf", "Notes.md"];

/** One per row, with onOpenChange marking the row the menu is for. */
export function Rows() {
    const [active, setActive] = useState<string | null>(null);
    return (
        <ul
            style={{
                display: "grid",
                width: 320,
                maxWidth: "100%",
                gap: 2,
                margin: 0,
                padding: 0,
                listStyle: "none",
            }}
        >
            {files.map((file) => (
                <li key={file}>
                    <ContextMenu
                        label={file}
                        onOpenChange={(open) => setActive(open ? file : null)}
                        menu={
                            <>
                                <MenuLabel>{file}</MenuLabel>
                                <MenuItem
                                    icon={<Pencil size={15} />}
                                    onSelect={() => toast(`Rename ${file}`)}
                                >
                                    Rename
                                </MenuItem>
                                <MenuItem
                                    icon={<Download size={15} />}
                                    onSelect={() => toast(`Downloading ${file}`)}
                                >
                                    Download
                                </MenuItem>
                                <MenuItem
                                    icon={<Share2 size={15} />}
                                    onSelect={() => toast(`Link to ${file} copied`)}
                                >
                                    Copy link
                                </MenuItem>
                                <MenuSeparator />
                                <MenuItem
                                    icon={<Trash size={15} />}
                                    destructive
                                    onSelect={() => toast(`Deleted ${file}`)}
                                >
                                    Delete
                                </MenuItem>
                            </>
                        }
                    >
                        <Button
                            variant="ghost"
                            startIcon={<FileText size={16} />}
                            onClick={() => toast(`Opened ${file}`)}
                            style={{
                                width: "100%",
                                justifyContent: "flex-start",
                                background: active === file ? "var(--ow-surface-muted)" : undefined,
                            }}
                        >
                            {file}
                        </Button>
                    </ContextMenu>
                </li>
            ))}
        </ul>
    );
}
Rows.layout = { minHeight: 300, align: "start" as const };

/** The same items in a ContextMenu and in a Menu on the card, so the actions can be found without right-clicking. */
export function WithMenu() {
    const items = (
        <>
            <MenuItem icon={<Star size={15} />} onSelect={() => toast("Starred")}>
                Star
            </MenuItem>
            <MenuItem icon={<FolderPlus size={15} />} onSelect={() => toast("Moved")}>
                Move to folder
            </MenuItem>
            <MenuSeparator />
            <MenuItem
                icon={<Trash size={15} />}
                destructive
                onSelect={() => toast("Project deleted")}
            >
                Delete project
            </MenuItem>
        </>
    );
    return (
        <ContextMenu label="recipe-app" menu={items}>
            <Card style={{ width: 320, maxWidth: "100%" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "start",
                        justifyContent: "space-between",
                        gap: 12,
                    }}
                >
                    <div>
                        <Text variant="card-title">recipe-app</Text>
                        <Text variant="caption" tone="muted">
                            Updated 2 hours ago
                        </Text>
                    </div>
                    <Menu
                        label="recipe-app"
                        align="end"
                        trigger={
                            <Button iconOnly variant="ghost" aria-label="More for recipe-app">
                                <Ellipsis size={16} />
                            </Button>
                        }
                    >
                        {items}
                    </Menu>
                </div>
            </Card>
        </ContextMenu>
    );
}
WithMenu.layout = { minHeight: 240 };
