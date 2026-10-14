import type { HTMLAttributes, ReactNode } from "react";

import type { BlockButton, BlockMenuItem, BlockStatus } from "@blocks/shared/shared.types";

/** One card: what it is, how it's doing, who works on it, and a menu of actions. */
export interface List04Item {
    /** Unique in the grid. */
    id: string;
    /** Its name, as the card's heading. */
    title: string;
    /** A line in mono under the name, such as its repository. */
    subtitle?: ReactNode;
    /** A 17px icon on a tile before the name, usually from lucide-react. */
    icon?: ReactNode;
    /** A line or two about it. */
    description?: ReactNode;
    /** Its state, as a badge at the foot of the card. */
    status?: BlockStatus;
    /** A caption beside the badge: when it last changed. */
    meta?: ReactNode;
    /** The people on it, as avatars at the foot. Three show; the rest are counted. */
    members?: string[];
    /** Marks it with a small brass star after its name. */
    pinned?: boolean;
    /** What can be done to it, in a menu behind a button on the card. */
    menu?: BlockMenuItem[];
    /** The words the search matches. @default the title, and the description when it's text */
    searchText?: string[];
}

export interface List04Labels {
    /** The search field's placeholder, and its name for screen readers. @default "Search" */
    search?: string;
    /** Read out for the star of a pinned card. @default "Pinned" */
    pinned?: string;
    /** Names a card's menu button. @default "Actions for marketing-site" */
    actions?(title: string): string;
    /** Names a card's menu. @default "marketing-site actions" */
    menu?(title: string): string;
    /** Names a card's group of avatars. @default "6 people on marketing-site" */
    members?(count: number, title: string): string;
    /** The empty state's title when the search matches nothing. @default "Nothing matches" */
    emptyTitle?: string;
    /** The line under it, given the search. @default "Nothing is called “…”, and no description mentions it." */
    emptyDescription?(query: string): ReactNode;
    /** The button that clears the search. @default "Clear search" */
    clearSearch?: string;
    /** The empty state's title when there are no cards at all. @default "Nothing here yet" */
    noItemsTitle?: string;
    /** The line under it. */
    noItemsDescription?: ReactNode;
}

export interface List04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading. */
    title: ReactNode;
    /** A muted count after the heading. */
    count?: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** A small primary action beside the search field: "New project". */
    primaryAction?: BlockButton;
    /** The cards, in order: three to a row on desktops, two on tablets, one on phones. */
    items: List04Item[];
    /** Shows a search field that narrows the cards. @default true */
    searchable?: boolean;
    /** A 20px icon for the empty state, usually from lucide-react. @default a search glass with a cross */
    emptyIcon?: ReactNode;
    /** Words that aren't content (names for screen readers, the empty state), in English unless you pass your own. */
    labels?: List04Labels;
}
