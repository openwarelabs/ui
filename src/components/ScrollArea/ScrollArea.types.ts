import type { HTMLAttributes, ReactNode, Ref } from "react";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

export type ScrollAreaType = "hover" | "always" | "scroll";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
    /** Which way it scrolls. The native scrollbar for that axis is hidden and a thin thumb drawn in its place.
     * @default "vertical" */
    orientation?: ScrollAreaOrientation;
    /** When the thumbs show: `hover` while the pointer is over the area or it's scrolling, `scroll` only while it's scrolling,
     * `always` all the time there's something to scroll.
     * @default "hover" */
    type?: ScrollAreaType;
    /** How long after the last scroll the thumbs stay, in milliseconds.
     * @default 600 */
    scrollHideDelay?: number;
    /** The viewport's height; the content scrolls past it. A number is pixels. */
    height?: number | string;
    /** The viewport's largest height; it grows with its content up to this. A number is pixels. */
    maxHeight?: number | string;
    /** Names the viewport, which becomes a region (role="region") so screen readers can find it. */
    "aria-label"?: string;
    /** The scrolling element, to scroll it from code: `viewportRef.current?.scrollTo(…)`. */
    viewportRef?: Ref<HTMLDivElement>;
    children: ReactNode;
}
