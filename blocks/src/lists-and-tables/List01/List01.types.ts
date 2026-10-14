import type { HTMLAttributes, ReactNode } from "react";

import type { SelectOption, TableSort } from "@openwarelabs/ui";

import type { BlockButton, BlockTableColumn } from "@blocks/shared/shared.types";

/** A filter over the table: a select of choices, each matching the rows whose value is that choice. */
export interface List01Filter<Row> {
    /** Unique among the filters. */
    id: string;
    /** The select's name for screen readers: "Status". */
    label: string;
    /** The first choice, which shows every row: "Any status". */
    allLabel: string;
    /** The other choices. A row matches one when `value(row)` is its value. */
    options: SelectOption[];
    /** The row's value for this filter. */
    value(row: Row): string;
}

export interface List01Labels {
    /** The search field's placeholder. @default "Search" */
    searchPlaceholder?: string;
    /** The search field's name for screen readers. @default "Search" */
    search?: string;
    /** Describes the table for screen readers. @default the title, when it's text */
    caption?: string;
    /** The count at the end of the toolbar. @default "24 rows", or "3 of 24 rows" while searching or filtering */
    count?(shown: number, total: number): ReactNode;
    /** Names the page buttons for screen readers. @default "Pages" */
    pages?: string;
    /** The empty state's title when nothing matches. @default "Nothing matches" */
    emptyTitle?: string;
    /** The line under it, given what was searched for (empty when only filters are on). @default "Nothing matches “…” with these filters." */
    emptyDescription?(query: string): ReactNode;
    /** The button that clears the search and the filters. @default "Clear search and filters" */
    clearAll?: string;
}

export interface List01Props<Row extends object> extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The one primary action, beside the title: "Deploy a branch". */
    primaryAction?: BlockButton;
    /** The table's columns. Sortable ones sort the whole list, before it's split into pages. */
    columns: Array<BlockTableColumn<Row>>;
    /** Every row; the component searches, filters, sorts and pages them. */
    rows: Row[];
    /** A field name or function giving each row a unique key. @default "id" */
    rowKey?: keyof Row | ((row: Row) => string | number);
    /** The words in a row that the search matches. Without it there's no search field. */
    searchText?(row: Row): string[];
    /** Selects after the search field, each narrowing the rows. */
    filters?: Array<List01Filter<Row>>;
    /** The order to start with. */
    defaultSort?: TableSort;
    /** Rows on a page. @default 8 */
    pageSize?: number;
    /** A 20px icon for the empty state, usually from lucide-react. @default a search glass with a cross */
    emptyIcon?: ReactNode;
    /** Words that aren't content (names for screen readers, the count, the empty state), in English unless you pass your own. */
    labels?: List01Labels;
}
