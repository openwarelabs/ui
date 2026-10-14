import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Onboarding01Labels {
    /** The progress bar's label. @default "Setup" */
    progress?: string;
    /** The button that starts the checklist again, once it's done. @default "Run setup again" */
    restart?: string;
}

/** One step of the checklist. */
export interface Onboarding01Step {
    /** What to do: "Invite your team". */
    title: ReactNode;
    /** A line under it, while it isn't done. */
    description?: ReactNode;
    /** The button beside the step while it's the current one: "Invite people". */
    actionLabel: ReactNode;
    /** Does the step: opens the invite dialog, the issue picker and so on. While its promise is pending the button shows a spinner; when it resolves the step is ticked off and the next one opens. */
    onAction?(): void | Promise<void>;
}

export interface Onboarding01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line over the heading, after a brass dot: "Getting started". */
    eyebrow?: ReactNode;
    /** The heading while there are steps to do: "Get Acme ready for your team". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The heading once every step is done. @default the title */
    finishedTitle?: ReactNode;
    /** The line under it then. @default the description */
    finishedDescription?: ReactNode;
    /** The steps, in order. */
    steps: Onboarding01Step[];
    /** The heading over the checklist, with a "2 of 5 done" count beside it. */
    stepsTitle?: ReactNode;
    /** How many steps are already done when it opens.
     * @default 0 */
    defaultCompleted?: number;
    /** Called with a step's index once it's done. */
    onStepComplete?(index: number): void;
    /** Under the progress while there are steps to do: where to get help. */
    help?: ReactNode;
    /** The button once every step is done: "Go to overview". */
    finishedAction?: BlockAction;
    /** Words that aren't content (the progress bar's label, the restart button), in English unless you pass your own. */
    labels?: Onboarding01Labels;
}
