import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface Features02Row {
    /** A small line above the title, in the brand colour: "Agents". */
    kicker?: ReactNode;
    /** A 15px icon before the kicker. */
    icon?: ReactNode;
    /** The row's heading. */
    title: ReactNode;
    /** A sentence or two about it. */
    description: ReactNode;
    /** Short points under it, each with a tick. */
    points?: ReactNode[];
    /** A link at the end, with an arrow: "How agents work". */
    link?: BlockLink;
    /** The picture beside it, on a dot grid: a screenshot, or something drawn. */
    visual: ReactNode;
    /** Describes the visual for screen readers when it isn't an <img> with alt text of its own. */
    visualLabel?: string;
}

export interface Features02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The features, one per row, the picture swapping sides each time. They stack on phones. */
    rows: Features02Row[];
}
