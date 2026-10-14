import type { HTMLAttributes, ReactNode } from "react";

export interface Features03Card {
    /** The card's heading. */
    title: ReactNode;
    /** A line or two about it. */
    description: ReactNode;
    /** The picture in the card: a screenshot, or something drawn. */
    visual: ReactNode;
    /** Describes the visual for screen readers when it isn't an <img> with alt text of its own. */
    visualLabel?: string;
}

export interface Features03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A lead beside the title, on the right. */
    description?: ReactNode;
    /**
     * The cards. The first is the big one, two columns wide and two rows tall, with a heading and a lead; the rest
     * are dense cards around it. Six fill the grid; on tablets the first and the last span the full width.
     */
    cards: Features03Card[];
}
