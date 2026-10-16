import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

/** The words around the form that aren't content, in English unless you pass your own. */
export interface Newsletter02Labels {
    /** The field's label. @default "Email address" */
    email?: string;
    /** @default "you@example.com" */
    placeholder?: string;
    /** @default "Enter your email address." */
    empty?: string;
    /** @default "Enter an email address like name@example.com." */
    invalid?: string;
    /** Shown when `onSubmit` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
}

export interface Newsletter02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** A 20px icon in a tile above the title, such as a mail icon. */
    icon?: ReactNode;
    /** The card's heading. */
    title: ReactNode;
    /** A sentence or two under it: what they'll get, and how often. */
    description?: ReactNode;
    /** The button's words: "Subscribe". */
    submitLabel: ReactNode;
    /**
     * Adds the address to your list. While its promise is pending the button shows a spinner; if it throws, the
     * error's message shows under the field, and once it resolves a toast says so and the field empties.
     */
    onSubmit(email: string): void | Promise<void>;
    /** The toast's title once they've signed up: "Check your inbox". */
    successTitle: ReactNode;
    /** The toast's line under it, given the address they signed up with. */
    successDescription?(email: string): ReactNode;
    /** The people who write it, as avatars at the foot of the card. */
    authors?: string[];
    /** A line beside the avatars: "Aoife, Declan and Seán write it for 9,400 readers." */
    authorsNote?: ReactNode;
    /** A link at the foot's right, with an arrow: "Read past posts". */
    archiveLink?: BlockLink;
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Newsletter02Labels;
}
