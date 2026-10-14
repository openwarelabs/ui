import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

/** Who wrote a post. */
export interface Blog02Author {
    /** Their name, which also gives the avatar's initials. */
    name: string;
    /** A line under it, on the featured post: "Customer success". */
    jobTitle?: ReactNode;
    /** A photo URL; the initials show without one. */
    avatar?: string;
}

/** A figure on the featured post, such as "Deploys a day: 2.3". */
export interface Blog02Fact {
    /** What it measures, under the figure. */
    label: ReactNode;
    /** The figure. */
    value: ReactNode;
}

/** A post: the featured one, or one of those below it. */
export interface Blog02Post {
    /** The post's title, which links to it. */
    title: ReactNode;
    /** Where the post is. The whole post opens it. */
    href: string;
    /** Its category: a tag on the featured post, a word before the date on the others. */
    category?: ReactNode;
    /** When it was published, as people read it: "15 Sep 2026". */
    date: ReactNode;
    /** The same date for machines, as in <time dateTime>: "2026-09-15". */
    dateTime?: string;
    /** Who wrote it. */
    author?: Blog02Author;
    /** The post's image, which fills its frame: an `<img alt="">` or a drawing. A 16:10 thumbnail on the smaller posts. */
    cover?: ReactNode;
    /** A sentence or two under the title. Featured post only. */
    excerpt?: ReactNode;
    /** Up to three figures in a row under the excerpt. Featured post only. */
    facts?: Blog02Fact[];
    /** How long it takes to read: "6 min read". Featured post only. */
    readingTime?: ReactNode;
}

export interface Blog02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading. */
    title: ReactNode;
    /** A link beside it, with an arrow: "All posts". */
    allLink?: BlockLink;
    /** The post in the large card: its cover on the left, the story on the right. */
    featured: Blog02Post;
    /** The next few posts in a row below it, with a small cover beside each title. Three fit best. */
    posts?: Blog02Post[];
}
