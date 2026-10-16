import type { HTMLAttributes, JSX } from "react";

/** Where the text is cut. */
export type TruncatePosition = "end" | "middle" | "start";

export interface TruncateProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** The full text, as a string so it can be measured and split. */
    children: string;
    /** Where to cut: `end` keeps the start, `middle` keeps the start and the end (file names, hashes), `start` keeps
     * the end (paths). Only `end` can span several `lines`.
     * @default "end" */
    position?: TruncatePosition;
    /** How many lines to show before cutting, with `position="end"`.
     * @default 1 */
    lines?: number;
    /** Show the full text in a Tooltip when the text is cut. Nothing shows when it fits.
     * @default true */
    tooltip?: boolean;
    /** With `middle`: how many characters to keep at the end, such as the length of a file extension. Left out, the
     * start and the end share the room evenly. */
    tail?: number;
    /** What marks the cut.
     * @default "…" */
    ellipsis?: string;
    /** The element.
     * @default "span" */
    as?: keyof JSX.IntrinsicElements;
}

/** What's on screen: the text shown, and whether it's cut. */
export interface TruncateState {
    text: string;
    cut: boolean;
}
