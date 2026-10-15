import type { CSSProperties, Key, ReactNode } from "react";

import type { ScrollToIndexOptions } from "./useVirtualizer";

export interface VirtualListLabels {
    /** Announced to screen readers while more rows load.
     * @default "Loading more" */
    loading?: string;
}

export interface VirtualListProps<T = unknown> {
    /** The rows' data. Leave it out and pass `count` to render rows from their index alone. */
    items?: readonly T[];
    /** How many rows there are.
     * @default items.length */
    count?: number;
    /** Renders one row. With `count` alone, `item` is undefined: use the index. */
    renderItem(item: T, index: number): ReactNode;
    /** A stable key for each row, such as its id. Give one when rows can be added at the top (older messages), so
     * the view stays where it was, and so measured heights follow their row.
     * @default (item, index) => index */
    getKey?(item: T, index: number): Key;
    /** Every row's height in pixels, when they're all the same. The fastest: nothing is measured. */
    itemSize?: number;
    /** A guess at a row's height in pixels when they vary. Each row is measured once it renders, and replaces the
     * guess without the view jumping; the closer the guess, the steadier the scrollbar.
     * @default 48 */
    estimateSize?: number | ((index: number) => number);
    /** How many rows to render beyond each edge of the view, so fast scrolling doesn't show blank space.
     * @default 4 */
    overscan?: number;
    /** Space between rows, in pixels.
     * @default 0 */
    gap?: number;
    /** The list's height. Without `height` or `maxHeight`, it fills its parent, which needs a height. */
    height?: number | string;
    /** Lets the list grow with its rows up to this height, then scroll. */
    maxHeight?: number | string;
    /** Called when the reader scrolls near the end, to load more rows. Called once per number of rows, and not
     * while `loading` or once `hasMore` is false. */
    onEndReached?(): void;
    /** Called when the reader scrolls near the start, to load older rows (a chat's history). Rows added at the top
     * keep the view where it was, as long as `getKey` gives real keys. */
    onStartReached?(): void;
    /** How close to either end, in pixels, calls `onEndReached` or `onStartReached`.
     * @default 200 */
    endReachedThreshold?: number;
    /** Shows a spinner after the last row and tells screen readers more is loading.
     * @default false */
    loading?: boolean;
    /** Whether there are more rows to load at the end; false stops `onEndReached`.
     * @default true */
    hasMore?: boolean;
    /** Opens at the end and keeps the newest row in view as rows are added or grow, while the reader is at the end:
     * for logs and chats. Scrolling up to read stops it; scrolling back down starts it again.
     * @default false */
    followOutput?: boolean;
    /** `list` for a list of rows. `feed` for an endless stream of articles people read one by one (posts, news):
     * each row is a focusable article, and Page Down and Page Up move between them.
     * @default "list" */
    role?: "list" | "feed";
    /** Names the list for screen readers. */
    label?: string;
    /** The id of a visible heading that names the list, in place of `label`. */
    "aria-labelledby"?: string;
    /** Shown in place of the rows when there are none and nothing is loading. */
    empty?: ReactNode;
    /** The words it uses, for other languages. */
    labels?: VirtualListLabels;
    /** A class for each row's wrapper. */
    itemClassName?: string;
    id?: string;
    className?: string;
    style?: CSSProperties;
}

export interface VirtualListHandle {
    /** Scrolls a row into view, rendering it first. `behavior: "smooth"` animates, except under reduced motion. */
    scrollToIndex(index: number, options?: ScrollToIndexOptions): void;
    /** Scrolls to the last row, and follows new rows again with `followOutput`. */
    scrollToEnd(options?: Pick<ScrollToIndexOptions, "behavior">): void;
    /** The element that scrolls. */
    readonly element: HTMLDivElement | null;
}
