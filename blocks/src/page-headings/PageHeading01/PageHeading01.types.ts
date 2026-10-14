import type { HTMLAttributes, ReactNode } from "react";

import type { BlockButton, BlockMenuItem, BlockStatus } from "@blocks/shared/shared.types";

/** One fact in the row under the heading: what you'd look up first. */
export interface PageHeading01Fact {
    /** What it is, as a caption: "Production", "Branch". */
    label: ReactNode;
    /** Its value. Spans in it are cut short with an ellipsis when there's no room. */
    value: ReactNode;
}

export interface PageHeading01Labels {
    /** The name of the button that opens the menu. @default "More actions" */
    moreActions?: string;
    /** The menu's name for screen readers. @default "Actions" */
    menu?: string;
}

export interface PageHeading01Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The page's name, as its h1. */
    title: ReactNode;
    /** A 20px icon on a tile before the title, usually from lucide-react. */
    icon?: ReactNode;
    /** Its state, as a badge beside the title: "Live", "Paused". */
    status?: BlockStatus;
    /** A line under the title. */
    description?: ReactNode;
    /** The one primary action, on the right: "Deploy". */
    primaryAction?: BlockButton;
    /** Everything else you can do, in a menu behind a button before the primary action. */
    menu?: BlockMenuItem[];
    /** A row of facts under the heading, split by hairlines: four fill it. */
    facts?: PageHeading01Fact[];
    /** The start of the page under the heading, on the same panel. */
    children?: ReactNode;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: PageHeading01Labels;
}
