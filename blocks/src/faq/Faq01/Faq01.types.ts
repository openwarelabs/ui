import type { HTMLAttributes, ReactNode } from "react";

export interface Faq01Question {
    /** Names it for `defaultOpen`. @default its index, as a string */
    id?: string;
    /** The question, as the row's title. */
    question: ReactNode;
    /** The answer, shown when the row is open. */
    answer: ReactNode;
}

export interface Faq01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as "FAQ". */
    eyebrow?: ReactNode;
    /** The section's heading, centred. */
    title: ReactNode;
    /** A sentence under the title. */
    description?: ReactNode;
    /** The questions, in an accordion that opens one at a time. */
    questions: Faq01Question[];
    /** The question open at first, by id (or index). @default the first */
    defaultOpen?: string[];
    /** A line under the questions, such as where to ask one that isn't there, with links. */
    note?: ReactNode;
}
