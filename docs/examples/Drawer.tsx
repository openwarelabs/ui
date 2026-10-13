import { useState } from "react";

import { Button, Drawer, Field, Input, Select, Stack, Textarea } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Drawer",
    category: "Overlays",
    description:
        "A panel that slides in from an edge over the page, for details or a form beside what the person was doing.",
    source: "components/Drawer/Drawer.tsx",
    keyboard: [
        ["Escape", "Closes it."],
        ["Tab", "Moves between its controls; focus stays inside while it's open."],
    ],
    notes: [
        "It's a modal dialog underneath, with the same focus trap and backdrop as Dialog.",
        "The footer stays put while the body scrolls.",
    ],
    related: ["Dialog", "Popover"],
};

/** From the right, with a form and a footer. */
export function Right() {
    const [open, setOpen] = useState(false);
    const [priority, setPriority] = useState("normal");
    return (
        <>
            <Button variant="primary" onClick={() => setOpen(true)}>
                New task
            </Button>
            <Drawer
                open={open}
                onClose={() => setOpen(false)}
                title="New task"
                description="It goes to the top of the Planning column."
                footer={
                    <>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="primary" onClick={() => setOpen(false)}>
                            Create task
                        </Button>
                    </>
                }
            >
                <Stack gap="xl">
                    <Field label="Title">
                        <Input autoFocus placeholder="Add a dark theme" />
                    </Field>
                    <Field label="Priority">
                        <Select
                            value={priority}
                            onChange={setPriority}
                            options={[
                                { value: "low", label: "Low" },
                                { value: "normal", label: "Normal" },
                                { value: "high", label: "High" },
                            ]}
                        />
                    </Field>
                    <Field label="Notes">
                        <Textarea autoGrow placeholder="Anything the agents should know" />
                    </Field>
                </Stack>
            </Drawer>
        </>
    );
}

/** From the left (navigation on a phone) or the bottom (a sheet). */
export function OtherEdges() {
    const [side, setSide] = useState<"left" | "bottom" | null>(null);
    return (
        <Stack direction="row" gap="sm">
            <Button onClick={() => setSide("left")}>From the left</Button>
            <Button onClick={() => setSide("bottom")}>From the bottom</Button>
            <Drawer
                open={side !== null}
                side={side ?? "left"}
                size={side === "bottom" ? 280 : 300}
                onClose={() => setSide(null)}
                title={side === "bottom" ? "Share" : "Menu"}
            >
                <p style={{ margin: 0, color: "var(--ow-text-muted)" }}>
                    Drawers can hold anything: links, a list, a form.
                </p>
            </Drawer>
        </Stack>
    );
}
