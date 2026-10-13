import { useState } from "react";

import { Button, Card, Select, SettingsRow, Switch } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "SettingsRow",
    category: "Layout",
    description:
        "A label on the left and its control on the right, like macOS System Settings. Stack them in a Card.",
    source: "components/Card/Card.tsx",
    notes: [
        "Rows in a Card get hairlines between them automatically.",
        "Name the control after the row (label on a Switch, aria-label on a Select) so it reads out on its own.",
        "On narrow screens the control drops under the label.",
    ],
    related: ["Card", "Switch", "NavList"],
};

/** A card of settings. */
export function Basic() {
    const [theme, setTheme] = useState("system");
    const [sounds, setSounds] = useState(true);
    return (
        <Card padding="none" style={{ width: 520, maxWidth: "100%" }}>
            <SettingsRow label="Theme" description="System follows your computer's setting.">
                <Select
                    aria-label="Theme"
                    value={theme}
                    onChange={setTheme}
                    options={[
                        { value: "system", label: "System" },
                        { value: "light", label: "Light" },
                        { value: "dark", label: "Dark" },
                    ]}
                />
            </SettingsRow>
            <SettingsRow label="Sounds" description="A chime when a run finishes.">
                <Switch checked={sounds} onChange={setSounds} label="Sounds" />
            </SettingsRow>
            <SettingsRow label="Sign out" description="On this computer only.">
                <Button size="sm">Sign out</Button>
            </SettingsRow>
        </Card>
    );
}
Basic.layout = { ground: "canvas" as const };
