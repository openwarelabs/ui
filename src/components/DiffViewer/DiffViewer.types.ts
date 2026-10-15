import type { HTMLAttributes } from "react";

export interface DiffViewerLabels {
    /** Read before each added line, which is otherwise only green with a "+".
     * @default "Added" */
    added?: string;
    /** Read before each removed line.
     * @default "Removed" */
    removed?: string;
    /** The header of the old line numbers' column, read by screen readers as they move through the table.
     * @default "Old line" */
    oldLine?: string;
    /** The header of the new line numbers' column.
     * @default "New line" */
    newLine?: string;
    /** The header of the lines' column in the unified view.
     * @default "Line" */
    line?: string;
    /** The header of the old version's column in the split view.
     * @default "Before" */
    before?: string;
    /** The header of the new version's column in the split view.
     * @default "After" */
    after?: string;
    /** Names the table with the counts that show as "+3 −1".
     * @default (added, removed) => `${added} lines added, ${removed} removed` */
    summary?(added: number, removed: number): string;
    /** The button that shows a collapsed run of unchanged lines.
     * @default (count) => `Show ${count} unchanged lines` */
    expand?(count: number): string;
    /** The copy button's label.
     * @default "Copy" */
    copy?: string;
    /** Shown when the two versions are the same.
     * @default "No changes" */
    noChanges?: string;
    /** Read between the old and new name of a renamed file, for the "→" between them.
     * @default "renamed to" */
    renamed?: string;
}

export interface DiffViewerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The text before the change. Pass it with `newValue`, and the diff is worked out line by line. */
    oldValue?: string;
    /** The text after the change. */
    newValue?: string;
    /** A unified diff instead, as `git diff` prints it: its hunks and `@@` headers, and one file or several. */
    patch?: string;
    /** `unified` shows the lines one above the other; `split` puts the old version beside the new one, and wraps long
     * lines so the two sides stay level.
     * @default "unified" */
    view?: "unified" | "split";
    /** Below this width (pixels) a split view shows unified, as there isn't room for two columns. 0 keeps it split.
     * @default 500 */
    splitMinWidth?: number;
    /** Shown on the right of the header, e.g. "tsx". */
    language?: string;
    /** The file's name in the header. With a `patch`, it's read from the patch unless you set it. */
    filename?: string;
    /** The name it had before, for a renamed file: shown as "old → new". */
    oldFilename?: string;
    /** How many unchanged lines show around each change. Longer runs of unchanged lines collapse to a button that
     * shows them. `Infinity` shows every line.
     * @default 3 */
    context?: number;
    /** Wraps long lines in the unified view instead of scrolling sideways. The split view always wraps.
     * @default false */
    wrap?: boolean;
    /** @default true */
    showLineNumbers?: boolean;
    /** Marks the words that changed within a changed line.
     * @default true */
    wordDiff?: boolean;
    /** Shows a copy button in the header. It copies `newValue`, or the file's part of the `patch`.
     * @default true */
    copyable?: boolean;
    /** Scrolls each file past this height (pixels). */
    maxHeight?: number;
    /** The words it uses, for other languages. */
    labels?: DiffViewerLabels;
}

/** A run of text within a changed line, and whether it's one of the words that changed. Internal. */
export interface DiffSegment {
    text: string;
    changed: boolean;
}

/** One line of a diff: unchanged, added, removed, or a patch's `@@` hunk header. Internal. */
export interface DiffLine {
    type: "same" | "add" | "del" | "hunk";
    text: string;
    /** Its number in the old version, if it's in it. */
    oldNo?: number;
    /** Its number in the new version, if it's in it. */
    newNo?: number;
    /** The words that changed, when it pairs with a line on the other side. */
    words?: DiffSegment[];
}

/** One file of a diff, worked out from two strings or read from a patch. Internal. */
export interface DiffFile {
    oldName?: string;
    newName?: string;
    lines: DiffLine[];
    /** What the copy button copies. */
    text: string;
}

/** What a diff shows, row by row: a line, a run of unchanged lines collapsed to a button (`gap` is the first one's
 * index), or in a split view a pair of lines side by side. Internal. */
export type DiffRow =
    | { kind: "line"; line: DiffLine; reveal?: number }
    | { kind: "gap"; gap: number; count: number }
    | { kind: "pair"; left?: DiffLine; right?: DiffLine; reveal?: number };

/** What each file's table is given. Internal. */
export interface DiffTableProps {
    file: DiffFile;
    split: boolean;
    context: number;
    wrap: boolean;
    showLineNumbers: boolean;
    copyable: boolean;
    language?: string;
    maxHeight?: number;
    labels: Required<DiffViewerLabels>;
}
