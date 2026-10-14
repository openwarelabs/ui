import type { HTMLAttributes, ReactNode } from "react";

import type { BadgeVariant } from "@openwarelabs/ui";

/** A group of a release's changes under a badge, such as New, Improved or Fixed. */
export interface Blog03Change {
    /** The group's badge: "New". */
    label: string;
    /** The badge's colour: "active" for new, "success" for improved, "neutral" for fixed.
     * @default "neutral" */
    variant?: BadgeVariant;
    /** The changes, a sentence each. */
    items: ReactNode[];
}

/** A release on the timeline. */
export interface Blog03Release {
    /** Its version, shown in code type after `labels.versionPrefix`: "2.14". */
    version: string;
    /** When it shipped, as people read it: "8 Oct 2026". */
    date: ReactNode;
    /** The same date for machines, as in <time dateTime>: "2026-10-08". */
    dateTime?: string;
    /** The headline change. */
    title: ReactNode;
    /** A sentence or two about it. */
    summary?: ReactNode;
    /** A picture of the headline change under the summary: a screenshot, or a drawing of it. */
    visual?: ReactNode;
    /** The changes, group by group. */
    changes?: Blog03Change[];
}

/** A way to follow the changelog, beside the heading. */
export interface Blog03Link {
    /** The link's words: "RSS feed". */
    label: ReactNode;
    /** Where it goes. */
    href: string;
    /** A 15px icon before the words. */
    icon?: ReactNode;
}

/** The words around the releases that aren't content, in English unless you pass your own. */
export interface Blog03Labels {
    /** What goes before each version. @default "v" */
    versionPrefix?: string;
    /** The badge on the newest release. @default "Latest" */
    latest?: string;
    /** The button that shows the rest, given how many are hidden. @default `Show ${count} older releases` */
    showOlder?(count: number): string;
    /** A group's list's accessible name. @default `${label} in ${version}` */
    changes?(label: string, version: string): string;
}

export interface Blog03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title, such as "Changelog". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence under the title. */
    description?: ReactNode;
    /** Ways to follow along, beside the heading: a feed, an email. */
    links?: Blog03Link[];
    /** The releases, newest first, down a timeline. */
    releases: Blog03Release[];
    /** How many releases show before the button that shows the rest.
     * @default 3 */
    initialCount?: number;
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Blog03Labels;
}
