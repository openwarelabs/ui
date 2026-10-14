import type { HTMLAttributes, ReactNode } from "react";

export interface Testimonial01Labels {
    /** The section's heading, for screen readers only. @default "What customers say" */
    title?: string;
}

export interface Testimonial01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The quote, large and centred, in the muted colour: the setup. */
    quote: ReactNode;
    /** The part worth remembering, after the quote in full colour. */
    highlight?: ReactNode;
    /** Who said it, beside their avatar (initials when there's no `avatar`). */
    name: string;
    /** Their role and company: "VP of engineering, Basalt". */
    jobTitle?: ReactNode;
    /** A photo of them, as an image URL. */
    avatar?: string;
    /** A small badge under the person, such as "Sample quote". */
    badge?: ReactNode;
    /** Words that aren't content, in English unless you pass your own. */
    labels?: Testimonial01Labels;
}
