import type { HTMLAttributes, ReactNode } from "react";

export interface Features01Feature {
    /** A 16px icon, usually from lucide-react, on a tinted tile. */
    icon?: ReactNode;
    /** The feature's name. */
    title: ReactNode;
    /** A sentence or two. */
    description: ReactNode;
}

export interface Features01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** In three columns, two on tablets and one on phones; six fill two rows. */
    features: Features01Feature[];
    /** A line under the grid, often with a link: "Plus webhooks and an API. Read the docs". */
    footer?: ReactNode;
}
