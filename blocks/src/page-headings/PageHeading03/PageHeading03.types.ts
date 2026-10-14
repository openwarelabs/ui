import type { HTMLAttributes, ReactNode } from "react";

import type { BlockButton, BlockStatus } from "@blocks/shared/shared.types";

/** A filter menu: a name and the choices in it. Choices in one menu widen the list; different menus narrow it. */
export interface PageHeading03Facet {
    /** Unique among the menus; the key of the item's `facets` it filters on. */
    id: string;
    /** The menu's name, on its button and in its tags: "Status", "Project". */
    label: string;
    /** The choices, each a value an item's `facets[id]` can have. */
    options: string[];
}

/** A filter in use: one choice in one menu. */
export interface PageHeading03Filter {
    /** The menu's id. */
    facet: string;
    /** The choice. */
    value: string;
}

/** One row in the list under the heading. */
export interface PageHeading03Item {
    /** Unique in the list. */
    id: string;
    /** What it is, on the first line. */
    title: ReactNode;
    /** A reference in mono before the details: "#482". */
    reference?: ReactNode;
    /** The rest of the second line: the project, who, when. */
    meta?: ReactNode;
    /** The person it's from, as an avatar at the start of the row. */
    person?: string;
    /** A 15px icon in a round tile at the start of the row, in place of the avatar: an agent's, say. */
    icon?: ReactNode;
    /** Its state, as a badge. */
    status?: BlockStatus;
    /** How many comments it has, after the badge. None shows nothing. */
    comments?: number;
    /** Its value for each filter menu, by the menu's id: `{ status: "Approved", project: "docs" }`. */
    facets: Record<string, string>;
    /** The words a search matches. @default the title, when it's text */
    searchText?: string[];
}

export interface PageHeading03Labels {
    /** The search field's placeholder. @default "Search" */
    searchPlaceholder?: string;
    /** The search field's name for screen readers. @default "Search" */
    search?: string;
    /** Names the list for screen readers. @default "Results" */
    list?: string;
    /** The count beside the tags. @default "3 of 10 shown" */
    count?(shown: number, total: number): ReactNode;
    /** The button that takes every filter off. @default "Clear filters" */
    clearFilters?: string;
    /** Names a filter tag's remove button. @default "Status filter: Approved" */
    removeFilter?(facet: string, value: string): string;
    /** After a comment count, for screen readers. @default " comments" */
    comments?: string;
    /** The title when nothing matches. @default "Nothing matches" */
    emptyTitle?: string;
    /** The line under it. @default "Try a different search, or take a filter off to see more." */
    emptyDescription?: string;
    /** The button that clears the search and the filters. @default "Clear search and filters" */
    clearAll?: string;
}

export interface PageHeading03Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The page's name, as its h1. */
    title: ReactNode;
    /** A line under the title. */
    description?: ReactNode;
    /** The one primary action, on the right: "Request review". */
    primaryAction?: BlockButton;
    /** The filter menus, after the search field. */
    facets: PageHeading03Facet[];
    /** The list the search and the filters narrow. */
    items: PageHeading03Item[];
    /** The filters in use to start with. */
    defaultFilters?: PageHeading03Filter[];
    /** Called with the filters in use whenever they change. */
    onFiltersChange?(filters: PageHeading03Filter[]): void;
    /** A 20px icon for the empty state, usually from lucide-react. @default a search glass with a cross */
    emptyIcon?: ReactNode;
    /** Words that aren't content (names for screen readers, button labels, the empty state), in English unless you pass your own. */
    labels?: PageHeading03Labels;
}
