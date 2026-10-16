import { useState, type Key, type ReactNode } from "react";

import {
    Badge,
    Button,
    Card,
    Menu,
    MenuItem,
    SearchField,
    Stack,
    Table,
    Textarea,
    ToggleButtonGroup,
    Toolbar,
    ToolbarSeparator,
    Tooltip,
    type TableColumn,
} from "@openwarelabs/ui";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Archive,
    Bold,
    Bot,
    Code,
    Download,
    FolderInput,
    Hand,
    Italic,
    Link,
    List,
    ListOrdered,
    MousePointer2,
    Pencil,
    Redo2,
    Square,
    StickyNote,
    Trash2,
    Type,
    Underline,
    Undo2,
    UserPlus,
    ZoomIn,
    ZoomOut,
} from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Toolbar",
    category: "Actions",
    description:
        "A row of controls for one context, like an editor's formatting bar or a table's bulk actions. It's one tab stop, and the arrow keys move between its controls.",
    source: "components/Toolbar/Toolbar.tsx",
    imports: ["Toolbar", "ToolbarSeparator"],
    props: ["ToolbarProps", "ToolbarSeparatorProps"],
    keyboard: [
        [
            "Tab",
            "Moves into the toolbar, onto the control focused last (at first, the first one), and out again.",
        ],
        [
            "Left or Right",
            "Moves to the previous or next control, wrapping round. In a vertical toolbar, Up or Down.",
        ],
        ["Home or End", "Moves to the first or last control."],
        ["Space or Enter", "Uses the focused control: presses a button, opens a menu."],
    ],
    notes: [
        'It has role="toolbar" and aria-orientation. Name it with aria-label, like "Formatting".',
        "The arrow keys reach every enabled control inside, the buttons of a ToggleButtonGroup included, and skip disabled ones. Controls added later join in their place.",
        "Controls that need the arrow keys keep them: a text field moves its caret and passes Left or Right on from its first or last character; an open Select or menu moves through its options.",
        "ToggleButtonGroups and separators take the toolbar's size and orientation; give Buttons the same size.",
        "Icon-only buttons need an aria-label, and a Tooltip with the same words.",
        "A SegmentedControl's arrow keys would compete with the toolbar's: in a toolbar, use a ToggleButtonGroup with selectionMode=\"single\".",
    ],
    related: ["ToggleButtonGroup", "ButtonGroup", "ToggleButton", "Separator"],
    since: "0.4.0",
};

function IconAction({
    label,
    icon,
    placement,
}: {
    label: string;
    icon: ReactNode;
    placement?: "top" | "right";
}) {
    return (
        <Tooltip label={label} placement={placement}>
            <Button variant="ghost" size="sm" iconOnly aria-label={label}>
                {icon}
            </Button>
        </Tooltip>
    );
}

/** A comment editor's formatting bar: text styles that combine, an alignment, a few actions, and undo and redo at the end. */
export function CommentEditor() {
    const [marks, setMarks] = useState<string[]>([]);
    const [align, setAlign] = useState("left");
    return (
        <Stack gap="sm" style={{ width: 580, maxWidth: "100%" }}>
            <Toolbar aria-label="Formatting" size="sm">
                <ToggleButtonGroup
                    selectionMode="multiple"
                    aria-label="Text style"
                    value={marks}
                    onChange={setMarks}
                    options={[
                        { value: "bold", icon: <Bold size={16} />, "aria-label": "Bold" },
                        { value: "italic", icon: <Italic size={16} />, "aria-label": "Italic" },
                        {
                            value: "underline",
                            icon: <Underline size={16} />,
                            "aria-label": "Underline",
                        },
                        { value: "code", icon: <Code size={16} />, "aria-label": "Code" },
                    ]}
                />
                <ToolbarSeparator />
                <ToggleButtonGroup
                    aria-label="Alignment"
                    value={align}
                    onChange={setAlign}
                    disallowEmptySelection
                    options={[
                        {
                            value: "left",
                            icon: <AlignLeft size={16} />,
                            "aria-label": "Align left",
                        },
                        {
                            value: "center",
                            icon: <AlignCenter size={16} />,
                            "aria-label": "Align centre",
                        },
                        {
                            value: "right",
                            icon: <AlignRight size={16} />,
                            "aria-label": "Align right",
                        },
                    ]}
                />
                <ToolbarSeparator />
                <IconAction label="Link" icon={<Link size={16} />} />
                <IconAction label="Bulleted list" icon={<List size={16} />} />
                <IconAction label="Numbered list" icon={<ListOrdered size={16} />} />
                <Stack direction="row" gap="2xs" style={{ marginInlineStart: "auto" }}>
                    <IconAction label="Undo" icon={<Undo2 size={16} />} />
                    <IconAction label="Redo" icon={<Redo2 size={16} />} />
                </Stack>
            </Toolbar>
            <Textarea
                aria-label="Comment"
                rows={4}
                defaultValue="The agent's migration looks right. Can we keep the old webhook route for a week before we remove it?"
                style={{
                    fontWeight: marks.includes("bold") ? "var(--ow-weight-heavy)" : undefined,
                    fontStyle: marks.includes("italic") ? "italic" : undefined,
                    textDecoration: marks.includes("underline") ? "underline" : undefined,
                    fontFamily: marks.includes("code") ? "var(--ow-font-mono)" : undefined,
                    textAlign: align as "left" | "center" | "right",
                }}
            />
        </Stack>
    );
}

