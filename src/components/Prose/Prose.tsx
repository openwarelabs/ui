import { forwardRef, useEffect, useRef } from "react";

import { cx } from "@/utils/cx";
import type { ProseProps } from "./Prose.types";
export type { ProseProps } from "./Prose.types";

/**
 * Styles content you don't write element by element: Markdown rendered to HTML, a CMS body, an agent's answer. It sets
 * the plain elements inside it (headings, paragraphs, lists, quotes, code, tables, images, details) in Openware's type
 * and colours, and leaves Openware components inside it as they are.
 */
export const Prose = forwardRef<HTMLElement, ProseProps>(function Prose({ size = "md", fullWidth = false, as = "div", className, children, ...props }, ref) {
    const Element = as as "div";
    const root = useRef<HTMLElement | null>(null);

    // Content Prose styles comes as plain HTML, so it fixes two things such HTML can't say for itself, after each render:
    // a code block or table that scrolls sideways can be reached by keyboard to scroll it, and a Markdown task-list
    // checkbox (an <input> at the start of a list item, with no label) is named by its item's text.
    useEffect(() => {
        const element = root.current;
        if (!element) return;
        for (const scroller of element.querySelectorAll<HTMLElement>("pre, .ow-table-wrap")) {
            if (scroller.scrollWidth > scroller.clientWidth && !scroller.hasAttribute("tabindex")) scroller.tabIndex = 0;
        }
        for (const box of element.querySelectorAll<HTMLInputElement>('li > input[type="checkbox"], li > p > input[type="checkbox"]')) {
            if (box.labels?.length || box.hasAttribute("aria-label") || box.hasAttribute("aria-labelledby")) continue;
            const text = box.closest("li")?.textContent?.trim();
            if (text) box.setAttribute("aria-label", text);
        }
    });

    return (
        <Element
            ref={(node: HTMLDivElement | null) => {
                root.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
            }}
            className={cx("ow-prose", `ow-prose--${size}`, size === "md" ? "ow-type-prose" : "ow-type-copy", fullWidth && "ow-prose--full", className)}
            {...props}
        >
            {children}
        </Element>
    );
});
