import { useState } from "react";
import { Building2, FileText, Folder, Settings, User, Users } from "lucide-react";

import { Badge, Card, Text, TreeView, type TreeItem } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "TreeView",
    category: "Data display",
    description:
        "Rows that open and close to show the rows under them: categories, an org chart, permissions, nested settings. Pick one row or many, check them with tri-state parents, and fetch children the first time a row opens.",
    source: "components/TreeView/TreeView.tsx",
    imports: ["TreeView", "type TreeItem"],
    props: ["TreeViewProps", "TreeItem", "TreeViewLabels"],
    keyboard: [
        [
            "Up or Down",
            "Moves between the visible rows. With Shift in multiple mode, extends the selection.",
        ],
        ["Right", "Opens a row, or moves to its first child. Left in right-to-left text."],
        ["Left", "Closes a row, or moves to its parent. Right in right-to-left text."],
        ["Home or End", "Goes to the first or last visible row."],
        ["*", "Opens every row at the same level."],
        ["A letter", "Moves to the next row whose label starts with what's typed."],
        ["Space", "Selects or checks the row."],
        [
            "Enter",
            "Activates the row (onAction); without onAction, opens or closes it, or selects it.",
        ],
    ],
    notes: [
        "It's a WAI-ARIA tree with one tab stop: each row is a treeitem with its level, position and size, and the rows under it are a group.",
        "Rows say whether they're selected (aria-selected) or, with checkboxes, checked, unchecked or mixed (aria-checked); the checkbox you see is drawn for the row, not a second tab stop.",
        "Checking a row checks the loaded rows under it; a row whose rows are partly checked shows a dash. selected holds every fully checked id.",
        "With loadChildren, a row with hasChildren fetches its children when it first opens. A loading row shows meanwhile, and if it fails a row that tries again when activated.",
        "Labels are plain strings so type-ahead and screen readers can read them; renderLabel draws something richer. Keep end content non-interactive, and put row actions in a ContextMenu or a Toolbar.",
    ],
    related: ["FileTree", "ListBox", "NavList", "Checkbox", "ContextMenu"],
    since: "0.15.0",
};

const categories: TreeItem[] = [
    {
        id: "kitchen",
        label: "Kitchen",
        end: "128",
        children: [
            {
                id: "cookware",
                label: "Cookware",
                end: "54",
                children: [
                    { id: "pans", label: "Pans", end: "22" },
                    { id: "pots", label: "Pots", end: "18" },
                    { id: "dutch-ovens", label: "Dutch ovens", end: "14" },
                ],
            },
            { id: "knives", label: "Knives", end: "31" },
            { id: "utensils", label: "Utensils", end: "43" },
        ],
    },
    {
        id: "dining",
        label: "Dining",
        end: "76",
        children: [
            { id: "plates", label: "Plates", end: "40" },
            { id: "glassware", label: "Glassware", end: "36" },
        ],
    },
    { id: "pantry", label: "Pantry", end: "64" },
    { id: "gifts", label: "Gift cards", end: "3", disabled: true },
];

/** Categories with counts. Click or press Space to select one; the arrow keys move and open. */
export function Basic() {
    const [selected, setSelected] = useState(["pans"]);
    return (
        <Card padding="none" style={{ width: 300, maxWidth: "100%", padding: 6 }}>
            <TreeView
                label="Categories"
                items={categories}
                defaultExpanded={["kitchen", "cookware"]}
                selected={selected}
                onSelectedChange={setSelected}
            />
        </Card>
    );
}

const permissions: TreeItem[] = [
    {
        id: "recipes",
        label: "Recipes",
        description: "What people can do with recipes",
        children: [
            { id: "recipes.read", label: "View recipes" },
            { id: "recipes.write", label: "Create and edit recipes" },
            { id: "recipes.publish", label: "Publish recipes" },
        ],
    },
    {
        id: "orders",
        label: "Orders",
        description: "The shop's orders and refunds",
        children: [
            { id: "orders.read", label: "View orders" },
            { id: "orders.refund", label: "Issue refunds" },
            { id: "orders.export", label: "Export orders", disabled: true },
        ],
    },
    { id: "billing", label: "Billing", description: "Plans, invoices and payment methods" },
];

