import { Snippet, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Snippet",
    category: "Data display",
    description:
        "One line to copy, usually a command, with a prompt in front and a copy button at the end.",
    source: "components/CodeBlock/CodeBlock.tsx",
    notes: [
        "The prompt isn't copied, only the command.",
        "Long commands scroll sideways rather than wrap.",
    ],
    related: ["CodeBlock", "CopyButton"],
};

/** An install command. */
export function Basic() {
    return <Snippet value="npm install @openwarelabs/ui" />;
}

/** Without a prompt, or with your own. */
export function Prompts() {
    return (
        <Stack gap="sm">
            <Snippet value="sk-ant-api03-••••••••••••" prompt={null} />
            <Snippet value="pnpm --filter @openwarelabs/ui build" prompt="›" />
        </Stack>
    );
}
