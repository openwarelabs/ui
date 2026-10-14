import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Onboarding02Labels {
    /** The progress strip's name for screen readers. @default "Setup" */
    progress?: string;
    /** The badge on a recommended choice. @default "Recommended" */
    recommended?: string;
    /** The button on the last page that goes back to the choice. @default "Start again" */
    startAgain?: string;
}

/** What a choice's page gets to move on with. */
export interface Onboarding02Controls {
    /** Back to the choice. */
    back(): void;
    /** On to the last page, given what was made: "billing-api". */
    finish(name: string): void;
}

/** One way to start, as a card, and the page it opens. */
export interface Onboarding02Choice {
    /** Names it for `onFinish`. */
    id: string;
    /** The card's title: "Use a template". */
    title: string;
    /** The card's line: what it gives you. */
    description: string;
    /** A 20px icon on the card. */
    icon?: ReactNode;
    /** Marks the card, with a badge in its corner. */
    recommended?: boolean;
    /** The heading of the page it opens: "Pick a template". */
    heading: ReactNode;
    /** A line under it. */
    lead?: ReactNode;
    /** The page's content: a small form or list on a card, with a Back button that calls `back` and an action that calls `finish`. */
    render(controls: Onboarding02Controls): ReactNode;
}

export interface Onboarding02Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The product's name at the top left, with its mark before it (an `<img>` or an inline SVG about 22px square). */
    brand: { name: ReactNode; logo?: ReactNode };
    /** The setup's steps along the top, and which one this is. On the last page the next one is current. */
    progress?: { steps: ReactNode[]; current: number };
    /** A quiet button at the top right: "Skip for now". */
    skip?: BlockAction;
    /** The choice's heading: "How do you want to start?". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** Two or three ways to start, as cards side by side. */
    choices: Onboarding02Choice[];
    /** A line under the cards, with a 16px icon first if you like. */
    note?: ReactNode;
    /** The last page's heading, given what was made. @default `${name} is ready` */
    doneTitle?(name: string): ReactNode;
    /** The last page's line: what comes next. */
    doneDescription?: ReactNode;
    /** The last page's button: "Invite your team". */
    doneAction?: BlockAction;
    /** Called when a choice's page finishes, with the choice's id and what was made. */
    onFinish?(choice: string, name: string): void;
    /** Words that aren't content (names for screen readers, the badge, a button), in English unless you pass your own. */
    labels?: Onboarding02Labels;
}
