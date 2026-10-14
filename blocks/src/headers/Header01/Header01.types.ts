import type { HTMLAttributes } from "react";

import type { BlockAction, BlockBrand, HeaderLink } from "@blocks/shared/shared.types";

export interface Header01Labels {
    /** The phone menu button's name, and the menu's. @default "Menu" */
    menu?: string;
}

export interface Header01Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The logo and name on the left, linking home. */
    brand: BlockBrand;
    /** The site's main links, in the middle. Under 760px wide they move into a menu behind a button. */
    links: HeaderLink[];
    /** The one call to action on the right, as a small primary pill: "Start for free". */
    primaryAction: BlockAction;
    /** A text link before it, such as "Sign in". On phones it moves into the menu. */
    secondaryLink?: HeaderLink;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Header01Labels;
}
