import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

/** Who wrote the article. */
export interface Blog04Author {
    /** Their name, which also gives the avatar's initials. */
    name: string;
    /** A line under it: "Product lead". */
    jobTitle?: ReactNode;
    /** A photo URL; the initials show without one. */
    avatar?: string;
}

/** A heading in the article, for On this page. */
export interface Blog04Section {
    /** The id of the heading in the article's text, which the link scrolls to. */
    id: string;
    /** The link's words, usually the heading's. */
    title: ReactNode;
}

/** The words around the article that aren't content, in English unless you pass your own. */
export interface Blog04Labels {
    /** The heading over the list of sections, beside the text and in the fold above it. @default "On this page" */
    contents?: string;
    /** The tags' accessible name. @default "Topics" */
    topics?: string;
    /** The button that copies `shareUrl`. @default "Copy link" */
    copyLink?: string;
    /** What it says once it has. @default "Link copied" */
    linkCopied?: string;
}

export interface Blog04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A link back above the title, with an arrow: "All posts". */
    backLink?: BlockLink;
    /** The article's category, as a tag above the title: "Product". */
    category?: ReactNode;
    /** A word beside it: "Agents". */
    topic?: ReactNode;
    /** The article's title: the page's h1. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** Who wrote it. */
    author?: Blog04Author;
    /** When it was published, as people read it: "8 Oct 2026". */
    date?: ReactNode;
    /** The same date for machines, as in <time dateTime>: "2026-10-08". */
    dateTime?: string;
    /** How long it takes to read: "4 min read". */
    readingTime?: ReactNode;
    /** A wide image under the header, which fills a 12:5 frame (16:10 on phones): an `<img alt="">` or a drawing. */
    cover?: ReactNode;
    /**
     * The text, at a readable width: `Text variant="prose"` paragraphs, `h2` headings (with the ids in `sections`), lists,
     * a `blockquote`, a `CodeBlock`.
     */
    children: ReactNode;
    /** The article's headings, listed in On this page beside the text (folded above it on smaller screens), the one being read marked. */
    sections?: Blog04Section[];
    /** Tags at the end of the text: "Agents", "Reviews". */
    tags?: ReactNode[];
    /** The article's address, which Copy link copies, at the end of the text and under On this page. */
    shareUrl?: string;
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Blog04Labels;
}
