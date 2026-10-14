import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from "react";

import { cx } from "../../utils/cx";

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

/**
 * Styles content you don't write element by element: Markdown rendered to HTML, a CMS body, an agent's answer. It sets
 * the plain elements inside it (headings, paragraphs, lists, quotes, code, tables, images, details) in Openware's type
 * and colours, and leaves Openware components inside it as they are.
 */
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose({ size = "md", fullWidth = false, as = "div", className, children, ...props }, ref) {
    const Element = as as "div";
    return (
        <Element
            ref={ref as Ref<HTMLDivElement>}
            className={cx("ow-prose", `ow-prose--${size}`, size === "md" ? "ow-type-prose" : "ow-type-copy", fullWidth && "ow-prose--full", className)}
            {...props}
        >
            {children}
        </Element>
    );
});
