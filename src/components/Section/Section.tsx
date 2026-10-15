import { Container } from "@/components/Container/Container";
import { cx } from "@/utils/cx";
import type { SectionProps } from "./Section.types";
export type { SectionProps } from "./Section.types";

/**
 * A full-width band of a page, with the blocks' space above and below and their width and side margins inside (a
 * Container). Your own sections then sit in line with the blocks around them.
 */
export function Section({ tone = "paper", spacing = "md", size = "page", as: Element = "section", className, children, ...props }: SectionProps) {
    return (
        <Element className={cx("ow-section", `ow-section--${tone}`, `ow-section--space-${spacing}`, className)} {...props}>
            {size === false ? children : <Container size={size}>{children}</Container>}
        </Element>
    );
}
