import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface SignIn05Labels {
    /** @default "Email" */
    email?: string;
    /** @default "maya@example.com" */
    emailPlaceholder?: string;
    /** The first step's button. @default "Email me a reset link" */
    sendLink?: string;
    /** @default "Enter the email you use to sign in." */
    emailEmpty?: string;
    /** @default "That doesn't look like an email address." */
    emailInvalid?: string;
    /** Shown when a callback fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
    /** The second step's heading. @default "Choose a new password" */
    chooseTitle?: string;
    /** The line under it, given their address in bold. @default (email) => <>For {email}. You'll be signed in as soon as it's saved.</> */
    chooseDescription?(email: ReactNode): ReactNode;
    /** @default "New password" */
    password?: string;
    /** @default "Show password" */
    showPassword?: string;
    /** @default "Hide password" */
    hidePassword?: string;
    /** The list of rules' name for screen readers. @default "Your password needs" */
    rules?: string;
    /** Read out after a rule that's met. @default " (done)" */
    ruleMet?: string;
    /** Read out after a rule that isn't. @default " (not yet)" */
    ruleNotMet?: string;
    /** @default "Choose a new password." */
    passwordEmpty?: string;
    /** When none of the rules are met, given how many there are. @default "Your password needs all three things below." */
    passwordNeedsAll?(count: number): string;
    /** When some aren't, given what's missing joined with commas and "and". @default `Your password still needs ${missing}.` */
    passwordNeeds?(missing: string): string;
    /** The second step's button. @default "Save password and sign in" */
    save?: string;
    /** The last step's heading. @default "Password changed" */
    doneTitle?: string;
    /** The last step's button. @default "Continue" */
    continue?: string;
}

/** Something a new password needs. */
export interface SignIn05Rule {
    /** In the list under the field: "At least 12 characters". */
    label: string;
    /** In the error, after "still needs": "at least 12 characters". */
    missing: string;
    /** Whether the password meets it. */
    test(password: string): boolean;
}

/** The new password, for the account. */
export interface SignIn05Values {
    /** The address from the first step, trimmed. */
    email: string;
    password: string;
}

export interface SignIn05Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The product's name at the top left, with its mark before it (an `<img>` or an inline SVG about 24px square). */
    brand: { name: ReactNode; logo?: ReactNode };
    /** The link back at the top right: "Back to sign in". */
    backLink?: BlockLink;
    /** The first step's heading: "Reset your password". */
    title: ReactNode;
    /** The line under it. */
    description?: ReactNode;
    /** Emails the reset link, once the address is valid. While its promise is pending the button shows a spinner; if it throws, its message shows under the field. Then the next step shows; in a real flow it's the page the link opens. */
    onRequestLink?(email: string): void | Promise<void>;
    /** Saves the new password, once it meets every rule. Pending and errors as above; then the last step shows. */
    onSavePassword?(values: SignIn05Values): void | Promise<void>;
    /** What a new password needs, ticked off as it's typed.
     * @default at least 12 characters, upper and lower case letters, and a number */
    rules?: SignIn05Rule[];
    /** The last step's line, under "Password changed". */
    doneDescription?: ReactNode;
    /** The last step's button, which usually opens the app. Without it the button starts again from the first step. */
    onContinue?(): void;
    /** Words that aren't content (the fields' labels, the buttons, the messages), in English unless you pass your own. */
    labels?: SignIn05Labels;
}
