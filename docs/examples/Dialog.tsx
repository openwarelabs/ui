import { useState } from "react";

import { Button, Dialog, Field, Input, toast } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Dialog",
    category: "Overlays",
    description:
        "A modal dialog on the native <dialog> element. It traps focus, sits above everything, and fades and rises in.",
    source: "components/Dialog/Dialog.tsx",
    keyboard: [
        ["Escape", "Closes it, unless it's working (dismissible is false)."],
        ["Tab", "Moves between its controls; focus can't leave it while it's open."],
    ],
    notes: [
        "A click on the backdrop counts as Escape. Pressing inside and dragging out doesn't close it.",
        "The title names the dialog for screen readers and the description describes it.",
        "Keep a dialog to one task. Long or multi-step work deserves a page.",
    ],
    related: ["ConfirmDialog", "Drawer", "Popover"],
};

/** Pass onSubmit to make it a form: Enter in the field submits, and the primary button is type="submit". */
export function Form() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("recipe-app");
    return (
        <>
            <Button onClick={() => setOpen(true)}>Rename project</Button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title="Rename project"
                description="The folder on disk keeps its name."
                onSubmit={() => {
                    setOpen(false);
                    toast.success(`Renamed to ${name}`);
                }}
                actions={
                    <>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={!name.trim()}>
                            Rename
                        </Button>
                    </>
                }
            >
                <Field label="Name">
                    <Input
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </Field>
            </Dialog>
        </>
    );
}

/** dismissible={false} while saving, so Escape and the backdrop can't close it mid-way. */
export function Saving() {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    function save() {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setOpen(false);
        }, 1600);
    }
    return (
        <>
            <Button variant="primary" onClick={() => setOpen(true)}>
                Publish
            </Button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                dismissible={!saving}
                width={380}
                title="Publish recipe-app?"
                description="It'll be live at recipe-app.openware.dev in about a minute."
                actions={
                    <>
                        <Button disabled={saving} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" loading={saving} onClick={save}>
                            Publish
                        </Button>
                    </>
                }
            />
        </>
    );
}
