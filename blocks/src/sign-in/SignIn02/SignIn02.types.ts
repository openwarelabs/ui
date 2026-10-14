import type { HTMLAttributes, ReactNode } from "react";

import type { SignInProvider } from "@blocks/shared/shared.types";

export interface SignIn02Labels {
    /** @default "Work email" */
    email?: string;
    /** @default "maya@example.com" */
    emailPlaceholder?: string;
    /** @default "Password" */
    password?: string;
    /** Under the password until there's an error. @default `At least ${passwordMinLength} characters.` */
    passwordHint?: string;
    /** The form's button. @default "Create account" */
    submit?: string;
    /** The word on the line between the providers and the form. @default "or" */
    separator?: string;
    /** The plate's name for screen readers. @default "About the product" */
    plate?: string;
    /** @default "Enter your work email." */
    emailEmpty?: string;
    /** @default "That doesn't look like an email address." */
    emailInvalid?: string;
    /** @default "Choose a password." */
    passwordEmpty?: string;
    /** When the password is too short, given how many characters it still needs. @default `Add ${missing} more characters.` */
    passwordShort?(missing: number): string;
}

/** What was typed into the form. */
export interface SignIn02Values {
    /** The email address, trimmed. */
    email: string;
    password: string;
}

/** A quote at the foot of the plate. */
export interface SignIn02Quote {
    /** The words, with their quotation marks. */
    text: ReactNode;
    /** Who said it: "Lena Fischer, Head of Platform at Halcyon". */
    author: ReactNode;
    /** A small outlined label after the name, such as "Sample quote". */
    badge?: ReactNode;
}

export interface SignIn02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** The product's name at the top left, with its mark before it (an `<img>` or an inline SVG about 24px square). */
    brand: { name: ReactNode; logo?: ReactNode };
    /** The form's heading: "Create your account". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** Buttons above the form for signing up with another account. */
    providers?: SignInProvider[];
    /** Starts signing up with a provider. While its promise is pending the button shows a spinner. */
    onProviderSelect?(id: string): void | Promise<void>;
    /** Creates the account, once the email is valid and the password long enough. While its promise is pending the button shows a spinner; if it throws, its message shows under the email. */
    onSubmit?(values: SignIn02Values): void | Promise<void>;
    /** The shortest password it takes.
     * @default 12 */
    passwordMinLength?: number;
    /** Small print under the button, such as the terms you agree to. */
    terms?: ReactNode;
    /** A line at the foot of the form's side: "Already have an account? Sign in". */
    footer?: ReactNode;
    /** A short line at the top of the plate, after a brass dot. */
    eyebrow?: ReactNode;
    /** The plate's headline. */
    headline?: ReactNode;
    /** The product on the plate: a screenshot, or a picture drawn with components. */
    visual?: ReactNode;
    /** A quote under it. */
    quote?: SignIn02Quote;
    /** Words that aren't content (the fields' labels, the button, the messages), in English unless you pass your own. */
    labels?: SignIn02Labels;
}
