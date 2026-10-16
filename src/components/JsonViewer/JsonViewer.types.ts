/** A value JSON can hold. */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** A node's path as `copyPath` writes it: a key per object, an index per array. */
export type JsonPathSegment = string | number;

export interface JsonViewerLabels {
    /** The search box's name and placeholder.
     * @default "Search keys and values" */
    search?: string;
    /** The count beside the search box.
     * @default (count) => count === 1 ? "1 match" : `${count} matches` */
    matches?(count: number): string;
    /** The count when nothing matches.
     * @default "No matches" */
    noMatches?: string;
    /** The button that copies the whole document.
     * @default "Copy JSON" */
    copy?: string;
    /** Read out, and shown on the copy button, after copying.
     * @default "Copied" */
    copied?: string;
    /** A row's button that copies its value as JSON.
     * @default (path) => `Copy value at ${path}` */
    copyValue?(path: string): string;
    /** A row's button that copies its path.
     * @default (path) => `Copy path ${path}` */
    copyPath?(path: string): string;
    /** Read out after a row's value was copied.
     * @default "Value copied" */
    valueCopied?: string;
    /** Read out after a row's path was copied.
     * @default "Path copied" */
    pathCopied?: string;
    /** The toggle at the end of a truncated string.
     * @default "more" */
    more?: string;
    /** The toggle at the end of a string shown in full.
     * @default "less" */
    less?: string;
    /** Shown before the error when a JSON string can't be parsed.
     * @default "Couldn't parse this JSON." */
    parseError?: string;
    /** Names the tree for screen readers.
     * @default "JSON" */
    tree?: string;
}

export interface JsonViewerProps {
    /** Any JSON value: an object, an array, a string, a number, a boolean or null. A string is parsed as JSON text, and
     * shows its parse error in place when it isn't valid. */
    data: unknown;
    /** Which rows start open: `true` for every one, a number for that many levels (1 opens the root, 2 its children
     * too), `false` for none.
     * @default 1 */
    defaultExpanded?: boolean | number;
    /** The paths of the open rows, when you control them, as `copyPath` writes them (`""` is the root, then `a`,
     * `a.b[2]`). */
    expanded?: string[];
    /** Called with the open paths when a row opens or closes. */
    onExpandedChange?(expanded: string[]): void;
    /** Adds a search box above the tree. Rows whose key or value contains the text stay, with the match highlighted,
     * and the rows above them open; the rest hide.
     * @default false */
    searchable?: boolean;
    /** A button that copies the whole document, and on each row (when the pointer rests on it or it's focused) buttons
     * that copy its value as JSON and its path.
     * @default true */
    copyable?: boolean;
    /** A name for the root row, such as the variable it came from. Without one the root shows only its bracket. */
    rootName?: string;
    /** Strings longer than this many characters are cut, with a toggle that shows the rest. */
    maxStringLength?: number;
    /** Shows an object's keys in alphabetical order.
     * @default false */
    sortKeys?: boolean;
    /** Shows a muted type name after each value: `string`, `number`, `object (3)`.
     * @default false */
    showTypes?: boolean;
    /** Shows how many keys or items a closed row holds, `{3}` or `[12]`, rather than `{…}` or `[…]`.
     * @default true */
    showCounts?: boolean;
    /** How far each level is indented, in pixels.
     * @default 20 */
    indent?: number;
    /** Called with a row's path and value when it's clicked or Enter is pressed on it. */
    onSelect?(path: string, value: unknown): void;
    /** A fixed height in pixels (or any CSS length); the tree scrolls inside it. */
    height?: number | string;
    /** Scrolls past this height. */
    maxHeight?: number | string;
    /** Names the tree for screen readers, e.g. "Response body". Also set through `labels.tree`. */
    label?: string;
    /** The words it shows, for other languages. */
    labels?: JsonViewerLabels;
    className?: string;
}

/** What kind of value a row holds. Internal. */
export type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null" | "other";

/** A row of the tree, visible or not. Internal. */
export interface JsonViewerNode {
    /** The row's path, as `copyPath` writes it. */
    path: string;
    segments: JsonPathSegment[];
    /** Its key in the parent object, or index in the parent array; none for the root. */
    key?: JsonPathSegment;
    value: unknown;
    type: JsonValueType;
    parent?: JsonViewerNode;
    level: number;
    /** Its position among its siblings, from 1, and how many there are. */
    pos: number;
    size: number;
    /** How many keys or items an object or array holds. */
    count: number;
    /** It holds something and can open. */
    expandable: boolean;
    /** Its key or value contains the search text. */
    matched: boolean;
    /** It or a row under it matched. */
    hasMatch: boolean;
    children: JsonViewerNode[];
}

/** A visible row: a node and whether it's open. Internal. */
export interface JsonViewerRow {
    node: JsonViewerNode;
    /** Its place in the visible rows. */
    index: number;
    open: boolean;
    parent?: JsonViewerRow;
}
