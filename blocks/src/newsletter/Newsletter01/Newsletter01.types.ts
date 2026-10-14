import type { HTMLAttributes, ReactNode } from "react";

/** The words around the form that aren't content, in English unless you pass your own. */
export interface Newsletter01Labels {
    /** The field's label. @default "Email address" */
    email?: string;
    /** @default "you@example.com" */
    placeholder?: string;
    /** The button that brings the form back after signing up. @default "Use a different email" */
    change?: string;
    /** @default "Enter your email address." */
    empty?: string;
    /** @default "Enter an email address like name@example.com." */
    invalid?: string;
    /** Shown when `onSubmit` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
}

export interface Newsletter01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** A short line in a Chip above the title, such as "Changelog". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title: what they'll get, and how often. */
    description?: ReactNode;
    /** The button's words: "Subscribe". */
    submitLabel: ReactNode;
    /**
     * Adds the address to your list. While its promise is pending the button shows a spinner; if it throws, the
     * error's message shows under the field, and once it resolves the form gives way to `successTitle`.
     */
    onSubmit(email: string): void | Promise<void>;
    /** A small line under the form: "Unsubscribe in one click. We never share your address." */
    note?: ReactNode;
    /** What replaces the form once they've signed up: "You're on the list". */
    successTitle: ReactNode;
    /** A line under it, given the address they signed up with. */
    successDescription?(email: string): ReactNode;
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Newsletter01Labels;
}
