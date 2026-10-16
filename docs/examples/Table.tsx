import { useState, type Key } from "react";

import { Badge, Button, EmptyState, Table, User, type TableColumn } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Table",
    category: "Data display",
    description:
        "Rows of records with columns that sort, rows that can be selected, and something to say when it's empty.",
    source: "components/Table/Table.tsx",
    imports: ["Table", "type TableColumn"],
    props: ["TableProps", "TableColumn"],
    keyboard: [
        ["Enter or Space", "On a column header, sorts by it; press again to reverse."],
        ["Space", "On a row's checkbox, selects the row."],
    ],
    notes: [
        "Sortable headers are buttons, and the sorted column has aria-sort.",
        "Give it a caption. Hide it with hideCaption when the heading above already says what the table is.",
        'Numbers line up on the right with tabular figures: set align="end" on their column.',
        'By default the rows sit on a raised panel inside a tinted tray, with the header in the tray (variant="inset"). variant="plain" is a single bordered card with a shaded header row, for a table inside a card of its own.',
    ],
    related: ["Pagination", "EmptyState", "Stat"],
};

interface Run {
    id: string;
    project: string;
    owner: string;
    status: "Done" | "Running" | "Failed";
    cost: number;
    minutes: number;
}

const runs: Run[] = [
    {
        id: "r1",
        project: "recipe-app",
        owner: "Alex Silver",
        status: "Done",
        cost: 1.84,
        minutes: 12,
    },
    {
        id: "r2",
        project: "landing-page",
        owner: "Seán McCarthy",
        status: "Running",
        cost: 0.42,
        minutes: 4,
    },
    {
        id: "r3",
        project: "billing-api",
        owner: "Aoife O'Sullivan",
        status: "Failed",
        cost: 2.9,
        minutes: 21,
    },
    {
        id: "r4",
        project: "docs-site",
        owner: "Alex Silver",
        status: "Done",
        cost: 0.66,
        minutes: 6,
    },
];

const variant = { Done: "success", Running: "active", Failed: "danger" } as const;

const columns: Array<TableColumn<Run>> = [
    {
        key: "project",
        header: "Project",
        sortable: true,
        render: (run) => <strong style={{ fontWeight: 500 }}>{run.project}</strong>,
    },
    { key: "owner", header: "Owner", render: (run) => <User name={run.owner} size="sm" /> },
    {
        key: "status",
        header: "Status",
        render: (run) => <Badge variant={variant[run.status]}>{run.status}</Badge>,
    },
    {
        key: "minutes",
        header: "Time",
        align: "end",
        sortable: true,
        render: (run) => `${run.minutes} min`,
    },
    {
        key: "cost",
        header: "Cost",
        align: "end",
        sortable: true,
        render: (run) => `$${run.cost.toFixed(2)}`,
    },
];

/** Sortable columns and custom cells. */
export function Basic() {
    return (
        <Table
            caption="Recent runs"
            hideCaption
            columns={columns}
            rows={runs}
            defaultSort={{ key: "cost", direction: "descending" }}
        />
    );
}
Basic.layout = { fill: true };

/** variant="plain": one bordered card with a shaded header row. */
export function Plain() {
    return <Table caption="Recent runs" hideCaption variant="plain" columns={columns} rows={runs} />;
}
Plain.layout = { fill: true };

/**
 * selectionMode="multiple" adds a checkbox to each row and one to select them all. Each box reads out as "Select" and
 * the row's first column ("Select billing-api"); pass rowLabel to name rows another way.
 */
export function Selection() {
    const [selected, setSelected] = useState<Key[]>(["r3"]);
    return (
        <div style={{ width: "100%" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    minHeight: 32,
                }}
            >
                <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>
                    {selected.length ? `${selected.length} selected` : "Select runs to compare"}
                </span>
                <Button size="sm" disabled={!selected.length}>
                    Compare
                </Button>
            </div>
            <Table
                caption="Recent runs"
                hideCaption
                density="compact"
                columns={columns}
                rows={runs}
                selectionMode="multiple"
                selectedKeys={selected}
                onSelectionChange={setSelected}
            />
        </div>
    );
}
Selection.layout = { fill: true };

/** With no rows, emptyContent shows instead. */
export function Empty() {
    return (
        <Table
            caption="Recent runs"
            hideCaption
            columns={columns}
            rows={[]}
            emptyContent={
                <EmptyState
                    title="No runs yet"
                    description="Runs show here once the pipeline starts."
                />
            }
        />
    );
}
Empty.layout = { fill: true };
