import type { HTMLAttributes, ReactNode } from "react";

import type { BlockBrand, BlockLink, FooterColumn } from "@blocks/shared/shared.types";

export interface Footer03Labels {
    /** The logo link's name. @default `${brand.name} home`, when the name is text */
    home?: string;
    /** The field's accessible name. @default "Email address" */
    email?: string;
    /** @default "you@example.com" */
    placeholder?: string;
    /** The button that brings the form back. @default "Change" */
    change?: string;
    /** @default "Enter your email address." */
    empty?: string;
    /** @default "That doesn't look like an email address. Check it for a typo." */
    invalid?: string;
    /** Shown when `onSubmit` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
}

/** The sign-up at the top of the footer. */
export interface Footer03Newsletter {
    /** The sign-up's heading. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The button's words: "Subscribe". */
    submitLabel: ReactNode;
    /** An icon after them, such as an arrow. */
    submitIcon?: ReactNode;
    /** Adds the address to your list. While its promise is pending the button shows a spinner; if it throws, its message shows under the field. */
    onSubmit(email: string): void | Promise<void>;
    /** A line under the field: "One email a month. Unsubscribe whenever you like." */
    note?: ReactNode;
    /** What replaces the form once they've signed up: "Check your inbox". */
    successTitle: ReactNode;
    /** A line beside it, given their address. */
    successDescription?(email: string): ReactNode;
}

export interface Footer03Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** The sign-up across the top. */
    newsletter: Footer03Newsletter;
    /** The logo and name, linking home. */
    brand: BlockBrand;
    /** A line under the logo. */
    description?: ReactNode;
    /** Columns of links beside the brand. */
    columns: FooterColumn[];
    /** The small print at the bottom left. */
    legal: ReactNode;
    /** Links on the right of it: "Privacy", "Terms". */
    legalLinks?: BlockLink[];
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Footer03Labels;
}
