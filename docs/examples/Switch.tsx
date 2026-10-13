import { useState } from "react";

import { Card, SettingsRow, Stack, Switch } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Switch",
    category: "Forms",
    description:
        "A small on/off switch for a setting that takes effect at once, with no save button.",
    source: "components/Switch/Switch.tsx",
    keyboard: [["Space or Enter", "Turns it on or off."]],
    notes: [
        'It has role="switch" and aria-checked. Give it a label, or point aria-labelledby at the visible one.',
        "Use a Checkbox instead when the choice only applies after a form is submitted.",
    ],
    related: ["SettingsRow", "Checkbox", "ToggleButton"],
};

/** On and off. */
export function Basic() {
    const [on, setOn] = useState(true);
    return (
        <Stack direction="row" gap="md" align="center">
            <Switch checked={on} onChange={setOn} label="Notifications" />
            <span style={{ fontSize: 14 }}>{on ? "Notifications on" : "Notifications off"}</span>
        </Stack>
    );
}

/** Its usual place: the right of a SettingsRow. */
export function InSettings() {
    const [sounds, setSounds] = useState(false);
    const [updates, setUpdates] = useState(true);
    return (
        <Card padding="none" style={{ width: 440, maxWidth: "100%", padding: "0 16px" }}>
            <SettingsRow label="Play sounds" description="A chime when an agent needs you.">
                <Switch checked={sounds} onChange={setSounds} label="Play sounds" />
            </SettingsRow>
            <SettingsRow label="Install updates automatically">
                <Switch
                    checked={updates}
                    onChange={setUpdates}
                    label="Install updates automatically"
                />
            </SettingsRow>
            <SettingsRow label="Share usage data" description="Managed by your organisation.">
                <Switch
                    checked={false}
                    onChange={() => undefined}
                    disabled
                    label="Share usage data"
                />
            </SettingsRow>
        </Card>
    );
}
InSettings.layout = { ground: "canvas" as const };
