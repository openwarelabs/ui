import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface Faq02Question {
    /** Names it for `defaultOpen`. @default its index, as a string */
    id?: string;
    /** The question, as the row's title. */
    question: ReactNode;
    /** The answer, shown when the row is open. */
    answer: ReactNode;
}

export interface Faq02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as "FAQ". */
    eyebrow?: ReactNode;
    /** The section's heading, on the left, staying in view while the questions scroll past. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** Links under the heading, each with an arrow: "Contact support", "Read the docs". */
    links?: BlockLink[];
    /** The questions, on the right, between hairlines; several can be open at once. */
    questions: Faq02Question[];
    /** The questions open at first, by id (or index). @default the first */
    defaultOpen?: string[];
}
