import type { HTMLAttributes, ReactNode } from "react";

import type { StepItem } from "@openwarelabs/ui";

import type { BlockBrand, BlockLink } from "@blocks/shared/shared.types";

/** The words that aren't content, in English unless you pass your own. */
export interface ErrorPage03Labels {
    /** The logo link's name, when the brand's name alone isn't clear: "Acme home". */
    home?: string;
    /** @default "Check again" */
    checkAgain?: string;
    /** The button that asks to hear when it's back. @default "Email me when it's back" */
    notify?: string;
    /** The same button once asked. @default "We'll email you" */
    notified?: string;
    /** The steps' heading. @default "Maintenance plan" */
    steps?: string;
}

export interface ErrorPage03Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The logo and name at the top left, linking home. */
    brand: BlockBrand;
    /** A link to the status page at the top right, with an arrow: "Status page". */
    statusLink?: BlockLink;
    /** A small amber badge above the title: "Planned maintenance". */
    badge?: ReactNode;
    /** The page's h1: "Acme is down for maintenance". */
    title: ReactNode;
    /** A sentence or two under it: what's happening, and that nothing is lost. */
    description?: ReactNode;
    /** When it'll be back, large beside a clock: "Back by 07:00 CET". */
    backTime?: ReactNode;
    /** A line under it: "Tuesday 14 Oct, about 40 minutes from now". */
    backDetail?: ReactNode;
    /**
     * Runs on Check again: load the page again. While its promise is pending the button shows a spinner.
     * @default () => window.location.reload()
     */
    onCheckAgain?(): void | Promise<void>;
    /** Signs them up to hear when it's back. Without it there's no button for that. */
    onNotify?(): void;
    /** The work, in order, as a list of steps beside the words. */
    steps?: StepItem[];
    /** The index of the step under way; the ones before it are done.
     * @default 0 */
    currentStep?: number;
    labels?: ErrorPage03Labels;
}
