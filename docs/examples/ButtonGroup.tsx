import { Button, ButtonGroup, ToggleButton } from "@openwarelabs/ui";
import { ChevronLeft, ChevronRight, Copy, Pencil, Trash } from "lucide-react";
import { useState } from "react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ButtonGroup",
    category: "Actions",
    description: "Buttons that belong together, joined into one control or spaced in a row.",
    source: "components/Button/ButtonGroup.tsx",
    notes: [
        "The group has role=\"group\"; give it an aria-label when the buttons alone don't say what they're for.",
        "Joined buttons keep their own focus ring, raised above their neighbours.",
    ],
    related: ["Button", "ToggleButton", "SegmentedControl"],
};

/** Joined buttons share borders, like a toolbar segment. */
export function Attached() {
    return (
        <ButtonGroup aria-label="Edit">
            <Button startIcon={<Pencil size={16} />}>Edit</Button>
            <Button startIcon={<Copy size={16} />}>Duplicate</Button>
            <Button startIcon={<Trash size={16} />}>Delete</Button>
        </ButtonGroup>
    );
}

/** Icon-only buttons make a compact pager. */
export function IconButtons() {
    return (
        <ButtonGroup aria-label="Page">
            <Button iconOnly size="sm" aria-label="Previous page">
                <ChevronLeft size={16} />
            </Button>
            <Button size="sm">Page 3 of 12</Button>
            <Button iconOnly size="sm" aria-label="Next page">
                <ChevronRight size={16} />
            </Button>
        </ButtonGroup>
    );
}

/** ToggleButtons in a group make a set of on/off options, such as text formatting. */
export function Toggles() {
    const [view, setView] = useState({ daily: true, weekly: false, monthly: false });
    return (
        <ButtonGroup aria-label="Show">
            {(["daily", "weekly", "monthly"] as const).map((key) => (
                <ToggleButton
                    key={key}
                    size="sm"
                    pressed={view[key]}
                    onPressedChange={(pressed) => setView({ ...view, [key]: pressed })}
                >
                    {key[0]!.toUpperCase() + key.slice(1)}
                </ToggleButton>
            ))}
        </ButtonGroup>
    );
}

/** With attached off, the buttons sit 8px apart and wrap on narrow screens. */
export function Spaced() {
    return (
        <ButtonGroup attached={false}>
            <Button>Cancel</Button>
            <Button variant="primary">Save</Button>
        </ButtonGroup>
    );
}
