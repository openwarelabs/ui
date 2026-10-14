import type { HTMLAttributes, ReactNode } from "react";

export interface Testimonial02Quote {
    /** What they said. */
    quote: ReactNode;
    /** Who said it, beside their avatar (initials when there's no `avatar`). */
    name: string;
    /** Their role and company: "Staff engineer, Quarry". */
    jobTitle?: ReactNode;
    /** A photo of them, as an image URL. */
    avatar?: string;
    /** A quote of a line or two, set larger, as a headline. */
    short?: boolean;
}

export interface Testimonial02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** A small badge on the right of the heading, such as "Sample quotes". */
    badge?: ReactNode;
    /** The quotes, each on a card, in three columns of different heights (two on tablets, one on phones). */
    quotes: Testimonial02Quote[];
}
