import { useState } from "react";

import { Stack, ToggleButton } from "@openwarelabs/ui";
import { Bell, Bold, Italic, Star, Underline } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ToggleButton",
    category: "Actions",
    description:
        "A button that stays pressed in while something is on: a filter, a format, a follow.",
    source: "components/Button/ButtonGroup.tsx",
    keyboard: [["Enter or Space", "Turns it on or off."]],
    notes: [
        "It sets aria-pressed, so screen readers say “toggle button, pressed”.",
        "Keep the label the same in both states. Don't change “Follow” to “Unfollow”; the pressed look says it's on.",
    ],
    related: ["ButtonGroup", "Switch", "SegmentedControl"],
};

/** Pressed, it's tinted with the primary colour and sits slightly inset. */
export function Basic() {
    const [watching, setWatching] = useState(true);
    return (
        <ToggleButton
            pressed={watching}
            onPressedChange={setWatching}
            startIcon={<Bell size={16} />}
        >
            Watch
        </ToggleButton>
    );
}

/** Left uncontrolled, it keeps its own state. */
export function Uncontrolled() {
    return (
        <ToggleButton defaultPressed={false} startIcon={<Star size={16} />}>
            Favourite
        </ToggleButton>
    );
}

/** Icon-only ghost toggles for a formatting bar. */
export function Formatting() {
    return (
        <Stack direction="row" gap="2xs">
            <ToggleButton variant="ghost" iconOnly size="sm" aria-label="Bold" defaultPressed>
                <Bold size={16} />
            </ToggleButton>
            <ToggleButton variant="ghost" iconOnly size="sm" aria-label="Italic">
                <Italic size={16} />
            </ToggleButton>
            <ToggleButton variant="ghost" iconOnly size="sm" aria-label="Underline">
                <Underline size={16} />
            </ToggleButton>
        </Stack>
    );
}
