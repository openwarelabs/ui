import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockBrand, BlockLink } from "@blocks/shared/shared.types";

/** The words that aren't content, in English unless you pass your own. */
export interface ErrorPage02Labels {
    /** The logo link's name, when the brand's name alone isn't clear: "Acme overview". */
    home?: string;
    /** @default "Try again" */
    retry?: string;
    /** The button while it tries. @default "Trying again…" */
    retrying?: string;
    /** The heading over how to report it. @default "If it keeps happening" */
    reportTitle?: string;
    /** @default "Error ID" */
    errorId?: string;
    /** The copy button's name. @default "Copy ID" */
    copy?: string;
    /** Added after `report` once someone has tried more than once. @default (count) => `You've tried ${count} times.` */
    tries?(count: number): string;
}

export interface ErrorPage02Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The logo and name at the top left, linking home. */
    brand: BlockBrand;
    /** A link to the status page at the top right, with an amber dot: "Some systems slow". */
    statusLink?: BlockLink;
    /** A small red badge above the title: "Error 500". */
    badge?: ReactNode;
    /** The page's h1: "Something went wrong on our side". */
    title: ReactNode;
    /** A sentence or two under it: that it isn't their fault, and that nothing is lost. */
    description?: ReactNode;
    /**
     * Runs on Try again: load the page again. While its promise is pending the button shows a spinner.
     * @default () => window.location.reload()
     */
    onRetry?(): void | Promise<void>;
    /** A second button beside Try again, such as "Go to overview". */
    homeAction?: BlockAction;
    /** How to report it, under the buttons: "Send this error ID to support@example.com…". */
    report?: ReactNode;
    /** The ID to quote to support, in a field with a copy button. */
    errorId?: string;
    /** A drawn picture beside the words, such as the request's path to the step that failed. Hidden below 880px. */
    visual?: ReactNode;
    labels?: ErrorPage02Labels;
}
