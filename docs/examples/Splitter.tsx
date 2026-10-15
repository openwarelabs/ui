import { useState, type CSSProperties, type ReactNode } from "react";

import { Button, FileTree, Splitter, SplitterHandle, SplitterPanel, Stack, Text, type FileTreeNode } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Splitter",
    category: "Layout",
    description:
        "Panels side by side, or stacked, with a handle between each pair that people drag to make them bigger or smaller. For an editor beside its preview, a list beside its detail, a sidebar that folds away.",
    source: "components/Splitter/Splitter.tsx",
    imports: ["Splitter", "SplitterPanel", "SplitterHandle"],
    props: ["SplitterProps", "SplitterPanelProps", "SplitterHandleProps"],
    keyboard: [
        ["Left or Right", "Moves a handle between panels side by side by 1%."],
        ["Up or Down", "Moves a handle between stacked panels by 1%."],
        ["Shift + arrow", "Moves it by 10%."],
        ["Home or End", "Makes the panel before the handle as small or as big as it can be."],
        ["Enter", "Collapses a collapsible panel beside the handle, or expands it again."],
    ],
    notes: [
        "Sizes are percentages of the splitter, and add up to 100. Panels without a defaultSize share what the others leave.",
        "Put SplitterPanels and SplitterHandles straight inside the Splitter, a handle between each pair; fragments are fine, your own wrappers aren't.",
        "Each handle is a focusable separator: its value is the size of the panel before it, which it names with aria-controls. Give it an aria-label that says which panel it resizes.",
        "The line is 1px, but the area you can catch is 9px. Add grip for a handle that's easier to see and to catch on a touch screen.",
        "A collapsible panel folds to its collapsedSize when it's dragged well past its minSize, or with Enter or a double-click on its handle, and expands back to the size it had. At 0 its content is hidden from the keyboard and screen readers too.",
        "The splitter fills its parent, so give the parent a height. Nest a vertical Splitter in a panel for a grid of panes.",
        "With autoSaveId, the sizes are kept in localStorage and put back next time, before the first paint.",
    ],
    related: ["AppShell", "ScrollShadow", "Slider"],
    since: "0.14.0",
};

const frame: CSSProperties = {
    width: "100%",
    height: 320,
    border: "1px solid var(--ow-border)",
    borderRadius: "var(--ow-radius-container)",
    background: "var(--ow-surface)",
    overflow: "hidden",
};

function Pane({ title, children, tone }: { title: string; children?: ReactNode; tone?: "muted" }) {
    return (
        <Stack
            gap="2xs"
            style={{
                height: "100%",
                padding: "14px 16px",
                background: tone === "muted" ? "var(--ow-surface-muted)" : undefined,
            }}
        >
            <Text as="span" variant="label">
                {title}
            </Text>
            {children ? <Text variant="caption">{children}</Text> : null}
        </Stack>
    );
}

const files: FileTreeNode[] = [
    {
        name: "src",
        children: [
            { name: "app.tsx" },
            { name: "cart.ts" },
        ],
    },
    { name: "package.json" },
];

const code = `export function total(cart: Cart) {
    return cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
}`;

/** A code editor: the files on the left, the code on the right. Drag the line between them, or focus it and use the arrow keys. */
export function Editor() {
    const [selected, setSelected] = useState("src/cart.ts");
    return (
        <div style={frame}>
            <Splitter>
                <SplitterPanel defaultSize={30} minSize={20} maxSize={50} style={{ background: "var(--ow-surface-muted)", padding: 6 }}>
                    <FileTree items={files} selected={selected} onSelect={setSelected} label="Files" />
                </SplitterPanel>
                <SplitterHandle aria-label="Resize files" />
                <SplitterPanel minSize={30}>
                    <pre
                        style={{
                            margin: 0,
                            padding: "14px 16px",
                            font: "13px/1.6 var(--ow-font-mono)",
                            whiteSpace: "pre-wrap",
                            color: "var(--ow-text)",
                        }}
                    >
                        {code}
                    </pre>
                </SplitterPanel>
            </Splitter>
        </div>
    );
}
Editor.layout = { fill: true };

/** Three panes, with a sidebar that folds away: drag it past its smallest size, double-click its handle, or press Enter on it. */
export function CollapsibleSidebar() {
    const [sizes, setSizes] = useState([20, 35, 45]);
    const collapsed = sizes[0]! < 1;
    return (
        <Stack gap="sm" style={{ width: "100%" }}>
            <div style={frame}>
                <Splitter sizes={sizes} onSizesChange={setSizes}>
                    <SplitterPanel id="mail-folders" minSize={15} maxSize={30} collapsible>
                        <Pane title="Folders" tone="muted">
                            Inbox, Sent, Archive
                        </Pane>
                    </SplitterPanel>
                    <SplitterHandle aria-label="Resize folders" />
                    <SplitterPanel minSize={25}>
                        <Pane title="Messages">12 conversations</Pane>
                    </SplitterPanel>
                    <SplitterHandle aria-label="Resize messages" />
                    <SplitterPanel minSize={25}>
                        <Pane title="Reading">The message you picked</Pane>
                    </SplitterPanel>
                </Splitter>
            </div>
            <Stack direction="row" gap="sm" align="center" justify="between" wrap>
                <Text variant="caption">{sizes.map((size) => `${Math.round(size)}%`).join(" · ")}</Text>
                <Stack direction="row" gap="xs">
                    <Button
                        size="sm"
                        variant="secondary"
                        aria-controls="mail-folders"
                        aria-expanded={!collapsed}
                        onClick={() => setSizes(collapsed ? [20, 35, 45] : [0, 45, 55])}
                    >
                        {collapsed ? "Show folders" : "Hide folders"}
                    </Button>
                </Stack>
            </Stack>
        </Stack>
    );
}
CollapsibleSidebar.layout = { fill: true };

/** Stacked: the editor above, the terminal below. The grip makes the handle easier to catch. */
export function Vertical() {
    return (
        <div style={frame}>
            <Splitter direction="vertical">
                <SplitterPanel defaultSize={65} minSize={25}>
                    <Pane title="Editor">src/cart.ts</Pane>
                </SplitterPanel>
                <SplitterHandle grip aria-label="Resize terminal" />
                <SplitterPanel minSize={15}>
                    <Pane title="Terminal" tone="muted">
                        npm run dev
                    </Pane>
                </SplitterPanel>
            </Splitter>
        </div>
    );
}
Vertical.layout = { fill: true };

/** A vertical splitter inside a panel, for a grid of panes. These sizes are remembered when you come back. */
export function Nested() {
    return (
        <div style={frame}>
            <Splitter autoSaveId="docs-splitter-nested">
                <SplitterPanel defaultSize={40} minSize={20}>
                    <Pane title="Prompt" tone="muted">
                        Write a function that totals a cart.
                    </Pane>
                </SplitterPanel>
                <SplitterHandle aria-label="Resize prompt" />
                <SplitterPanel minSize={30}>
                    <Splitter direction="vertical" autoSaveId="docs-splitter-nested-right">
                        <SplitterPanel minSize={20}>
                            <Pane title="Code">cart.ts</Pane>
                        </SplitterPanel>
                        <SplitterHandle aria-label="Resize code" />
                        <SplitterPanel minSize={20}>
                            <Pane title="Preview">The total, as it renders</Pane>
                        </SplitterPanel>
                    </Splitter>
                </SplitterPanel>
            </Splitter>
        </div>
    );
}
Nested.layout = { fill: true };
