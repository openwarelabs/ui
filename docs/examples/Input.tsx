import { useState } from "react";

import { Button, Input, Spinner, Stack } from "@openwarelabs/ui";
import { AtSign, Eye, EyeOff, Globe, Mail } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Input",
    category: "Inputs",
    description:
        "A single-line text field that turns its border brand-coloured, with a soft halo, when focused.",
    source: "components/Input/Input.tsx",
    notes: [
        "Always give it a visible label, usually by wrapping it in a Field. A placeholder shows an example, never the label.",
        "With startContent or endContent the field becomes a group, and className goes on the group.",
    ],
    related: ["Field", "SearchField", "NumberField", "Textarea"],
};

/** Empty, filled, invalid and disabled. */
export function States() {
    return (
        <Stack gap="md" style={{ width: 320, maxWidth: "100%" }}>
            <Input aria-label="Empty" placeholder="recipe-app" />
            <Input aria-label="Filled" defaultValue="recipe-app" />
            <Input aria-label="Invalid" defaultValue="Recipe App!" isInvalid />
            <Input aria-label="Disabled" defaultValue="Locked by your team" disabled />
        </Stack>
    );
}

/** 32px for toolbars and settings rows, 40px in forms. */
export function Sizes() {
    return (
        <Stack direction="row" gap="sm" align="center" style={{ width: 420, maxWidth: "100%" }}>
            <Input size="sm" aria-label="Small" placeholder="Small" />
            <Input aria-label="Medium" placeholder="Medium" />
        </Stack>
    );
}

/** Icons, prefixes and units sit inside the field. */
export function StartAndEndContent() {
    return (
        <Stack gap="md" style={{ width: 320, maxWidth: "100%" }}>
            <Input
                aria-label="Email"
                type="email"
                placeholder="you@company.ie"
                startContent={<Mail size={16} />}
            />
            <Input aria-label="Website" placeholder="openware.dev" startContent="https://" />
            <Input
                aria-label="Handle"
                placeholder="alexsilver"
                startContent={<AtSign size={16} />}
                endContent={<Spinner size="sm" label="Checking" />}
            />
            <Input
                aria-label="Budget"
                type="number"
                defaultValue="20"
                startContent={<Globe size={16} />}
                endContent="€ / month"
            />
        </Stack>
    );
}

/** A small ghost button in endContent: here, show and hide a password. */
export function Password() {
    const [visible, setVisible] = useState(false);
    return (
        <div style={{ width: 320, maxWidth: "100%" }}>
            <Input
                aria-label="Password"
                type={visible ? "text" : "password"}
                defaultValue="correct horse battery"
                endContent={
                    <Button
                        variant="ghost"
                        iconOnly
                        size="sm"
                        aria-label={visible ? "Hide password" : "Show password"}
                        onClick={() => setVisible(!visible)}
                    >
                        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                }
            />
        </div>
    );
}
