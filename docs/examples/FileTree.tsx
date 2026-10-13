import { useState } from "react";

import { Card, FileTree, type FileTreeNode } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "FileTree",
    category: "Data display",
    description: "Folders and files that open and close, for a project's files or a diff.",
    source: "components/FileTree/FileTree.tsx",
    imports: ["FileTree", "type FileTreeNode"],
    props: ["FileTreeProps", "FileTreeNode"],
    keyboard: [
        ["Up or Down", "Moves between visible rows."],
        ["Right", "Opens a folder, or moves into an open one."],
        ["Left", "Closes a folder, or moves to its parent."],
        ["Home or End", "Goes to the first or last row."],
        ["Enter or Space", "Selects a file, or opens and closes a folder."],
    ],
    notes: [
        "It's a tree with one tab stop; the arrow keys move inside it.",
        "Folders come before files, each in the order you give them.",
    ],
    related: ["Breadcrumbs", "CodeBlock"],
};

const files: FileTreeNode[] = [
    {
        name: "src",
        children: [
            {
                name: "components",
                children: [
                    { name: "Cart.tsx", meta: "+48" },
                    { name: "Recipe.tsx", meta: "+12 −3" },
                ],
            },
            { name: "app.tsx" },
            { name: "cart.test.ts", meta: "+30" },
        ],
    },
    { name: "public", children: [] },
    { name: "package.json" },
    { name: "README.md" },
];

/** A project's files, with what changed. */
export function Basic() {
    const [selected, setSelected] = useState("src/components/Cart.tsx");
    return (
        <Card padding="none" style={{ width: 300, maxWidth: "100%", padding: 6 }}>
            <FileTree items={files} selected={selected} onSelect={setSelected} label="recipe-app" />
        </Card>
    );
}

/** Only some folders open at first. */
export function Collapsed() {
    return (
        <Card padding="none" style={{ width: 300, maxWidth: "100%", padding: 6 }}>
            <FileTree items={files} defaultExpanded={["src"]} />
        </Card>
    );
}
