import type { ReactNode, RefObject } from "react";

/** One entry in a table of contents: a heading with an id, and the headings under it. */
export interface TocItem {
    /** The id of the heading it links to (`href="#id"`). */
    id: string;
    /** The text shown for it. */
    title: ReactNode;
    /** The heading level, 2 for an h2. Only `maxLevel` reads it; the indent comes from nesting.
     * @default the parent's level plus one, 2 at the top */
    level?: number;
    /** The headings under this one. */
    children?: TocItem[];
}

export interface TableOfContentsProps {
    /** The entries, given explicitly. Without it, the headings are read from `contentRef`. */
    items?: TocItem[];
    /** The element whose headings make the list. Headings without an id are skipped. */
    contentRef?: RefObject<HTMLElement | null>;
    /** Which headings to read from `contentRef`.
     * @default "h2, h3" */
    selector?: string;
    /** The element that scrolls, when it isn't the window. */
    container?: RefObject<HTMLElement | null>;
    /** The id of the current heading, to control it. */
    activeId?: string;
    /** Called with the id of the heading nearest the top as it changes, and when a link is clicked. */
    onActiveChange?: (id: string) => void;
    /** A short heading above the links. Pass `null` for none.
     * @default "On this page" */
    title?: ReactNode;
    /** How far below the scroller's top, in pixels, a heading counts as current: the height of a sticky header.
     * @default 80 */
    offset?: number;
    /** Scrolls smoothly to a clicked heading, unless the person prefers reduced motion.
     * @default true */
    smooth?: boolean;
    /** Leaves out headings deeper than this level, 3 to show h2 and h3. */
    maxLevel?: number;
    /** Shows a heading's children only while it, or one of them, is current.
     * @default false */
    collapsible?: boolean;
    className?: string;
    /** Names the navigation for screen readers.
     * @default "Table of contents" */
    "aria-label"?: string;
}
