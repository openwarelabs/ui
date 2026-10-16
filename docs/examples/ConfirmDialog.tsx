import { useState } from "react";

import { Button, Checkbox, ConfirmDialog, toast } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ConfirmDialog",
    category: "Overlays",
    description:
        "Asks before an action: a question, exactly what will happen, Cancel and the action. Cancel has focus first.",
    source: "components/Dialog/Dialog.tsx",
    keyboard: [
        ["Enter", "Presses the focused button (Cancel, at first)."],
        ["Escape", "Cancels, unless the action is running."],
    ],
    notes: [
        "Write the title as the question (“Delete recipe-app?”) and the button as the action (“Delete project”).",
        "It's an alertdialog, so screen readers read the title and description out as soon as it opens, and Cancel has focus first.",
        "If onConfirm throws, its message shows in the dialog and the dialog stays open.",
        "Don't confirm things that can be undone. Do them, and offer Undo in a toast.",
    ],
    related: ["Dialog", "Checkbox"],
};

/** A destructive confirmation; onConfirm returns a promise, so the button reads “Working…” until it settles. */
export function Destructive() {
    const [open, setOpen] = useState(false);
    const [alsoFolder, setAlsoFolder] = useState(false);
    return (
        <>
            <Button variant="danger" onClick={() => setOpen(true)}>
                Delete project
            </Button>
            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                destructive
                title="Delete recipe-app?"
                description="This removes the project from the list. Its checkpoints go with it."
                confirmLabel="Delete project"
                onConfirm={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 900));
                    toast(alsoFolder ? "Project and folder deleted" : "Project deleted");
                }}
            >
                <Checkbox
                    tone="danger"
                    checked={alsoFolder}
                    onChange={(event) => setAlsoFolder(event.target.checked)}
                >
                    Also delete the folder on disk
                </Checkbox>
            </ConfirmDialog>
        </>
    );
}

/** A plain confirmation. When the action fails, the error shows inside. */
export function WithAnError() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button onClick={() => setOpen(true)}>Disconnect GitHub</Button>
            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                title="Disconnect GitHub?"
                description="Commits stay where they are. You can connect again at any time."
                confirmLabel="Disconnect"
                onConfirm={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 700));
                    throw new Error("GitHub didn't answer. Try again in a minute.");
                }}
            />
        </>
    );
}
