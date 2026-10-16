import type { ElementType, HTMLAttributes, ReactNode } from "react";

import type { UseFocusTrapOptions } from "@/hooks/useFocusTrap";

export interface FocusTrapProps extends UseFocusTrapOptions, HTMLAttributes<HTMLElement> {
    /** What focus stays inside. */
    children: ReactNode;
    /** The element to render, such as `section` or `aside`. It gets `tabIndex={-1}` so it can take focus itself. @default "div" */
    as?: ElementType;
    /**
     * Renders no element of its own: the single child is the container and must take a `ref`. The focus options
     * apply to it. @default false
     */
    asChild?: boolean;
}
