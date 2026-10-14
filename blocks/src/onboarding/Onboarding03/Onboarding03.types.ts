import type { HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface Onboarding03Labels {
    /** The button that closes it. @default "Continue" */
    continue?: string;
}

/** One change in the list. */
export interface Onboarding03Change {
    /** A 15px icon on a tinted square before it. */
    icon?: ReactNode;
    /** What changed: "One place for reviews". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
}

export interface Onboarding03Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** A short line over the title, after a brass dot: "October update". */
    eyebrow?: ReactNode;
    /** The dialog's title: "What's new in Acme". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** A picture over the list: a screenshot, a short video, or one drawn with components. */
    visual?: ReactNode;
    /** The changes, in order. */
    changes: Onboarding03Change[];
    /** A quiet link on the left of the button, such as "Read the changelog". */
    link?: BlockLink;
    /** Whether it's open, to control it from outside (from a "What's new" button, say). */
    open?: boolean;
    /** Whether it starts open, when `open` isn't given.
     * @default true */
    defaultOpen?: boolean;
    /** Called when it closes: by Continue, Escape or the backdrop. */
    onOpenChange?(open: boolean): void;
    /** Words that aren't content (the button), in English unless you pass your own. */
    labels?: Onboarding03Labels;
}
