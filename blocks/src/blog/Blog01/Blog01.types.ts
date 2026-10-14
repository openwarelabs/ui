import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

/** Who wrote a post. */
export interface Blog01Author {
    /** Their name, which also gives the avatar's initials. */
    name: string;
    /** A line under it: "Product lead". */
    jobTitle?: ReactNode;
    /** A photo URL; the initials show without one. */
    avatar?: string;
}

/** A post in the grid. */
export interface Blog01Post {
    /** The post's title, which links to it. */
    title: ReactNode;
    /** Where the post is. The whole card opens it. */
    href: string;
    /** A sentence or two under the title. */
    excerpt?: ReactNode;
    /** Its category, shown as a tag and matched against `categories` by the filter: "Product". */
    category?: string;
    /** When it was published, as people read it: "8 Oct 2026". */
    date: ReactNode;
    /** The same date for machines, as in <time dateTime>: "2026-10-08". */
    dateTime?: string;
    /** How long it takes to read: "4 min read". */
    readingTime?: ReactNode;
    /** Who wrote it, along the card's foot. */
    author?: Blog01Author;
    /** The image at the card's top, which fills a 16:10 frame: an `<img alt="">` or a drawing. */
    cover?: ReactNode;
}

/** The words around the posts that aren't content, in English unless you pass your own. */
export interface Blog01Labels {
    /** The filter's first option, which shows every post. @default "All" */
    all?: string;
    /** The filter's accessible name. @default "Show posts about" */
    filter?: string;
}

export interface Blog01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title, such as "Blog". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence under the title. */
    description?: ReactNode;
    /** The posts, newest first, three to a row. */
    posts: Blog01Post[];
    /** Categories to filter the posts by, beside the heading; "All" comes first. Leave out for no filter. */
    categories?: string[];
    /** A button under the posts: "Browse every post". */
    moreAction?: BlockAction;
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Blog01Labels;
}
