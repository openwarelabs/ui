import type { ReactNode } from "react";

/**
 * How tall the sheet is at one snap point: pixels as a number, a percentage of the screen as a string ("60%"), or
 * `"content"` for as tall as what's in it (at most 90% of the screen).
 */
export type BottomSheetSnapPoint = number | string;

export interface BottomSheetLabels {
    /** The grab handle's name for screen readers.
     * @default "Resize sheet" */
    handle?: string;
    /** Read out when the sheet moves to another snap point.
     * @default (index, total, percent) => `Sheet height ${index + 1} of ${total}, ${percent}% of the screen.` */
    snapChanged?(index: number, total: number, percent: number): string;
}

export interface BottomSheetProps {
    open: boolean;
    /** Called on Escape, a swipe down past the lowest snap point, the backdrop or the ✕, unless `dismissible` is
     * false. Set `open` to false here. */
    onClose(): void;
    title: ReactNode;
    /** A muted line under the title. */
    description?: ReactNode;
    children?: ReactNode;
    /** Buttons pinned to the bottom: Cancel first, the main action last. */
    footer?: ReactNode;
    /** The heights the sheet rests at, lowest first: pixels, percentages of the screen, or `"content"`.
     * @default ["content"] */
    snapPoints?: BottomSheetSnapPoint[];
    /** The snap point it opens at, as an index into `snapPoints`, when the parent doesn't control it.
     * @default 0 */
    defaultSnap?: number;
    /** The active snap point, as an index into `snapPoints`, when the parent controls it. */
    snap?: number;
    /** Called with the new index when a drag, a flick or the arrow keys move it to another snap point. */
    onSnapChange?(snap: number): void;
    /** Whether Escape, the backdrop and a swipe down close it.
     * @default true */
    dismissible?: boolean;
    /** A modal sheet has a backdrop and keeps focus inside; `false` is a sheet over the page that leaves the rest
     * of it usable.
     * @default true */
    modal?: boolean;
    /** The grab handle bar at the top. The header drags the sheet either way.
     * @default true */
    handle?: boolean;
    /** Words for screen readers, to translate them. */
    labels?: BottomSheetLabels;
    className?: string;
}
