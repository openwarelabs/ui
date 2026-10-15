import { useState } from "react";

import { ChatTool, DiffViewer, SegmentedControl, Stack } from "@openwarelabs/ui";
import { FilePenLine } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "DiffViewer",
    category: "Data display",
    description:
        "A code diff on the code block's dark ground, unified or side by side: from two versions of a text, or from a unified patch. For an agent's edits and code review.",
    source: "components/DiffViewer/DiffViewer.tsx",
    props: ["DiffViewerProps", "DiffViewerLabels"],
    keyboard: [
        ["Tab", "Moves to the copy button, each file's lines (to scroll them) and each “Show unchanged lines” button."],
        ["Enter or Space", "Shows the unchanged lines; the keyboard moves to the first of them."],
    ],
    notes: [
        "Each file is a table with a column for the old and new line numbers. Screen readers hear each changed line start with “Added” or “Removed”, not just a colour.",
        "The table is named by the file and its counts, “App.tsx: 3 lines added, 1 removed”; the “+3 −1” in the header is hidden from them.",
        "Given oldValue and newValue, it works out the diff itself (a Myers line diff) and marks the words that changed in each changed line. A 2,000-line file diffs and renders at once.",
        "Unchanged lines more than context away from a change fold into a button. A patch's hunks keep their @@ headers.",
        "A split view shows unified below splitMinWidth (500px), and wraps long lines so its sides stay level. It doesn't highlight syntax.",
        "The colours are the success and danger tokens, tinted on the code block, which is dark in both themes.",
    ],
    related: ["CodeBlock", "ChatTool", "FileTree"],
    since: "0.15.0",
};

const before = `import { Button } from "@openwarelabs/ui";

export function Save({ onSave }) {
    return <Button onClick={onSave}>Save</Button>;
}
`;

const after = `import { Button, toast } from "@openwarelabs/ui";

export function Save({ onSave }) {
    async function save() {
        await onSave();
        toast.success("Saved");
    }
    return <Button variant="primary" onClick={save}>Save</Button>;
}
`;

/** From two strings: the words that changed in a changed line are marked. */
export function Unified() {
    return (
        <div style={{ width: "100%" }}>
            <DiffViewer filename="Save.tsx" language="tsx" oldValue={before} newValue={after} />
        </div>
    );
}
Unified.layout = { fill: true };

/** view="split" puts the old version beside the new one. Below 500px wide it shows unified. */
export function Split() {
    const [view, setView] = useState<"split" | "unified">("split");
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <SegmentedControl
                aria-label="View"
                value={view}
                onChange={(next) => setView(next as "split" | "unified")}
                options={[
                    { value: "split", label: "Split" },
                    { value: "unified", label: "Unified" },
                ]}
            />
            <DiffViewer view={view} filename="Save.tsx" language="tsx" oldValue={before} newValue={after} />
        </Stack>
    );
}
Split.layout = { fill: true };

const patch = `diff --git a/src/config.ts b/src/config.ts
index 3b18e51..a9f2c4d 100644
--- a/src/config.ts
+++ b/src/config.ts
@@ -1,6 +1,7 @@
 export const config = {
     port: 3000,
-    retries: 3,
+    retries: 5,
+    backoff: "exponential",
     timeout: 10_000,
     logLevel: "info",
 };
@@ -20,3 +21,3 @@ export function load() {
     const env = process.env;
-    return { ...config, port: Number(env.PORT) };
+    return { ...config, port: Number(env.PORT ?? config.port) };
 }
diff --git a/README.md b/README.md
--- a/README.md
+++ b/README.md
@@ -12,3 +12,4 @@
 ## Configuration

 Set \`PORT\` to change the port.
+Failed requests are retried five times, waiting longer each time.
`;

/** From a patch, as git diff prints it: each file in its own block, with its hunks and their @@ headers. */
export function FromAPatch() {
    return (
        <div style={{ width: "100%" }}>
            <DiffViewer patch={patch} />
        </div>
    );
}
FromAPatch.layout = { fill: true };

const longBefore = Array.from({ length: 60 }, (_, index) => `    "step ${index + 1}",`);
const longAfter = longBefore.map((line, index) => (index === 31 ? `    "step ${index + 1} (retried)",` : line));
const wrapList = (lines: string[]) => ["export const steps = [", ...lines, "];"].join("\n");

/** Unchanged lines more than context (3) away from a change fold into a button that shows them. */
export function CollapsedContext() {
    return (
        <div style={{ width: "100%" }}>
            <DiffViewer filename="steps.ts" oldValue={wrapList(longBefore)} newValue={wrapList(longAfter)} />
        </div>
    );
}
CollapsedContext.layout = { fill: true };

/** As the output of an agent's tool call: the edit it made, in a ChatTool. */
export function InAToolCall() {
    return (
        <div style={{ width: 600, maxWidth: "100%", marginInline: "auto" }}>
            <ChatTool
                title="Edit Save.tsx"
                name="edit_file"
                icon={<FilePenLine size={15} />}
                status="success"
                summary="+6 −2"
                duration={840}
                defaultExpanded
                input={{ path: "src/Save.tsx" }}
                output={<DiffViewer filename="src/Save.tsx" oldValue={before} newValue={after} copyable={false} />}
            />
        </div>
    );
}
InAToolCall.layout = { fill: true };
