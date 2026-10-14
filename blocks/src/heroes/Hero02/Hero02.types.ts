import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Hero02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title. */
    eyebrow?: ReactNode;
    /** The headline. In half the width it takes the page-title size, so a few words fit on a line. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description: ReactNode;
    /** The one main action, as a primary pill button. */
    primaryAction: BlockAction;
    /** A second action beside it, such as a demo. */
    secondaryAction?: BlockAction;
    /** Short reasons to believe it, each with a tick: "Runs in your own CI". */
    points?: ReactNode[];
    /** The product on the right (under the text on phones), usually a screenshot. */
    visual?: ReactNode;
}
