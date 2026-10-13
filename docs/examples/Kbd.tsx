import { Code, Kbd, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Kbd",
    category: "Typography",
    description:
        "A keyboard key in running text, with a heavier bottom edge like a real key. Code is its partner for paths and commands.",
    source: "components/Kbd/Kbd.tsx",
    imports: ["Kbd", "Code"],
    notes: [
        "Kbd renders <kbd> and Code renders <code>, so screen readers and copy-paste treat them as what they are.",
        "Write each key on its own: <Kbd>⌘</Kbd> <Kbd>K</Kbd>, not <Kbd>⌘K</Kbd>.",
    ],
    related: ["CodeBlock", "Snippet"],
};

/** Shortcuts in a sentence. */
export function Shortcuts() {
    return (
        <Stack gap="sm">
            <span>
                Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to search, or <Kbd>Esc</Kbd> to close.
            </span>
            <span>
                <Kbd>Ctrl</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd> opens the command palette on Windows.
            </span>
        </Stack>
    );
}

/** Code for file names and commands. */
export function InlineCode() {
    return (
        <span>
            Edit <Code>src/app.tsx</Code>, then run <Code>npm run dev</Code>.
        </span>
    );
}
