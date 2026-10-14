import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface Stats02Stat {
    /** What it counts: "Deploys a week". */
    label: ReactNode;
    /** The figure, at a display size: "86,400". */
    value: ReactNode;
    /** A 14px icon before the label. */
    icon?: ReactNode;
    /** The change against the period before: "+12%". */
    change?: string;
    /** Whether the change is good or bad. Worked out from a leading + or − when left out; set it when a fall is good news ("−18%" in review time). */
    changeTone?: "positive" | "negative" | "neutral";
    /** A line after the change: "vs the quarter before". */
    description?: ReactNode;
    /** Values for a small trend line along the card's foot, oldest first. */
    trend?: number[];
}

export interface Stats02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** A link on the right of the heading, such as how the numbers are counted. */
    link?: BlockLink;
    /** The numbers, each on its own card: four to a row, two on tablets, one on phones. */
    stats: Stats02Stat[];
}