interface Task {
    id: string;
    title: string;
    assignee: string;
    status: "To do" | "In progress" | "In review";
}

const tasks: Task[] = [
    { id: "t1", title: "Migrate billing webhooks to v2", assignee: "Agent", status: "In review" },
    {
        id: "t2",
        title: "Add rate limits to the public API",
        assignee: "Sam Okafor",
        status: "In progress",
    },
    { id: "t3", title: "Remove the legacy export job", assignee: "Agent", status: "To do" },
    { id: "t4", title: "Write the 0.4 release notes", assignee: "Clara Novak", status: "To do" },
];

const statusVariant = {
    "To do": "neutral",
    "In progress": "active",
    "In review": "warning",
} as const;

const taskColumns: Array<TableColumn<Task>> = [
    { key: "title", header: "Task" },
    { key: "assignee", header: "Assignee" },
    {
        key: "status",
        header: "Status",
        render: (task) => <Badge variant={statusVariant[task.status]}>{task.status}</Badge>,
    },
];

/** A table's bulk actions: what they apply to, then the actions. A menu opened from the toolbar keeps the arrow keys while it's open. */
export function BulkActions() {
    const [selected, setSelected] = useState<Key[]>(["t2", "t3"]);
    const none = selected.length === 0;
    return (
        <Stack gap="sm" style={{ width: "100%" }}>
            <Toolbar aria-label="Bulk actions" size="sm">
                <span
                    aria-live="polite"
                    style={{ padding: "0 8px", color: "var(--ow-text-muted)", fontSize: 13 }}
                >
                    {none ? "Select tasks to act on them" : `${selected.length} selected`}
                </span>
                <ToolbarSeparator />
                <Menu
                    label="Assign to"
                    trigger={
                        <Button size="sm" startIcon={<UserPlus size={16} />} disabled={none}>
                            Assign
                        </Button>
                    }
                >
                    <MenuItem>Sam Okafor</MenuItem>
                    <MenuItem>Clara Novak</MenuItem>
                    <MenuItem icon={<Bot size={15} />}>An agent</MenuItem>
                </Menu>
                <Menu
                    label="Move to project"
                    trigger={
                        <Button size="sm" startIcon={<FolderInput size={16} />} disabled={none}>
                            Move to…
                        </Button>
                    }
                >
                    <MenuItem>billing-api</MenuItem>
                    <MenuItem>landing-page</MenuItem>
                    <MenuItem>docs-site</MenuItem>
                </Menu>
                <Button size="sm" startIcon={<Archive size={16} />} disabled={none}>
                    Archive
                </Button>
                <ToolbarSeparator />
                <Button size="sm" startIcon={<Trash2 size={16} />} disabled={none}>
                    Delete
                </Button>
            </Toolbar>
            <Table
                caption="Tasks"
                hideCaption
                density="compact"
                selectionMode="multiple"
                selectedKeys={selected}
                onSelectionChange={setSelected}
                columns={taskColumns}
                rows={tasks}
            />
        </Stack>
    );
}
BulkActions.layout = { fill: true };

