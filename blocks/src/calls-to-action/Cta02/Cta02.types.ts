import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockLink } from "@blocks/shared/shared.types";

export interface Cta02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small pill above the title, drawn for the brand colour: "Ready when you are". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** A white button on the brand colour. */
    primaryAction: BlockAction;
    /** A text link beside it, with an arrow: "Talk to sales". */
    secondaryLink?: BlockLink;
    /** Short facts under the buttons, each with a tick: "No card needed". */
    facts?: ReactNode[];
}
