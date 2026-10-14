import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface Stats03Stat {
    /** The figure: "3.1", "1 in 4". */
    value: ReactNode;
    /** A unit after it at just under half its size, in the muted colour: "×", "%", "days". */
    unit?: ReactNode;
    /** What it counts, under the figure: "more deploys a week". */
    label: ReactNode;
    /** A sentence under the label that puts the number in context. */
    detail?: ReactNode;
}

export interface Stats03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading, on the left. */
    title: ReactNode;
    /** A paragraph under the title. */
    description?: ReactNode;
    /** A link under the paragraph, such as a customer's story. */
    link?: BlockLink;
    /** The numbers, two to a row on the right, each under a hairline (the first with a brass tick). Four look best. */
    stats: Stats03Stat[];
}
