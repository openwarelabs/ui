import type { HTMLAttributes, ReactNode } from "react";

import type { TableColumn, TableProps } from "@openwarelabs/ui";

/** A filter the toolbar can add: a menu section of values, and a Tag once one is picked. */
export interface Empty02Filter<Row extends object> {
    /** Tells the filters apart, in `defaultFilters` and `onFiltersChange`. */
    key: string;
    /** Its name, as the menu's heading and on the Tag ("Status: Failed"). */
    label: string;
    /** The values to pick from. */
    options: string[];
    /** The row's value for this filter. */
    value(row: Row): string;
}

/** What's being looked for, given to the empty state's words. */
export interface Empty02Search {
    /** The search, trimmed. Empty when there's none. */
    query: string;
    /** The value picked for each filter that's on, by its key. */
    filters: Record<string, string>;
}

/** The words that aren't content, in English unless you pass your own. */
export interface Empty02Labels {
    /** The search field's name and placeholder. @default "Search" */
    search?: string;
    /** The filters' name for screen readers. @default "Filters" */
    filters?: string;
    /** The filter menu's name. @default "Add a filter" */
    filterMenu?: string;
    /** The filter button with no filter on. @default "Add filter" */
    addFilter?: string;
    /** The filter button once one is on. @default "Filter" */
    filter?: string;
    /** A Tag's remove button. @default (label, value) => `${label.toLowerCase()} filter: ${value}` */
    removeFilter?(label: string, value: string): string;
    /** The count beside the filters. @default (shown, total) => `${shown} of ${total}` */
    count?(shown: number, total: number): ReactNode;
    /** @default "Clear search" */
    clearSearch?: string;
    /** @default "Clear filters" */
    clearFilters?: string;
}

export interface Empty02Props<Row extends object> extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The page's heading, and the table's caption for screen readers: "Deploys". */
    title: ReactNode;
    /** A sentence under it. */
    description?: ReactNode;
    /** The table's columns. */
    columns: Array<TableColumn<Row>>;
    /** Every row; the search and the filters narrow them. */
    rows: Row[];
    /** A field name or function giving each row a unique key.
     * @default "id" */
    rowKey?: TableProps<Row>["rowKey"];
    /** The text a row is found by. Every word of the search has to be in it. */
    searchText(row: Row): string;
    /** The filters the toolbar can add. */
    filters?: Array<Empty02Filter<Row>>;
    /** The search to start with. */
    defaultQuery?: string;
    /** The filters on to start with: a value for each filter's key. */
    defaultFilters?: Record<string, string>;
    /** Runs as the search changes. */
    onQueryChange?(query: string): void;
    /** Runs as filters are added and removed. */
    onFiltersChange?(filters: Record<string, string>): void;
    /** The empty state's title when nothing matches.
     * @default `No results match “${query}”`, or "No results match these filters" */
    emptyTitle?(search: Empty02Search): ReactNode;
    /** The empty state's sentence when nothing matches: where you looked, and what to try. */
    emptyDescription?(search: Empty02Search): ReactNode;
    labels?: Empty02Labels;
}
