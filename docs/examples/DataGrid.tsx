import { useState, type Key } from "react";

import { Badge, Button, DataGrid, User, type DataGridColumn } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "DataGrid",
    category: "Data display",
    description:
        "A table for hundreds or thousands of records: search every column or filter each one, sort, drag a column's edge to resize it, and select rows. Only the rows in view are rendered.",
    source: "components/DataGrid/DataGrid.tsx",
    props: ["DataGridProps", "DataGridColumn", "DataGridLabels"],
    keyboard: [
        ["Tab", "Moves through the search box, the column headers, their resize handles, the filter boxes, the grid and the checkboxes."],
        ["Left or Right", "On a resize handle, narrows or widens the column by 16px; with Shift, by 64px. Mirrored in right-to-left text."],
        ["Home or End", "On a resize handle, makes the column as narrow or as wide as it goes."],
        ["Up, Down, Page Up, Page Down", "With the grid focused, scroll the rows."],
        ["Shift + click", "On a row's checkbox, selects or unselects every row between it and the last one clicked."],
        ["Escape", "In the search or a filter box, clears it."],
    ],
    notes: [
        "It's a table named by label, with aria-rowcount and each row's aria-rowindex, so screen readers know how many rows there are while only those in view are rendered.",
        "Sortable headers are buttons, and the sorted column has aria-sort. Each resize handle is a separator named \"Resize Name column\" with its width as its value; double-click one to put the column back to its first width.",
        "The count above the grid (\"12 of 340 rows, 3 selected\") is a status, read out as the search, the filters and the selection change.",
        "Search matches every word in any column, ignoring case and accents; a column's filter matches its own text. Use filterValue when a cell shows something other than its field.",
        "Every row is one line of a fixed height, and text that doesn't fit ends in \"…\". For rows of different heights, or fewer than a hundred records, use Table.",
        "The row holding focus stays rendered while it scrolls out of view, so focus isn't lost.",
    ],
    related: ["Table", "VirtualList", "SearchField", "Pagination"],
    since: "0.17.0",
};

interface Order {
    id: string;
    customer: string;
    email: string;
    status: "Paid" | "Pending" | "Refunded" | "Failed";
    items: number;
    total: number;
    placed: string;
}

const first = ["Siobhan", "Aoife", "Declan", "Niamh", "Cillian", "Saoirse", "Eoin", "Padraig", "Orla", "Fionn", "Caoimhe", "Tadhg", "Clodagh", "Connor"];
const last = ["Murphy", "Kelly", "Walsh", "Byrne", "McCarthy", "Ryan", "Doyle", "Fitzgerald", "Kavanagh", "Brennan", "Nolan", "Duffy", "MacNamara"];
const statuses: Array<Order["status"]> = ["Paid", "Paid", "Paid", "Pending", "Refunded", "Failed"];

// The same 2,000 orders on every load: a small seeded generator rather than Math.random.
function makeOrders(count: number): Order[] {
    let seed = 7;
    const next = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: count }, (_, index) => {
        const name = `${first[Math.floor(next() * first.length)]} ${last[Math.floor(next() * last.length)]}`;
        const day = new Date(Date.UTC(2026, 0, 1) + Math.floor(next() * 280) * 86400000);
        return {
            id: `ORD-${String(10000 + index)}`,
            customer: name,
            email: `${name.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z]+/g, ".")}@example.com`,
            status: statuses[Math.floor(next() * statuses.length)]!,
            items: 1 + Math.floor(next() * 8),
            total: Math.round(next() * 48000 + 900) / 100,
            placed: day.toISOString().slice(0, 10),
        };
    });
}

const orders = makeOrders(2000);
const tone = { Paid: "success", Pending: "warning", Refunded: "neutral", Failed: "danger" } as const;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const columns: Array<DataGridColumn<Order>> = [
    { key: "id", header: "Order", width: 120, sortable: true },
    { key: "customer", header: "Customer", width: 220, sortable: true, render: (order) => <User name={order.customer} size="sm" /> },
    { key: "email", header: "Email", width: 240 },
    { key: "status", header: "Status", width: 120, sortable: true, render: (order) => <Badge variant={tone[order.status]}>{order.status}</Badge> },
    { key: "items", header: "Items", width: 90, align: "end", sortable: true },
    { key: "total", header: "Total", width: 120, align: "end", sortable: true, render: (order) => money.format(order.total), filterValue: (order) => money.format(order.total) },
    { key: "placed", header: "Placed", width: 130, sortable: true },
];

/** Two thousand orders: search them, sort a column, drag a column's edge, and select with Shift-click for a run. */
export function Orders() {
    const [selected, setSelected] = useState<Key[]>([]);
    return (
        <DataGrid
            label="Orders"
            columns={columns}
            rows={orders}
            searchable
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={setSelected}
            defaultSort={{ key: "placed", direction: "descending" }}
            height={420}
            toolbar={
                <Button size="sm" disabled={!selected.length}>
                    Refund {selected.length || ""}
                </Button>
            }
        />
    );
}
Orders.layout = { fill: true, align: "start" as const };

const filtered = columns.map((column) => ({ ...column, filterable: column.key !== "items" }));

/** filterable puts a box under a column's header; each keeps only the rows whose value contains it. compact rows are 36px. */
export function ColumnFilters() {
    return <DataGrid label="Orders by column" columns={filtered} rows={orders} density="compact" height={360} defaultFilters={{ status: "pend" }} />;
}
ColumnFilters.layout = { fill: true, align: "start" as const };

/** columnWidths and onColumnWidthsChange keep the widths, to save them for next time. resizable: false fixes one. */
export function SavedWidths() {
    const [widths, setWidths] = useState<Record<string, number>>({ customer: 180, email: 200 });
    const fixed = columns.map((column) => (column.key === "id" ? { ...column, resizable: false } : column));
    return (
        <div style={{ display: "grid", gap: 8, width: "100%" }}>
            <DataGrid label="Orders with saved widths" columns={fixed} rows={orders.slice(0, 200)} columnWidths={widths} onColumnWidthsChange={setWidths} height={300} />
            <code style={{ fontSize: 12 }}>{JSON.stringify(widths)}</code>
        </div>
    );
}
SavedWidths.layout = { fill: true, align: "start" as const };
