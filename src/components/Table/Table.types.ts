import type { Key, ReactNode } from "react";

export interface TableColumn<Row> {
    /** Unique; also the row field shown when there's no `render`. */
    key: string;
    header: ReactNode;
    /** Numbers and amounts go at the end, so their digits line up.
     * @default "start" */
    align?: "start" | "center" | "end";
    /** A CSS width, e.g. 120 or "30%". */
    width?: number | string;
    /** Lets the person sort by this column. */
    sortable?: boolean;
    /** What the cell shows. Defaults to the row's field named by `key`. */
    render?(row: Row): ReactNode;
    /** The value sorted by, when it isn't the field itself. */
    sortValue?(row: Row): string | number;
}

export interface TableSort {
    key: string;
    direction: "ascending" | "descending";
}

export interface TableProps<Row> {
    columns: Array<TableColumn<Row>>;
    rows: Row[];
    /** A field name or function giving each row a unique key.
     * @default "id" */
    rowKey?: keyof Row | ((row: Row) => Key);
    /** Describes the table for screen readers; shown above it unless `hideCaption`. */
    caption?: ReactNode;
    /** @default false */
    hideCaption?: boolean;
    sort?: TableSort;
    defaultSort?: TableSort;
    onSortChange?(sort: TableSort): void;
    /** Sort the rows yourself (e.g. on a server) and only show the arrows.
     * @default false */
    manualSort?: boolean;
    /** Adds a checkbox column.
     * @default "none" */
    selectionMode?: "none" | "multiple";
    selectedKeys?: Key[];
    defaultSelectedKeys?: Key[];
    onSelectionChange?(keys: Key[]): void;
    /**
     * Names a row for its checkbox, read out as "Select …": the person, the file, the project. Defaults to the
     * first column's value when it's text or a number, else "row 3".
     */
    rowLabel?(row: Row): string;
    /** Shown in place of the rows when there are none, such as an EmptyState. */
    emptyContent?: ReactNode;
    /**
     * `inset` sets the rows on a raised panel inside a tinted tray, with the header in the tray above them; `plain` is
     * one bordered card with a shaded header row.
     * @default "inset"
     */
    variant?: "inset" | "plain";
    /** `compact` rows are 36px; `comfortable` 44px.
     * @default "comfortable" */
    density?: "compact" | "comfortable";
    /** Keeps the header in view while the table scrolls; use with maxHeight. */
    stickyHeader?: boolean;
    maxHeight?: number | string;
    className?: string;
}
