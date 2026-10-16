import type { HTMLAttributes, ReactNode } from "react";

import type { BadgeVariant } from "@openwarelabs/ui";

import type { BlockAction } from "@blocks/shared/shared.types";

/** Whether the list loaded: the error, the spinner while trying again, or the list. */
export type Empty03Status = "failed" | "loading" | "loaded";

/** One row of the list, once it loads. */
export interface Empty03Item {
    /** Tells the rows apart. Defaults to the row's place in the list. */
    id?: string;
    /** A 15px icon in a circle at the start of the row. */
    icon?: ReactNode;
    /** The row's main line. */
    title: ReactNode;
    /** A caption under it: "billing-api · for Ciarán Kelly". */
    meta?: ReactNode;
    /** A short figure on the right, such as how long it took. Hidden on phones. */
    time?: ReactNode;
    /** A badge at the end of the row. */
    status?: { label: ReactNode; tone?: BadgeVariant };
}

/** A view of the list in the card's segmented control. */
export interface Empty03View {
    value: string;
    label: string;
    /** Which rows it shows. Leave it out for all of them. */
    match?(item: Empty03Item): boolean;
}

/** The words that aren't content, in English unless you pass your own. */
export interface Empty03Labels {
    /** @default "Try again" */
    retry?: string;
    /** Beside the spinner. @default "Loading…" */
    loading?: string;
    /** The views' name for screen readers. @default "Show" */
    views?: string;
    /** The list's name for screen readers. Defaults to the card's title. */
    list?: string;
}

export interface Empty03Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The page's heading: "Agent runs". */
    title: ReactNode;
    /** A sentence under it. */
    description?: ReactNode;
    /** The card's heading: "Today". */
    cardTitle: ReactNode;
    /** Views of the list, as a segmented control in the card's corner. Off until the list loads. */
    views?: Empty03View[];
    /** The rows, once the list loads. */
    items: Empty03Item[];
    /** Whether the list loaded, for controlled use. */
    status?: Empty03Status;
    /** Where it starts, when it isn't controlled.
     * @default "failed" */
    defaultStatus?: Empty03Status;
    /** Runs on Try again: fetch the list again. While its promise is pending the card shows a spinner; once it resolves
     * the list shows, and if it throws the error comes back. */
    onRetry?(): void | Promise<void>;
    /** The error's 20px icon. @default a cloud with a line through it */
    errorIcon?: ReactNode;
    /** What didn't load: "Couldn't load agent runs". */
    errorTitle: ReactNode;
    /** What went wrong, and what still works. */
    errorDescription?: ReactNode;
    /** A status and request ID for support, in code under the description: "504 · req_8f2c41d9". */
    errorDetail?: ReactNode;
    /** A second button beside Try again, such as "Check status". */
    secondaryAction?: BlockAction;
    labels?: Empty03Labels;
}
