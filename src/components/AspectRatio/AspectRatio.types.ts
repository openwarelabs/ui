import type { ElementType, HTMLAttributes } from "react";

export interface AspectRatioProps extends HTMLAttributes<HTMLElement> {
    /** Width over height, such as `16 / 9`, `4 / 3` or `1` for a square. The box is as wide as its container. @default 16 / 9 */
    ratio?: number;
    /** The element to render, such as `figure` or `span`. @default "div" */
    as?: ElementType;
}
