import type { HTMLAttributes, ReactNode } from "react";

export interface ProseProps extends HTMLAttributes<HTMLElement> {
    /** sm sets 14px interface text with a tight rhythm and modest headings, for chat answers and comments. md sets the prose
     * style (16.5px, 1.7 leading) with headings from the type scale, for articles and docs.
     * @default "md" */
    size?: "sm" | "md";
    /** Drops the readable width (about 68 characters a line at md) so the text runs the full width of its container. sm has no
     * maximum width to drop.
     * @default false */
    fullWidth?: boolean;
    /** The element: article for a post, section for part of a page.
     * @default "div" */
    as?: "div" | "article" | "section" | "main" | "aside";
    /** Plain HTML elements to style: what a Markdown renderer, a CMS or a server gives back. */
    children?: ReactNode;
}
