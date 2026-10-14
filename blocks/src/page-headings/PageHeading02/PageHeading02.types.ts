import type { HTMLAttributes, ReactNode } from "react";

import type { BreadcrumbItem } from "@openwarelabs/ui";

import type { BlockButton } from "@blocks/shared/shared.types";

/** One of the page's views, as a tab. */
export interface PageHeading02Tab {
    /** Unique among the tabs; what `value` and `onValueChange` use. */
    value: string;
    /** The tab's words. */
    label: ReactNode;
    /** A count in a small pill after the label: how many things the view lists. */
    count?: ReactNode;
    /** What the view shows when its tab is chosen. */
    content: ReactNode;
}

/** Someone who works on the page's thing, shown as an avatar. */
export interface PageHeading02Member {
    /** Their name: the avatar's initials and its label. */
    name: string;
    /** A photo URL. */
    avatar?: string;
}

export interface PageHeading02Labels {
    /** Names the row of tabs for screen readers. @default the title, when it's text */
    tabs?: string;
    /** Names the group of avatars for screen readers. @default "3 people" */
    members?(count: number): string;
}

export interface PageHeading02Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children" | "defaultValue"> {
    /** The page's name, as its h1. */
    title: ReactNode;
    /** A line under the title. */
    description?: ReactNode;
    /** Where the page sits, above the title. The last item is the page itself, without a link. */
    breadcrumbs?: BreadcrumbItem[];
    /** The people on it, as a group of avatars before the primary action. Four show; the rest are counted. */
    members?: PageHeading02Member[];
    /** The one primary action, on the right: "New release". */
    primaryAction?: BlockButton;
    /** The page's views, as line tabs that run edge to edge under the heading. */
    tabs: PageHeading02Tab[];
    /** The open tab, when you keep it yourself. */
    value?: string;
    /** The tab that's open to start with. @default the first */
    defaultValue?: string;
    /** Called with a tab's value when it's chosen. */
    onValueChange?(value: string): void;
    /** Words that aren't content (names for screen readers), in English unless you pass your own. */
    labels?: PageHeading02Labels;
}
