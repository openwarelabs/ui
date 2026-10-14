import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockBrand, HeaderLink } from "@blocks/shared/shared.types";

/** One of the cards in the panel: an icon, a title and a line about it. */
export interface Header02Feature {
    /** The feature's name. */
    title: ReactNode;
    /** A line about it. */
    description: ReactNode;
    /** Where it goes. */
    href: string;
    /** A 16px icon, usually from lucide-react. */
    icon?: ReactNode;
}

/** The big menu: a grid of features, and a highlighted link beside them. */
export interface Header02Panel {
    /** Its button in the bar: "Product". */
    label: string;
    /** The cards in the grid. */
    features: Header02Feature[];
    /** A card beside the features, for news: a badge, a line and a link. */
    highlight?: {
        badge?: ReactNode;
        title: ReactNode;
        linkLabel: ReactNode;
        href: string;
    };
}

export interface Header02MenuItem {
    /** The item's words. */
    label: string;
    /** Where it goes. */
    href: string;
    /** A 15px icon, usually from lucide-react. */
    icon?: ReactNode;
}

/** A dropdown of links, in groups with a line between them. */
export interface Header02Menu {
    /** Its button in the bar: "Resources". */
    label: string;
    /** The items, in groups with a line between them. */
    groups: Header02MenuItem[][];
}

export interface Header02Labels {
    /** The phone menu button's name. @default "Menu" */
    menu?: string;
}

export interface Header02Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** The logo and name on the left, linking home. */
    brand: BlockBrand;
    /** The big menu, first in the bar. */
    panel?: Header02Panel;
    /** Dropdowns of links after it. */
    menus?: Header02Menu[];
    /** Plain links after those. */
    links?: HeaderLink[];
    /** The one call to action on the right, as a small primary pill. */
    primaryAction: BlockAction;
    /** A link before it, such as "Sign in". On phones it's the panel's last button. */
    secondaryLink?: HeaderLink;
    /**
     * Where a dropdown item goes. Menu items are buttons, so they navigate here.
     * @default (href) => window.location.assign(href)
     */
    onNavigate?(href: string): void;
    /** Opens the big menu at first, as the docs' preview does. */
    defaultPanelOpen?: boolean;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Header02Labels;
}
