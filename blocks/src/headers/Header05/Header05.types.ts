import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockBrand, HeaderLink } from "@blocks/shared/shared.types";

export interface Header05Labels {
    /** The menu button's name. @default "Open menu" */
    open?: string;
    /** The drawer's title. @default "Menu" */
    title?: string;
}

export interface Header05Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** The logo and name on the left, linking home. */
    brand: BlockBrand;
    /** The main links. Under 1024px wide they fold into a drawer behind a menu button. */
    links: HeaderLink[];
    /** A second, smaller list in the drawer, under a heading. */
    more?: { title: ReactNode; links: HeaderLink[] };
    /** The one call to action, as a small primary pill in the bar and a full one at the foot of the drawer. */
    primaryAction: BlockAction;
    /** A text link before it, such as "Sign in", and a button beside it in the drawer. */
    secondaryLink?: HeaderLink;
    /** Starts with the drawer open, as the docs' phone preview does. */
    defaultOpen?: boolean;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Header05Labels;
}
