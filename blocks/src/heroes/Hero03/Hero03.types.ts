import type { HTMLAttributes, ReactNode } from "react";

/** The words around the form that aren't content, in English unless you pass your own. */
export interface Hero03Labels {
    /** The field's accessible name. @default "Work email" */
    email?: string;
    /** @default "you@company.com" */
    placeholder?: string;
    /** The button that brings the form back after joining. @default "Change email" */
    change?: string;
    /** @default "Enter your work email to join the waitlist." */
    empty?: string;
    /** @default "That doesn't look like an email address. Try one like maya@example.com." */
    invalid?: string;
    /** Shown when `onSubmit` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
}

export interface Hero03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** A short line in a Chip above the title, such as "Early access". */
    eyebrow?: ReactNode;
    /** The headline, in the hero style. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description: ReactNode;
    /** The button's words: "Join the waitlist", "Start your trial". */
    submitLabel: ReactNode;
    /**
     * Sends the address to your waitlist. While its promise is pending the button shows a spinner; if it throws,
     * the error's message shows under the field, and once it resolves the form gives way to `successTitle`.
     */
    onSubmit(email: string): void | Promise<void>;
    /** A small line under the field, such as "One email when your place is ready. Nothing else." */
    note?: ReactNode;
    /** What replaces the form once someone has joined: "You're on the list". */
    successTitle: ReactNode;
    /** A line under it, given the address they joined with. */
    successDescription?(email: string): ReactNode;
    /** Something under the form: a screenshot, or what they'll get. */
    visual?: ReactNode;
    labels?: Hero03Labels;
}
