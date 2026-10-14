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
    /** The link's words. */
    label: ReactNode;
    /** Where it goes. */
    href: string;
}

/** A link in a site's navigation. */
export interface HeaderLink {
    label: ReactNode;
    href: string;
    /** The page you're on: marked for screen readers (aria-current) and drawn as current. */
    current?: boolean;
}

/** A column of links in a footer, under a heading. */
export interface FooterColumn {
    /** The column's heading. */
    title: string;
    /** Its links. A link's badge ("New") shows after it. */
    links: Array<BlockLink & { badge?: ReactNode }>;
}

/** The product's name and logo, as a link home. */
export interface BlockBrand {
    /** The name beside the logo, or the wordmark. */
    name: ReactNode;
    /** Where it goes, usually "/". */
    href: string;
    /** A mark before the name: an `<img>` or an inline SVG about 20px square. */
    logo?: ReactNode;
}

export interface BlockActionButtonProps {
    action: BlockAction;
    variant: "primary" | "secondary" | "ghost";
    /** lg for heroes and calls to action, sm for headers.
     * @default "lg" */
    size?: "sm" | "md" | "lg";
    className?: string;
    /** Runs after the action's own onClick, such as closing a menu. */
    onAfterClick?(): void;
    /** Stretches it to its container's width. */
    fullWidth?: boolean;
}

export interface BlockActionsProps {
    primary: BlockAction;
    secondary?: BlockAction;
    className: string;
}

export interface BlockIconProps {
    size?: number;
    /** @default 2 */
    strokeWidth?: number;
}

export interface BlockBrandLinkProps {
    brand: BlockBrand;
    className: string;
}

export interface FooterColumnsProps {
    columns: FooterColumn[];
    headingClassName: string;
    listClassName: string;
    /** For a link's badge. */
    badgeClassName?: string;
}
