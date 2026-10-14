import type { HTMLAttributes, ReactNode } from "react";

export interface SectionHeading01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title, centred at a readable width. */
    description?: ReactNode;
}
