import { cx } from "@/utils/cx";
import type { ContainerProps } from "./Container.types";
export type { ContainerProps, ContainerSize } from "./Container.types";

/**
 * Centres content at a set width with the page's side margins: 32px, and the phone gutter under 760px. Every block
 * lines its content up the same way, so whatever sits in a Container lines up with the blocks above and below it.
 */
export function Container({ size = "page", as: Element = "div", className, ...props }: ContainerProps) {
    return <Element className={cx("ow-container", `ow-container--${size}`, className)} {...props} />;
}
