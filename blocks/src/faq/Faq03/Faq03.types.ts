import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Faq03Question {
    /** The question, as a small title. */
    question: ReactNode;
    /** The answer, always on show under it. */
    answer: ReactNode;
}

export interface Faq03Person {
    /** Their name, for their avatar's initials. */
    name: string;
    /** A photo of them, as an image URL. */
    avatar?: string;
}

export interface Faq03Contact {
    /** The card's title: "Still have a question?". */
    title: ReactNode;
    /** A sentence on who answers and how. */
    description?: ReactNode;
    /** A small line after a green dot, such as how quickly they reply. */
    status?: ReactNode;
    /** The people who answer, as overlapping avatars on the left. */
    people?: Faq03Person[];
    /** Names the avatars for screen readers: "Lena, Omar and Aiko from support". */
    peopleLabel?: string;
    /** The main way to get in touch, as a primary pill button. */
    primaryAction: BlockAction;
    /** A second way, beside it. */
    secondaryAction?: BlockAction;
}

export interface Faq03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as "FAQ". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The questions, every answer on show, two to a row (one on phones). */
    questions: Faq03Question[];
    /** A card under the questions for anything they don't cover. */
    contact?: Faq03Contact;
}
