import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockBrand, HeaderLink } from "@blocks/shared/shared.types";

/** The line above the header. */
export interface Header04Announcement {
    /** The news, in bold: "Acme 3.0 is out." */
    title: ReactNode;
    /** A few words after it, hidden on phones. */
    description?: ReactNode;
    /** Where to read more. */
    link?: {
        label: ReactNode;
        /** A shorter label for phones: "Read more". */
        shortLabel?: ReactNode;
        href: string;
    };
}

export interface Header04Labels {
    /** The phone menu's name. @default "Menu" */
    menu?: string;
    /** The close button's name. @default "Dismiss the announcement" */
    dismiss?: string;
    /** The announcement's name for screen readers. @default "Announcement" */
    announcement?: string;
}

export interface Header04Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** A slim line above the header for a launch or an update, with a link and a close button. */
    announcement: Header04Announcement;
    /** Runs when the announcement is closed: remember it (in a cookie or localStorage) to keep it closed next time. */
    onDismiss?(): void;
    /** Starts with the announcement closed, for someone who already closed it. */
    defaultDismissed?: boolean;
    /** The logo and name on the left, linking home. */
    brand: BlockBrand;
    /** The links in the middle. On phones they move into a menu. */
    links: HeaderLink[];
    /** The one call to action on the right, as a small primary pill. */
    primaryAction: BlockAction;
    /** A text link before it, such as "Sign in". On phones it's the menu's last item. */
    secondaryLink?: HeaderLink;
    /**
     * Where a phone menu item goes. Menu items are buttons, so they navigate here.
     * @default (href) => window.location.assign(href)
     */
    onNavigate?(href: string): void;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Header04Labels;
}
