import type { HTMLAttributes, ReactNode } from "react";

import type { SelectItem } from "@openwarelabs/ui";

/** What someone filled in. Fields the form doesn't show stay empty. */
export interface Contact01Values {
    /** Their name. */
    name: string;
    /** Their email address, as typed. */
    email: string;
    /** Their company, or empty. */
    company: string;
    /** The chosen team size's value, or empty. */
    size: string;
    /** The chosen topic's value. */
    topic: string;
    /** What they wrote. */
    message: string;
}

/** The messages under the fields that need fixing. */
export type Contact01Errors = Partial<Record<"name" | "email" | "message", string>>;

/** A way to reach you, in the list beside the form. */
export interface Contact01Detail {
    /** A 16px icon in a tile before it. */
    icon?: ReactNode;
    /** What it is: "Sales". */
    label: ReactNode;
    /** The address or the fact: "sales@example.com", "Within one working day". */
    value: ReactNode;
    /** Makes the value a link, such as "mailto:sales@example.com". */
    href?: string;
    /** A line under it: "Plans, invoices and security reviews". */
    note?: ReactNode;
}

/** The form's words, its validation messages included, in English unless you pass your own. */
export interface Contact01Labels {
    /** @default "Name" */
    name?: string;
    /** @default "Work email" */
    email?: string;
    /** @default "you@example.com" */
    emailPlaceholder?: string;
    /** @default "Company" */
    company?: string;
    /** @default "Team size" */
    size?: string;
    /** @default "Choose a size" */
    sizePlaceholder?: string;
    /** After the labels of the fields that can be left empty. @default "(optional)" */
    optional?: string;
    /** @default "What's it about?" */
    topic?: string;
    /** @default "Message" */
    message?: string;
    /** Under the message until there's an error. @default "A few lines about your team and what you need." */
    messageHint?: string;
    /** The submit button. @default "Send message" */
    submit?: string;
    /** The button that brings the form back. @default "Send another message" */
    again?: string;
    /** @default "Enter your name." */
    nameEmpty?: string;
    /** @default "Enter your work email." */
    emailEmpty?: string;
    /** @default "Enter an email address like name@example.com." */
    emailInvalid?: string;
    /** @default "Tell us a little about what you need." */
    messageEmpty?: string;
    /** For a message under `minMessageLength`. @default "Add a few more words, so it reaches the right person." */
    messageShort?: string;
    /** Shown when `onSubmit` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
}

export interface Contact01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** A short line in a Chip above the title, such as "Contact". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** Ways to reach you and when you reply, listed under the heading. */
    details?: Contact01Detail[];
    /** The choices for "What's it about?". Leave out for no such field. */
    topics?: SelectItem[];
    /** The topic chosen at first. @default the first topic */
    defaultTopic?: string;
    /** The choices for an optional team size. Leave out for no such field. */
    sizes?: SelectItem[];
    /** The fewest characters a message can have.
     * @default 20 */
    minMessageLength?: number;
    /**
     * Sends the message. While its promise is pending the button shows a spinner; if it throws, the error's message
     * shows beside the button, and once it resolves the form gives way to `successTitle`.
     */
    onSubmit(values: Contact01Values): void | Promise<void>;
    /** A small line beside the button: "We use your details only to reply to you." */
    note?: ReactNode;
    /** What replaces the form once it's sent, given what they sent: "Thanks, Siobhan". */
    successTitle(values: Contact01Values): ReactNode;
    /** A line under it, given what they sent. */
    successDescription?(values: Contact01Values): ReactNode;
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Contact01Labels;
}
