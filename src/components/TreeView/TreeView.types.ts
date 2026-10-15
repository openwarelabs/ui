import type { ReactNode } from "react";

/** One row of the tree, and the rows under it. */
export interface TreeItem {
    /** Unique in the whole tree: it's what `expanded` and `selected` hold. */
    id: string;
    /** The row's text. It names the row for screen readers and is what type-ahead matches. */
    label: string;
    /** A 16px icon before the label. */
    icon?: ReactNode;
    /** A muted line under the label. */
    description?: ReactNode;
    /** Muted content at the end of the row: a count, a badge, a status. Keep it non-interactive. */
    end?: ReactNode;
    /** It can be focused and opened, but not selected, checked or activated. */
    disabled?: boolean;
    /** The rows under this one. */
    children?: TreeItem[];
    /** It has children that `loadChildren` fetches the first time it opens. */
    hasChildren?: boolean;
}

export type TreeViewSelectionMode = "none" | "single" | "multiple";

export interface TreeViewLabels {
    /** The row shown while children load.
     * @default "Loading…" */
    loading?: string;
    /** The row shown when they couldn't load, before the retry text.
     * @default "Couldn't load." */
    error?: string;
    /** The retry text in that row; activating the row tries again.
     * @default "Retry" */
    retry?: string;
}

export interface TreeViewProps {
    /** The top-level rows. */
    items: TreeItem[];
    /** Names the tree for screen readers: "Categories", "Permissions". */
    label?: string;
    /** Names the tree by another element's id instead, such as a heading's. */
    "aria-labelledby"?: string;
    /** The ids of the open rows, when you control them. */
    expanded?: string[];
    /** The ids open at first when uncontrolled.
     * @default [] */
    defaultExpanded?: string[];
    /** Called with the open ids when a row opens or closes. */
    onExpandedChange?(expanded: string[]): void;
    /** `single` selects one row; `multiple` any number (Shift extends a range); `none` makes rows only activate.
     * @default "single" */
    selectionMode?: TreeViewSelectionMode;
    /** The selected (or checked) ids, when you control them. */
    selected?: string[];
    /** The ids selected at first when uncontrolled.
     * @default [] */
    defaultSelected?: string[];
    /** Called with the selected (or checked) ids, in the tree's order. */
    onSelectedChange?(selected: string[]): void;
    /** Shows a checkbox on each row for picking several. Checking a row checks the loaded rows under it, and a row whose
     * rows are partly checked shows a dash. `selected` then holds every fully checked id. Implies multiple selection.
     * @default false */
    checkboxes?: boolean;
    /** Fetches a row's children the first time it opens, for rows with `hasChildren`. A loading row shows meanwhile,
     * and if it rejects, a row to retry. */
    loadChildren?(item: TreeItem): Promise<TreeItem[]>;
    /** Called when a row is activated: Enter, a double-click, or a click when `selectionMode` is `none`. */
    onAction?(item: TreeItem): void;
    /** Draws each row's label instead of the plain text, e.g. to highlight a search match. */
    renderLabel?(item: TreeItem): ReactNode;
    /** The words it shows, for other languages. */
    labels?: TreeViewLabels;
    className?: string;
}

/** A row's checkbox: checked, not, or partly (some of the rows under it). Internal. */
export type TreeViewChecked = boolean | "mixed";

/** A visible row: an item, or the loading or error row under an item whose children are being fetched. Internal. */
export interface TreeViewRow {
    id: string;
    item?: TreeItem;
    status?: "loading" | "error";
    parent?: TreeViewRow;
    /** Its place in the visible rows. */
    index: number;
    level: number;
    pos: number;
    size: number;
    expandable: boolean;
    open: boolean;
    kids: TreeViewRow[];
}
