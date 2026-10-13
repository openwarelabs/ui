import { useState } from "react";

import { Button, Field, Popover, Slider, Stack, Switch, User } from "@openwarelabs/ui";
import { Settings2 } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Popover",
    category: "Overlays",
    description:
        "A small panel attached to a button, for a few controls or details that don't need a dialog.",
    source: "components/Popover/Popover.tsx",
    keyboard: [
        ["Enter or Space", "Opens it from the trigger and moves focus inside."],
        ["Escape", "Closes it and returns focus to the trigger."],
        ["Tab", "Moves through it; leaving the last control closes it."],
    ],
    notes: [
        "It sits in the browser's top layer, so dialogs and scroll areas can't clip it, and it flips when there's no room below.",
        'The trigger gets aria-expanded and aria-haspopup="dialog".',
    ],
    related: ["Menu", "Tooltip", "Dialog"],
};

/** A few settings, with a title that names it. */
export function Settings() {
    const [temperature, setTemperature] = useState(0.7);
    const [stream, setStream] = useState(true);
    return (
        <Popover
            title="Model settings"
            trigger={<Button startIcon={<Settings2 size={16} />}>Settings</Button>}
        >
            <Slider
                label="Temperature"
                value={temperature}
                onChange={setTemperature}
                min={0}
                max={2}
                step={0.1}
                formatValue={(value) => value.toFixed(1)}
            />
            <Stack direction="row" justify="between" align="center">
                <span style={{ fontSize: 14 }}>Stream replies</span>
                <Switch checked={stream} onChange={setStream} label="Stream replies" />
            </Stack>
        </Popover>
    );
}

/** Details about someone, opened from their name. */
export function Details() {
    return (
        <Popover
            aria-label="About Alex Silver"
            placement="bottom"
            width={260}
            trigger={<Button variant="ghost">Alex Silver</Button>}
        >
            <User name="Alex Silver" description="alex@openware.dev" size="lg" />
            <p style={{ margin: 0, color: "var(--ow-text-muted)", fontSize: 13 }}>
                Owner · 6 projects · joined October 2026
            </p>
            <Field label="Role">
                <Button size="sm">Change role</Button>
            </Field>
        </Popover>
    );
}
