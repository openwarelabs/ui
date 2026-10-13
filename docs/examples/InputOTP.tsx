import { useState } from "react";

import { InputOTP, Stack, toast } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "InputOTP",
    category: "Inputs",
    description:
        "A one-time code in separate boxes. Typing moves forward, Backspace moves back, and pasting fills them all.",
    source: "components/InputOTP/InputOTP.tsx",
    keyboard: [
        ["Backspace", "Removes the character and moves back."],
        ["Left or Right", "Moves between boxes."],
        ["⌘ + V", "Pastes a whole code across the boxes."],
    ],
    notes: [
        'The first box has autocomplete="one-time-code", so phones can fill it from a text message.',
        "Each box is read as “Character 2 of 6” inside a group named by aria-label.",
    ],
    related: ["Input", "Field"],
};

/** Six digits, split 3–3. onComplete runs once every box is filled. */
export function Basic() {
    const [code, setCode] = useState("");
    return (
        <Stack gap="md" align="center">
            <InputOTP
                value={code}
                onChange={setCode}
                groupSize={3}
                onComplete={(value) => toast.success(`Checking ${value}…`)}
            />
            <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>
                Enter the code we sent to your phone.
            </span>
        </Stack>
    );
}

/** Letters and digits, shown upper case. */
export function Alphanumeric() {
    return <InputOTP length={4} type="alphanumeric" aria-label="Invite code" defaultValue="H7" />;
}

/** isInvalid turns every box red, after a wrong code. */
export function Invalid() {
    return <InputOTP length={6} defaultValue="123456" isInvalid />;
}
