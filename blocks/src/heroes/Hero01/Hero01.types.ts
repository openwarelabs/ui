import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Hero01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title: news, a launch or the product's name. */
    eyebrow?: ReactNode;
    /** The headline, in the hero style: what the product does, in a few words. */
    title: ReactNode;
    /** A sentence or two under the title: who it's for and what it changes. */
    description: ReactNode;
    /** The one main action, as a primary pill button. */
    primaryAction: BlockAction;
    /** A second, lower-stakes action beside it. */
    secondaryAction?: BlockAction;
    /** A small line under the buttons, such as "Free for teams of up to five. No card needed." */
    note?: ReactNode;
    /** The product under the text, usually a screenshot (`<img src alt>`). It's centred, up to 1080px wide, and fades out at the bottom. */
    visual?: ReactNode;
}
