import { useState } from "react";

import { Button, Field, Form, Input, Text, TransferList, toast } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "TransferList",
    category: "Choices",
    description:
        "Two lists, the available items and the chosen ones, with buttons between them to move items across: permissions, the columns a table shows, a team's members.",
    source: "components/TransferList/TransferList.tsx",
    props: ["TransferListProps", "TransferListOption"],
    keyboard: [
        ["Tab", "Moves through the search boxes, the lists and the buttons."],
        ["Up, Down, Home, End, letters", "Move through a list, as in ListBox."],
        ["Space", "Selects or unselects the highlighted item; Shift + arrows select a run, Ctrl + A all of them."],
        ["Enter", "Moves the highlighted item to the other list, or the whole selection when it's part of it."],
        ["Alt + Up or Down", "With orderable, moves the selected chosen items up or down."],
    ],
    notes: [
        "Each list is a multiple-selection listbox named by its heading, and described by its count, such as \"3 of 12 selected\".",
        "The move buttons say what they do, such as \"Move 2 selected to Selected\", and are disabled while there's nothing to move.",
        "A move is read out politely, such as \"Moved Ada and Grace to Selected\", and focus stays in the list you moved from.",
        "Double-clicking an item moves it. Disabled items stay where they are.",
        "Give it a name and it submits each chosen value in a hidden input, so a Form gets a string[] (or a string, when there is one).",
        "Below 520px wide, the lists stack and the buttons turn to point down and up.",
    ],
    related: ["ListBox", "SearchField", "Form", "Table"],
    since: "0.15.0",
};

const permissions = [
    { value: "repo:read", label: "Read repositories", description: "Clone and browse code", group: "Code" },
    { value: "repo:write", label: "Push to repositories", description: "Push branches and tags", group: "Code" },
    { value: "repo:admin", label: "Administer repositories", description: "Only owners can grant this", group: "Code", disabled: true },
    { value: "issues:read", label: "Read issues", group: "Issues" },
    { value: "issues:write", label: "Open and edit issues", group: "Issues" },
    { value: "deploy:staging", label: "Deploy to staging", group: "Deployments" },
    { value: "deploy:production", label: "Deploy to production", group: "Deployments" },
];

/** A role's permissions, in groups. Select some and press the arrow, double-click one, or press Enter on it. */
export function Permissions() {
    const [granted, setGranted] = useState(["repo:read", "issues:read"]);
    return (
        <div style={{ width: 640, maxWidth: "100%", marginInline: "auto" }}>
            <TransferList options={permissions} value={granted} onChange={setGranted} targetLabel="Granted" height={300} />
        </div>
    );
}
Permissions.layout = { fill: true };

const firstNames = ["Ada", "Grace", "Alan", "Edsger", "Barbara", "Donald", "Frances", "John", "Katherine", "Linus", "Margaret", "Niklaus"];
const lastNames = ["Lovelace", "Hopper", "Turing", "Dijkstra", "Liskov", "Knuth", "Allen", "Backus", "Johnson", "Torvalds"];
const people = firstNames.flatMap((first, row) =>
    lastNames.slice(0, 5).map((_, column) => {
        const last = lastNames[(row + column) % lastNames.length]!;
        return { value: `${first}-${last}`.toLowerCase(), label: `${first} ${last}`, description: `${first.toLowerCase()}.${last.toLowerCase()}@acme.dev` };
    }),
);

/** Sixty people: searchable filters each list by name or email, and showMoveAll moves everything the search shows. */
export function Searchable() {
    return (
        <div style={{ width: 640, maxWidth: "100%", marginInline: "auto" }}>
            <TransferList options={people} defaultValue={["ada-lovelace"]} sourceLabel="People" targetLabel="Team" searchable showMoveAll height={320} />
        </div>
    );
}
Searchable.layout = { fill: true };

const reviewers = people.slice(0, 15);

/** In a Form, name submits the chosen ids, one hidden input each. */
export function InAForm() {
    return (
        <Form
            style={{ width: 640, maxWidth: "100%", marginInline: "auto" }}
            onSubmit={(values) => {
                const chosen = ([] as string[]).concat(values.reviewers ?? []);
                toast.success(`${values.title || "Review"}: ${chosen.length} ${chosen.length === 1 ? "reviewer" : "reviewers"} asked`);
            }}
        >
            <Field label="Title">
                <Input name="title" defaultValue="Design review" />
            </Field>
            <TransferList options={reviewers} name="reviewers" targetLabel="Reviewers" height={220} />
            <Button type="submit" variant="primary">
                Ask for review
            </Button>
        </Form>
    );
}
InAForm.layout = { fill: true, align: "start" as const };

const columns = [
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
    { value: "team", label: "Team" },
    { value: "status", label: "Status" },
    { value: "lastSeen", label: "Last seen" },
    { value: "created", label: "Created" },
    { value: "location", label: "Location" },
];

/** A table's columns: orderable adds Move up and Move down (Alt + Up/Down in the list), and the order is kept. */
export function ColumnPicker() {
    const [shown, setShown] = useState(["name", "email", "role"]);
    const labelOf = (v: string) => columns.find((column) => column.value === v)?.label;
    return (
        <div style={{ display: "grid", gap: 12, width: 560, maxWidth: "100%", marginInline: "auto" }}>
            <TransferList options={columns} value={shown} onChange={setShown} sourceLabel="Hidden columns" targetLabel="Shown columns" orderable height={260} />
            <Text variant="caption" tone="muted">
                Columns: {shown.map(labelOf).join(" · ") || "none"}
            </Text>
        </div>
    );
}
ColumnPicker.layout = { fill: true };
