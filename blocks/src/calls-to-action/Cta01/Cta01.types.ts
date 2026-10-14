import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Cta01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The main call to action, as a primary pill button. */
    primaryAction: BlockAction;
    /** A second, lower-stakes action beside it. */
    secondaryAction?: BlockAction;
    /** A small line under the buttons, which can start with a 14px icon: "Most teams are set up in ten minutes." */
    note?: ReactNode;
}