/** A vertical tool palette for a planning board. Up and Down move through it, and its tooltips open to the right. */
export function ToolPalette() {
    const [tool, setTool] = useState("select");
    return (
        <Toolbar aria-label="Board tools" orientation="vertical" size="sm">
            <ToggleButtonGroup
                aria-label="Tool"
                value={tool}
                onChange={setTool}
                disallowEmptySelection
                options={[
                    { value: "select", icon: <MousePointer2 size={16} />, "aria-label": "Select" },
                    { value: "hand", icon: <Hand size={16} />, "aria-label": "Pan" },
                    { value: "pen", icon: <Pencil size={16} />, "aria-label": "Draw" },
                    { value: "shape", icon: <Square size={16} />, "aria-label": "Shape" },
                    { value: "text", icon: <Type size={16} />, "aria-label": "Text" },
                    { value: "note", icon: <StickyNote size={16} />, "aria-label": "Sticky note" },
                ]}
            />
            <ToolbarSeparator />
            <IconAction label="Zoom in" icon={<ZoomIn size={16} />} placement="right" />
            <IconAction label="Zoom out" icon={<ZoomOut size={16} />} placement="right" />
        </Toolbar>
    );
}
ToolPalette.layout = { minHeight: 380, ground: "canvas" };

const logLines = [
    { level: "info", time: "12:04:11", text: "Agent started “Migrate billing webhooks to v2”" },
    { level: "warnings", time: "12:04:30", text: "Test suite took 48s, twice as long as usual" },
    { level: "errors", time: "12:05:02", text: "2 tests failed in webhooks.spec.ts" },
    { level: "info", time: "12:05:40", text: "Fixed the failing tests and pushed 3 commits" },
    { level: "info", time: "12:06:15", text: "Opened pull request #412 for review" },
];

/**
 * variant="plain" in a panel's header, beside a search field. In the field, Left and Right move the caret, and move on to
 * the next control from either end of the text.
 */
export function PlainInAPanel() {
    const [query, setQuery] = useState("");
    const [levels, setLevels] = useState<string[]>(["errors", "warnings", "info"]);
    const shown = logLines.filter(
        (line) =>
            levels.includes(line.level) && line.text.toLowerCase().includes(query.toLowerCase()),
    );
    return (
        <Card padding="none" style={{ width: 640, maxWidth: "100%" }}>
            <Toolbar
                aria-label="Run log"
                variant="plain"
                size="sm"
                style={{ padding: 10, borderBottom: "1px solid var(--ow-border)" }}
            >
                <div style={{ flex: "1 1 160px" }}>
                    <SearchField
                        size="sm"
                        aria-label="Filter the log"
                        placeholder="Filter the log"
                        value={query}
                        onChange={setQuery}
                    />
                </div>
                <ToggleButtonGroup
                    selectionMode="multiple"
                    aria-label="Log levels"
                    value={levels}
                    onChange={setLevels}
                    options={[
                        { value: "errors", label: "Errors" },
                        { value: "warnings", label: "Warnings" },
                        { value: "info", label: "Info" },
                    ]}
                />
                <Tooltip label="Download the log">
                    <Button variant="ghost" size="sm" iconOnly aria-label="Download the log">
                        <Download size={16} />
                    </Button>
                </Tooltip>
            </Toolbar>
            <div
                style={{
                    display: "grid",
                    gap: 6,
                    padding: "12px 16px",
                    minHeight: 156,
                    fontFamily: "var(--ow-font-mono)",
                    fontSize: 12.5,
                }}
            >
                {shown.map((line) => (
                    <div key={line.time} style={{ display: "flex", gap: 12 }}>
                        <span style={{ color: "var(--ow-text-muted)" }}>{line.time}</span>
                        <span
                            style={{
                                color:
                                    line.level === "errors"
                                        ? "var(--ow-danger-text)"
                                        : line.level === "warnings"
                                          ? "var(--ow-warning-text)"
                                          : "var(--ow-text)",
                            }}
                        >
                            {line.text}
                        </span>
                    </div>
                ))}
                {shown.length === 0 ? (
                    <span
                        style={{ color: "var(--ow-text-muted)", fontFamily: "var(--ow-font-sans)" }}
                    >
                        Nothing matches the filter.
                    </span>
                ) : null}
            </div>
        </Card>
    );
}
PlainInAPanel.layout = { fill: true };
