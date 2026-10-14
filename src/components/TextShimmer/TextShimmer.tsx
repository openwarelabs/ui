import type { CSSProperties, JSX, ReactNode } from "react";

import { cx } from "../../utils/cx";

export interface TextShimmerProps {
    /** The words that shimmer, usually a status ending in an ellipsis: "Thinking…", "Running tests…". */
    children: ReactNode;
    /** The element, so it can sit in a heading or a paragraph.
     * @default "span" */
    as?: keyof JSX.IntrinsicElements;
    /** Seconds for the highlight to cross the text once.
     * @default 2 */
    duration?: number;
    /** Stops the shimmer and shows the text plainly, e.g. once the step has finished.
     * @default true */
    active?: boolean;
    className?: string;
}

/**
 * Text with a highlight sweeping across it, for work in progress: "Thinking…", "Searching the codebase…". It's plain
 * text to screen readers, and stands still when the person prefers reduced motion.
 */
export function TextShimmer({ children, as = "span", duration = 2, active = true, className }: TextShimmerProps) {
    const Element = as as "span";
    return (
        <Element
            className={cx("ow-shimmer", active && "ow-shimmer--active", className)}
            style={active ? ({ "--ow-shimmer-duration": `${duration}s` } as CSSProperties) : undefined}
        >
            {children}
        </Element>
    );
}
