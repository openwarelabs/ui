import type { Key, ReactNode } from "react";

export interface DataGridColumn<Row> {
    /** Unique; also the row field shown when there's no `render`. */
    key: string;
    header: ReactNode;
    /** Names the column where the header can't: in "Filter Name" and "Resize Name column". Defaults to `header`
     * when it's text, else `key`. */
    label?: string;
    /** Numbers and amounts go at the end, so their digits line up.
     * @default "start" */
    align?: "start" | "center" | "end";
    /** Its width at first, in pixels.
     * @default 160 */
    width?: number;
    /** How narrow resizing can make it.
     * @default 64 */
    minWidth?: number;
    /** How wide resizing can make it.
     * @default 800 */
    maxWidth?: number;
    /** Lets the person drag its edge, or use the arrow keys on it, to change its width.
     * @default true */
    resizable?: boolean;
    /** Lets the person sort by this column. */
    sortable?: boolean;
    /** Adds a box under the header that keeps only the rows whose value contains the text typed. */
    filterable?: boolean;
    /** What the cell shows. Defaults to the row's field named by `key`. */
    render?(row: Row): ReactNode;
    /** The value sorted by, when it isn't the field itself. */
    sortValue?(row: Row): string | number;
    /** The text searched by the column's filter and the search box, when it isn't the field itself. */
    filterValue?(row: Row): string;
}

export interface DataGridSort {
    key: string;
    direction: "ascending" | "descending";
}

export interface DataGridLabels {
    /** The count above the grid.
     * @default (shown, total) => shown === total ? `${total} rows` : `${shown} of ${total} rows` */
    rows?(shown: number, total: number): string;
    /** Added to the count while rows are selected.
     * @default (count) => `${count} selected` */
    selected?(count: number): string;
    /** The search box's name and placeholder.
     * @default "Search rows" */
    search?: string;
    /** A column's filter box.
     * @default (column) => `Filter ${column}` */
    filter?(column: string): string;
    /** The placeholder in each filter box.
     * @default "Filter" */
    filterPlaceholder?: string;
    /** A column's resize handle.
     * @default (column) => `Resize ${column} column` */
    resize?(column: string): string;
    /** The checkbox that selects every row shown.
     * @default "Select all rows" */
    selectAll?: string;
    /** A row's checkbox.
     * @default (row) => `Select ${row}` */
    selectRow?(row: string): string;
}

export interface DataGridProps<Row> {
    columns: Array<DataGridColumn<Row>>;
    rows: Row[];
    /** A field name or function giving each row a unique key.
     * @default "id" */
    rowKey?: keyof Row | ((row: Row) => Key);
    /** Names the grid for screen readers: "Orders". */
    label: string;
    sort?: DataGridSort;
    defaultSort?: DataGridSort;
    onSortChange?(sort: DataGridSort): void;
    /** Sort the rows yourself (e.g. on a server) and only show the arrows.
     * @default false */
    manualSort?: boolean;
    /** Adds a search box above the grid that keeps the rows where any column contains the text.
     * @default false */
    searchable?: boolean;
    /** The search text, when you control it. */
    search?: string;
    /** @default "" */
    defaultSearch?: string;
    onSearchChange?(search: string): void;
    /** The text in each column's filter box, by column key, when you control them. */
    filters?: Record<string, string>;
    /** @default {} */
    defaultFilters?: Record<string, string>;
    onFiltersChange?(filters: Record<string, string>): void;
    /** Filter the rows yourself (e.g. on a server): the boxes still show and call back, but every row is shown.
     * @default false */
    manualFilter?: boolean;
    /** Column widths in pixels, by column key, when you control them (to save them, say). */
    columnWidths?: Record<string, number>;
    defaultColumnWidths?: Record<string, number>;
    onColumnWidthsChange?(widths: Record<string, number>): void;
    /** Adds a checkbox column. Shift-click a checkbox to select the rows between it and the last one clicked.
     * @default "none" */
    selectionMode?: "none" | "multiple";
    selectedKeys?: Key[];
    defaultSelectedKeys?: Key[];
    onSelectionChange?(keys: Key[]): void;
    /** Names a row for its checkbox, read out as "Select …". Defaults to the first column's value when it's text or
     * a number, else "row 3". */
    rowLabel?(row: Row): string;
    /** The grid's height; rows scroll within it, and only those in view are rendered.
     * @default 480 */
    height?: number | string;
    /** `compact` rows are 36px; `comfortable` 44px. Cells hold one line, and cut off what doesn't fit with "…".
     * @default "comfortable" */
    density?: "compact" | "comfortable";
    /** More controls at the end of the bar above the grid, such as an export button. */
    toolbar?: ReactNode;
    /** Shown in place of the rows when there are none, or none match. */
    emptyContent?: ReactNode;
    /** The words it uses, for other languages. */
    labels?: DataGridLabels;
    className?: string;
}
