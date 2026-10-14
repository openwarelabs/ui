import type { MouseEvent, ReactNode } from "react";

/**
 * A call to action. With `href` it's a link styled as a button, so it works with any router's links as an
 * ordinary <a>; without one it's a button that runs `onClick`.
 */
export interface BlockAction {
    /** The button's words: name the action, in sentence case ("Start for free", never "Click here"). */
    label: ReactNode;
    /** Where it goes. Makes it a link. */
    href?: string;
    /** What it does, for a button (or as well as following the link). */
    onClick?(event: MouseEvent<HTMLElement>): void;
    /** A 16px icon before the label, usually from lucide-react. */
    startIcon?: ReactNode;
    /** A 16px icon after the label, such as an arrow. */
    endIcon?: ReactNode;
    /** For links: "_blank" opens a new tab (with rel="noopener noreferrer" added). */
    target?: string;
    /** Read out instead of the label, when the label alone isn't clear. */
    "aria-label"?: string;
}

/** A plain text link. */
export interface BlockLink {
    label: ReactNode;
    href: string;
}

export interface BlockActionButtonProps {
    action: BlockAction;
    variant: "primary" | "secondary";
}

export interface BlockActionsProps {
    primary: BlockAction;
    secondary?: BlockAction;
    className: string;
}

export interface BlockIconProps {
    size?: number;
}
