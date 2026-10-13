import { useEffect, useState } from "react";

import { Button, CommandPalette, Kbd, Stack, toast, type Command } from "@openwarelabs/ui";
import { FolderOpen, Moon, Play, Plus, Settings } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "CommandPalette",
    category: "Overlays",
    description:
        "A ⌘K dialog that searches every action and runs it from the keyboard. These docs use one for search.",
    source: "components/CommandPalette/CommandPalette.tsx",
    imports: ["CommandPalette", "type Command"],
    props: ["CommandPaletteProps", "Command"],
    keyboard: [
        ["Up or Down", "Moves through the results (Ctrl + N and Ctrl + P work too)."],
        ["Enter", "Runs the highlighted command."],
        ["Escape", "Closes it."],
    ],
    notes: [
        "Prefix and word-start matches rank first, then letters in order, so “rnp” finds Run pipeline.",
        "A disabled command still shows, greyed out, with the reason as its hint.",
        "Every command should be somewhere else in the app too: the palette is a shortcut, not the only way.",
    ],
    related: ["Menu", "SearchField", "Kbd"],
};

/** Open it with the button or ⌘K (Ctrl + K). */
export function Basic() {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey) && !event.defaultPrevented) {
                event.preventDefault();
                setOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);
    const commands: Command[] = [
        {
            id: "run",
            title: "Run pipeline",
            group: "Pipeline",
            icon: <Play />,
            keywords: "start go",
            shortcut: "⌘↵",
            run: () => toast("Pipeline started"),
        },
        {
            id: "new",
            title: "New project",
            group: "Projects",
            icon: <Plus />,
            shortcut: "⌘N",
            run: () => toast("New project"),
        },
        {
            id: "open",
            title: "Open folder",
            group: "Projects",
            icon: <FolderOpen />,
            hint: "~/Projects",
            run: () => toast("Open folder"),
        },
        {
            id: "theme",
            title: "Toggle dark mode",
            group: "App",
            icon: <Moon />,
            keywords: "theme night",
            run: () => toast("Theme changed"),
        },
        {
            id: "settings",
            title: "Settings",
            group: "App",
            icon: <Settings />,
            shortcut: "⌘,",
            run: () => toast("Settings"),
        },
        {
            id: "sync",
            title: "Sync to GitHub",
            group: "App",
            disabled: "Connect GitHub first",
            run: () => undefined,
        },
    ];
    return (
        <Stack direction="row" gap="md" align="center">
            <Button onClick={() => setOpen(true)}>Open command palette</Button>
            <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>
                or <Kbd>⌘</Kbd> <Kbd>K</Kbd>
            </span>
            <CommandPalette
                open={open}
                onClose={() => setOpen(false)}
                commands={commands}
                placeholder="Run pipeline, open a project…"
            />
        </Stack>
    );
}
