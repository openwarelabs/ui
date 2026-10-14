import type { HTMLAttributes, ReactNode } from "react";

import type { BlockBrand, BlockLink } from "@blocks/shared/shared.types";

/** One of the main places, offered as a way out. */
export interface ErrorPage01Place {
    /** Its name: "Projects". */
    name: string;
    /** A line under it, hidden on phones: "Every project and its tasks". */
    description?: string;
    /** A 16px icon on a tile, usually from lucide-react. */
    icon?: ReactNode;
    /** Where it goes. */
    href: string;
    /** More words the search finds it by: "tasks issues repositories". */
    keywords?: string;
}

/** The words that aren't content, in English unless you pass your own. */
export interface ErrorPage01Labels {
    /** What the drawn 404 is read out as. @default "Error 404" */
    code?: string;
    /** The logo link's name, when the brand's name alone isn't clear: "Acme overview". */
    home?: string;
    /** The search field's name. @default "Search" */
    search?: string;
    /** @default "Search" */
    placeholder?: string;
    /** The places' name for screen readers. @default "Places to go" */
    places?: string;
    /** Shown when no place matches the search. @default (query) => `Nothing here matches “${query}”. Press Enter to search.` */
    noMatches?(query: string): ReactNode;
}

export interface ErrorPage01Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The logo and name at the top left, linking home. */
    brand: BlockBrand;
    /** A link at the top right, such as "Help centre". */
    helpLink?: BlockLink;
    /** The page's h1: "This page isn't here". */
    title: ReactNode;
    /** A sentence under it: why, and what to do. */
    description?: ReactNode;
    /** The main places, which the search narrows as you type. */
    places: ErrorPage01Place[];
    /** How many places show at once.
     * @default 4 */
    maxPlaces?: number;
    /** Runs on Enter in the search: search the whole product. */
    onSearch?(query: string): void;
    labels?: ErrorPage01Labels;
}
