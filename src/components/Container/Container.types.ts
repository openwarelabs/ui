import type { ElementType, HTMLAttributes } from "react";

export type ContainerSize = "narrow" | "page" | "wide" | "full";

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
    /**
     * How wide the content can get: `page` is the blocks' width (1200px), `narrow` a reading width for an article or
     * a form (720px), `wide` room for a dashboard or a big table (1440px), `full` no cap, only the side margins.
     * @default "page"
     */
    size?: ContainerSize;
    /** The element to render, such as `main` or `section`. @default "div" */
    as?: ElementType;
}