/** checkboxes: checking a group checks everything in it, and a partly checked group shows a dash. */
export function Checkboxes() {
    const [granted, setGranted] = useState(["recipes.read", "recipes.write"]);
    return (
        <div style={{ display: "grid", gap: 12, width: 340, maxWidth: "100%" }}>
            <TreeView
                label="Permissions"
                items={permissions}
                checkboxes
                defaultExpanded={["recipes", "orders"]}
                selected={granted}
                onSelectedChange={setGranted}
            />
            <Text variant="caption" tone="muted">
                {granted.length ? `Granted: ${granted.join(", ")}` : "Nothing granted"}
            </Text>
        </div>
    );
}
Checkboxes.layout = { align: "start" as const };

const people: Record<string, Array<[string, string]>> = {
    ana: [
        ["ben", "Ben Okafor"],
        ["chloe", "Chloé Martin"],
    ],
    ben: [
        ["dara", "Dara Byrne"],
        ["emil", "Emil Lund"],
        ["farah", "Farah Haddad"],
    ],
    chloe: [["gus", "Gus Novak"]],
};
const roles: Record<string, string> = {
    ana: "CEO",
    ben: "Head of Engineering",
    chloe: "Head of Design",
};

/** loadChildren fetches someone's reports the first time they open. Chloé's team fails once, to show the retry row. */
export function LazyLoading() {
    const [failedOnce, setFailedOnce] = useState(false);
    const toItem = ([id, name]: [string, string]): TreeItem => ({
        id,
        label: name,
        description: roles[id] ?? "Engineer",
        icon: <User size={16} />,
        hasChildren: id in people,
    });
    return (
        <Card padding="none" style={{ width: 320, maxWidth: "100%", padding: 6 }}>
            <TreeView
                label="Organisation"
                selectionMode="none"
                items={[toItem(["ana", "Ana Ferreira"])]}
                loadChildren={(item) =>
                    new Promise((resolve, reject) =>
                        setTimeout(() => {
                            if (item.id === "chloe" && !failedOnce) {
                                setFailedOnce(true);
                                reject(new Error("Network"));
                            } else resolve((people[item.id] ?? []).map(toItem));
                        }, 900),
                    )
                }
            />
        </Card>
    );
}

const files: TreeItem[] = [
    {
        id: "handbook",
        label: "Handbook",
        icon: <Folder size={16} />,
        children: [
            { id: "welcome", label: "Welcome", icon: <FileText size={16} /> },
            {
                id: "benefits",
                label: "Benefits",
                icon: <FileText size={16} />,
                end: <Badge size="sm">New</Badge>,
            },
            { id: "time-off", label: "Time off", icon: <FileText size={16} /> },
        ],
    },
    {
        id: "teams",
        label: "Teams",
        icon: <Users size={16} />,
        children: [
            { id: "design", label: "Design", icon: <FileText size={16} /> },
            { id: "engineering", label: "Engineering", icon: <FileText size={16} /> },
        ],
    },
    { id: "offices", label: "Offices", icon: <Building2 size={16} /> },
    { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

/** selectionMode="multiple": Space or a click adds a page, Shift with a click or the arrows selects a range. Enter or a double-click opens one. */
export function MultipleSelection() {
    const [selected, setSelected] = useState<string[]>(["welcome"]);
    const [opened, setOpened] = useState<string>();
    return (
        <div style={{ display: "grid", gap: 12, width: 300, maxWidth: "100%" }}>
            <Card padding="none" style={{ padding: 6 }}>
                <TreeView
                    label="Pages"
                    items={files}
                    selectionMode="multiple"
                    defaultExpanded={["handbook", "teams"]}
                    selected={selected}
                    onSelectedChange={setSelected}
                    onAction={(item) => setOpened(item.label)}
                />
            </Card>
            <Text variant="caption" tone="muted">
                {selected.length} selected{opened ? ` · opened ${opened}` : ""}
            </Text>
        </div>
    );
}
MultipleSelection.layout = { align: "start" as const };
