import { useState } from "react";

import { Button, buttonClassName, Stack } from "@openwarelabs/ui";
import { ArrowRight, Download, Plus, Trash } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Button",
    category: "Primitives",
    description:
        "A hairline button: a flat fill inside a 1px border. Pressing deepens its colour; danger is an outline that fills red when you aim at it.",
    imports: ["Button", "buttonClassName"],
    source: "components/Button/Button.tsx",
    keyboard: [
        ["Enter or Space", "Presses the focused button."],
        ["Tab", "Moves to the next button. Every button shows a 2px focus ring."],
    ],
    notes: [
        "Use one primary button per view, for the thing the view is for. Everything else is secondary or ghost.",
        "Write the label as a verb in sentence case: “Create project”, never “OK” or “Click here”.",
        "An icon-only button needs an aria-label, and usually a Tooltip with the same words.",
        "A loading button keeps its colour and sets aria-busy, so it reads as working rather than unavailable.",
    ],
    related: ["ButtonGroup", "ToggleButton", "CloseButton", "CopyButton"],
};

/** Primary for the main action, secondary for the rest, ghost for low-stakes actions and danger for destructive ones. */
export function Variants() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Button variant="primary">Create project</Button>
            <Button>Cancel</Button>
            <Button variant="ghost">Skip</Button>
            <Button variant="danger">Delete</Button>
        </Stack>
    );
}

/** 32px for rows and toolbars, 40px by default, 44px for empty states and heroes. */
export function Sizes() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
        </Stack>
    );
}

/** Icons are 16px Lucide shapes. A shortcut goes at the end, and only if it really works. */
export function WithIcons() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Button variant="primary" startIcon={<Plus size={16} />} shortcut="⌘N">
                New project
            </Button>
            <Button startIcon={<Download size={16} />}>Download</Button>
            <Button variant="ghost" endIcon={<ArrowRight size={16} />}>
                Continue
            </Button>
        </Stack>
    );
}

/** A square button for toolbars. Give it an aria-label. */
export function IconOnly() {
    return (
        <Stack direction="row" gap="sm" align="center">
            <Button iconOnly aria-label="Add" size="sm">
                <Plus size={16} />
            </Button>
            <Button iconOnly aria-label="Add">
                <Plus size={16} />
            </Button>
            <Button iconOnly variant="ghost" aria-label="Delete">
                <Trash size={16} />
            </Button>
        </Stack>
    );
}

/** The spinner replaces the icon and the button stays its width while the work runs. */
export function Loading() {
    const [saving, setSaving] = useState(false);
    function save() {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    }
    return (
        <Stack direction="row" gap="sm" align="center">
            <Button variant="primary" loading={saving} onClick={save}>
                Save changes
            </Button>
            <Button loading>Syncing</Button>
        </Stack>
    );
}

/** Disabled buttons lose their depth: filled ones go flat grey and secondary ones get a dashed outline. */
export function Disabled() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Button variant="primary" disabled>
                Create project
            </Button>
            <Button disabled>Cancel</Button>
            <Button variant="danger" disabled>
                Delete
            </Button>
        </Stack>
    );
}

/** Pills are the marketing site's shape, in slightly larger sizes. */
export function Pill() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Button variant="primary" shape="pill" size="lg" startIcon={<Download size={16} />}>
                Download for Mac
            </Button>
            <Button shape="pill" size="lg">
                Read the docs
            </Button>
        </Stack>
    );
}

/** buttonClassName() styles a link or a router's Link as a button. */
export function AsLink() {
    return (
        <a href="#/docs/installation" className={buttonClassName({ variant: "primary" })}>
            Get started
        </a>
    );
}
