import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface Logos02Logo {
    /** The company, for the list's key. Put it in the logo too: as the <img>'s alt, or as text beside an SVG. */
    name: string;
    /** The logo: an `<img src alt>` or an inline SVG, in one colour (currentColor), about 22px tall. */
    logo: ReactNode;
    /** Where its tile goes, such as the customer's story. */
    href: string;
}

export interface Logos02Labels {
    /** Shown under a logo when its tile is hovered or focused. @default "Read the story" */
    more?: string;
}

export interface Logos02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** Customers' logos, each a tile that links to its story: four to a row, two on phones. Eight look best. */
    logos: Logos02Logo[];
    /** A link under the tiles: "See all 40 customer stories". */
    link?: BlockLink;
    /** Words that aren't content, in English unless you pass your own. */
    labels?: Logos02Labels;
}
