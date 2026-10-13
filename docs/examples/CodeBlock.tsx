import { CodeBlock } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "CodeBlock",
    category: "Data display",
    description:
        "A block of code on a dark ground, with a title bar, line numbers and a copy button.",
    source: "components/CodeBlock/CodeBlock.tsx",
    notes: [
        "It doesn't highlight code itself. Pass highlighted markup from Shiki or Prism as html, and code for copying.",
        "The copy button says “Copied” for a moment, and announces it to screen readers.",
        "Long blocks scroll inside; set maxHeight to cap them.",
    ],
    related: ["Snippet", "CopyButton", "Kbd"],
};

const sample = `import { Button } from "@openwarelabs/ui";

export function Save() {
    return <Button variant="primary">Save</Button>;
}`;

/** With a title. */
export function Basic() {
    return (
        <div style={{ width: "100%" }}>
            <CodeBlock title="Save.tsx" language="tsx" code={sample} />
        </div>
    );
}
Basic.layout = { fill: true };

/** With line numbers and a height limit. */
export function LineNumbers() {
    const log = Array.from(
        { length: 24 },
        (_, index) => `[${String(index + 1).padStart(2, "0")}] ✓ step ${index + 1} finished`,
    ).join("\n");
    return (
        <div style={{ width: "100%" }}>
            <CodeBlock title="Build log" code={log} showLineNumbers maxHeight={220} />
        </div>
    );
}
LineNumbers.layout = { fill: true };
