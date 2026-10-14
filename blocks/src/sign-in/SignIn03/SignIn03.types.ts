import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface SignIn03Labels {
    /** @default "Email" */
    email?: string;
    /** @default "maya@example.com" */
    emailPlaceholder?: string;
    /** The form's button. @default "Email me a link" */
    submit?: string;
    /** @default "Enter your email address." */
    emailEmpty?: string;
    /** @default "That doesn't look like an email address." */
    emailInvalid?: string;
    /** Shown when `onSubmit` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
    /** The second page's heading. @default "Check your email" */
    sentTitle?: string;
    /** @default "Send the link again" */
    resend?: string;
    /** The resend button while it waits, given the seconds left. @default `Send again in ${seconds} s` */
    resendIn?(seconds: number): string;
    /** The button that goes back to the form. @default "Use a different email" */
    back?: string;
}

export interface SignIn03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** The product's name at the top left, with its mark before it (an `<img>` or an inline SVG about 24px square). */
    brand: { name: ReactNode; logo?: ReactNode };
    /** A link at the top right, such as "Sign in with a password". */
    link?: BlockLink;
    /** The form's heading: "Sign in with email". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** Sends the link, once the address is valid. While its promise is pending the button shows a spinner; if it throws, its message shows under the field. Then the page says where the link went. */
    onSubmit?(email: string): void | Promise<void>;
    /** Sends another link from the second page; the button waits `cooldown` seconds after each one. */
    onResend?(email: string): void | Promise<void>;
    /** Seconds before another link can be sent.
     * @default 30 */
    cooldown?: number;
    /** The second page's line, given the address on a line of its own to put in it.
     * @default (email) => <>We sent a sign-in link to{email}It works once, for the next 15 minutes, on any device.</> */
    sentDescription?(email: ReactNode): ReactNode;
    /** Small print at the foot of the second page: where else to look for the email. */
    sentNote?: ReactNode;
    /** Words that aren't content (the field's label, the buttons, the messages), in English unless you pass your own. */
    labels?: SignIn03Labels;
}
