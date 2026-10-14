import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Hero05Logo {
    /** The company, for the list's key. Put it in the logo too: as the <img>'s alt, or as text beside an SVG. */
    name: string;
    /** The logo: an `<img src alt>` or an inline SVG, in one colour (currentColor), about 22px tall. */
    logo: ReactNode;
}

export interface Hero05Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title. */
    eyebrow?: ReactNode;
    /** The headline, in the hero style, on the left. */
    title: ReactNode;
    /** A sentence or two, on the right beside the title. */
    description: ReactNode;
    /** The one main action, as a primary pill button. */
    primaryAction: BlockAction;
    /** A second action beside it. */
    secondaryAction?: BlockAction;
    /** A line above the logos: "These teams ship with Acme every day". */
    logosTitle: ReactNode;
    /** Customers' logos, in a row that wraps to a grid on smaller screens. Six to eight look best. */
    logos: Hero05Logo[];
}
