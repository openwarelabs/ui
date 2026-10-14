import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockLink } from "@blocks/shared/shared.types";

export interface Features05Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** What's included, in two columns, each with a tick. */
    items: ReactNode[];
    /** The main button under the list. */
    primaryAction?: BlockAction;
    /** A text link beside it: "Compare plans". */
    secondaryLink?: BlockLink;
    /** The large picture on the right (under the list on phones), usually a screenshot. */
    visual: ReactNode;
}
