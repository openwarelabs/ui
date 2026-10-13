import { CopyButton, Stack, toast } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "CopyButton",
    category: "Buttons",
    description: "Copies a value and says so: the icon turns into a check for two seconds.",
    source: "components/CodeBlock/CodeBlock.tsx",
    notes: [
        "Screen readers hear “Copied” through a polite live region.",
        "Where the browser refuses the Clipboard API, it falls back to selecting and copying a hidden field.",
    ],
    related: ["Snippet", "CodeBlock"],
};

/** With a label, or icon-only (the label is still read out). */
export function Basic() {
    return (
        <Stack direction="row" gap="md" align="center">
            <CopyButton value="ow_live_51ShQ2" label="Copy key" />
            <CopyButton
                value="https://openware.dev/invite/7Hf2"
                iconOnly
                label="Copy invite link"
            />
        </Stack>
    );
}

/** onCopy runs after a successful copy, to confirm somewhere else too. */
export function WithToast() {
    return (
        <CopyButton
            value="#312c7e"
            label="Copy hex"
            onCopy={() => toast.success("Copied #312c7e")}
        />
    );
}
