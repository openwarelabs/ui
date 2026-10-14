import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Hero04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title. */
    eyebrow?: ReactNode;
    /** The headline, in the hero style. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description: ReactNode;
    /** The one main action, as a primary pill button. */
    primaryAction: BlockAction;
    /** A second action beside it. */
    secondaryAction?: BlockAction;
    /** Something beside the text on the left, such as a few cards. Hidden below 1180px wide, where there's no room. */
    start?: ReactNode;
    /** The same on the right. */
    end?: ReactNode;
    /** The dots turn brass under the pointer.
     * @default true */
    interactive?: boolean;
}
