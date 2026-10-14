import type { HTMLAttributes } from "react";

import type { BlockAction, BlockBrand, HeaderLink } from "@blocks/shared/shared.types";

export interface Header03Labels {
    /** The left-hand links' name for screen readers. @default "Primary" */
    start?: string;
    /** The right-hand links'. @default "More" */
    end?: string;
    /** All the links on one line, as on tablets and phones. @default "Main" */
    all?: string;
}

export interface Header03Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The logo and name in the middle, linking home. */
    brand: BlockBrand;
    /** The links on the left of the logo. */
    start: HeaderLink[];
    /** The links on the right, before the actions. */
    end?: HeaderLink[];
    /** The one call to action on the far right, as a small primary pill. */
    primaryAction: BlockAction;
    /** A text link before it, such as "Sign in". On narrow screens it moves left of the logo. */
    secondaryLink?: HeaderLink;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Header03Labels;
}
