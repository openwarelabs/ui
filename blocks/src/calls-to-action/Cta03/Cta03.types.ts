import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Cta03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The main call to action, as a primary pill button. */
    primaryAction: BlockAction;
    /** A second, lower-stakes action beside it. */
    secondaryAction?: BlockAction;
    /** Short points under the buttons, each with a tick. */
    points?: ReactNode[];
    /** The picture beside the words (under them on phones), usually a screenshot. */
    visual: ReactNode;
}
