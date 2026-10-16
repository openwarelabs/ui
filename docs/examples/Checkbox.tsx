import { useState } from "react";

import { Checkbox, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Checkbox",
    category: "Primitives",
    description:
        "A real checkbox, restyled. Give it children for its label, or wrap the bare box in your own.",
    source: "components/Checkbox/Checkbox.tsx",
    keyboard: [["Space", "Checks or unchecks it."]],
    notes: [
        "It keeps the native input, so labels, forms and disabled work as usual.",
        "Use it for choices that apply when a form is submitted. For a setting that applies at once, use a Switch.",
    ],
    related: ["CheckboxGroup", "Switch", "RadioGroup"],
};

/** With a label and an optional description. */
export function Basic() {
    return (
        <Stack gap="md">
            <Checkbox defaultChecked>Save a checkpoint first</Checkbox>
            <Checkbox description="We'll email you when every agent has finished.">
                Tell me when it's done
            </Checkbox>
        </Stack>
    );
}

/** tone="danger" for an option that makes an action destructive, as in a delete dialog. */
export function Danger() {
    return (
        <Checkbox tone="danger" defaultChecked description="This can't be undone.">
            Also delete the folder on disk
        </Checkbox>
    );
}

/** indeterminate shows a dash: some of what it controls is checked. */
export function SelectAll() {
    const [files, setFiles] = useState({
        "README.md": true,
        "package.json": false,
        "src/index.ts": true,
    });
    const values = Object.values(files);
    const all = values.every(Boolean);
    const some = values.some(Boolean);
    return (
        <Stack gap="sm">
            <Checkbox
                checked={all}
                indeterminate={some && !all}
                onChange={(event) =>
                    setFiles(
                        Object.fromEntries(
                            Object.keys(files).map((name) => [name, event.target.checked]),
                        ) as typeof files,
                    )
                }
            >
                All files
            </Checkbox>
            <Stack gap="sm" style={{ paddingLeft: 24 }}>
                {Object.entries(files).map(([name, checked]) => (
                    <Checkbox
                        key={name}
                        size="sm"
                        checked={checked}
                        onChange={(event) => setFiles({ ...files, [name]: event.target.checked })}
                    >
                        <code>{name}</code>
                    </Checkbox>
                ))}
            </Stack>
        </Stack>
    );
}

/** Disabled boxes lose their depth: a dashed outline when unchecked. */
export function Disabled() {
    return (
        <Stack direction="row" gap="xl" wrap>
            <Checkbox disabled>Unavailable</Checkbox>
            <Checkbox disabled defaultChecked>
                Required
            </Checkbox>
        </Stack>
    );
}
