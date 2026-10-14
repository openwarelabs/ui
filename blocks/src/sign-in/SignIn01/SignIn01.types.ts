import type { HTMLAttributes, ReactNode } from "react";

import type { SignInProvider } from "@blocks/shared/shared.types";

export interface SignIn01Labels {
    /** @default "Email" */
    email?: string;
    /** @default "maya@example.com" */
    emailPlaceholder?: string;
    /** @default "Password" */
    password?: string;
    /** The link beside the password's label. @default "Forgot password?" */
    forgotPassword?: string;
    /** The form's button. @default "Sign in" */
    submit?: string;
    /** The word on the line between the providers and the form. @default "or" */
    separator?: string;
    /** @default "Enter the email address you signed up with." */
    emailEmpty?: string;
    /** @default "That doesn't look like an email address." */
    emailInvalid?: string;
    /** @default "Enter your password." */
    passwordEmpty?: string;
}

/** What was typed into the form. */
export interface SignIn01Values {
    /** The email address, trimmed. */
    email: string;
    password: string;
}

export interface SignIn01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** The page's heading: "Sign in to Acme". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The product's mark above the heading: an `<img>` or an inline SVG about 40px square. */
    logo?: ReactNode;
    /** Buttons above the form for signing in with another account. Leave it out for the form alone. */
    providers?: SignInProvider[];
    /** Starts signing in with a provider, usually by sending the browser there. While its promise is pending the button shows a spinner. */
    onProviderSelect?(id: string): void | Promise<void>;
    /** Signs in with the email and password, once both are filled in. While its promise is pending the button shows a spinner; if it throws, its message shows under the password. */
    onSubmit?(values: SignIn01Values): void | Promise<void>;
    /** Where "Forgot password?" goes. Without it there's no link. */
    forgotPasswordHref?: string;
    /** A line under the card, such as "New to Acme? Create an account" with its link. */
    footer?: ReactNode;
    /** Words that aren't content (the fields' labels, the button, the messages), in English unless you pass your own. */
    labels?: SignIn01Labels;
}
