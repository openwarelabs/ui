import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

/** A row in an option's list: a guide, a thread, a reply time. */
export interface Contact02ListItem {
    /** The row's words, on the left. */
    label: ReactNode;
    /** Makes them a link. */
    href?: string;
    /** A figure on the right, in tabular numerals: "4 min", "24 replies". */
    meta?: ReactNode;
}

/** A way to get help, in a card of its own. */
export interface Contact02Option {
    /** A 20px icon in a tile at the top. */
    icon?: ReactNode;
    /** The card's heading: "Documentation". */
    title: ReactNode;
    /** A sentence under it. */
    description?: ReactNode;
    /** An email address in a field with a copy button. */
    email?: string;
    /** A few rows under a hairline. */
    list?: Contact02ListItem[];
    /** The list's accessible name: "Popular guides". */
    listLabel?: string;
    /** The link along the card's foot, with an arrow: "Browse the docs". */
    link: BlockLink;
    /** Something on the right of the foot, such as avatars and a member count. */
    footNote?: ReactNode;
}

/** A line under the cards about whether everything's working. */
export interface Contact02Status {
    /** The state, after a green dot: "All systems working". */
    label: ReactNode;
    /** A line beside it, which can hold a link to the status page. */
    description?: ReactNode;
}

/** The words on the cards that aren't content, in English unless you pass your own. */
export interface Contact02Labels {
    /** The button that copies an option's email address. @default "Copy address" */
    copyAddress?: string;
}

export interface Contact02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title, such as "Support". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The ways to get help, three to a row: the docs, a forum, email. */
    options: Contact02Option[];
    /** A line about the service's state under the cards. */
    status?: Contact02Status;
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Contact02Labels;
}
