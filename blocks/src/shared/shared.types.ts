import type { MouseEvent, ReactNode } from "react";

import type { BadgeVariant, Command, TableColumn } from "@openwarelabs/ui";

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
    className?: string;
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

/** A way in with another account, such as GitHub or Google, as a button above the email form. */
export interface SignInProvider {
    /** Passed back to `onProviderSelect`: "github", "google". */
    id: string;
    /** The button's words: "Continue with GitHub". */
    label: ReactNode;
    /** A 16px mark before them. */
    icon?: ReactNode;
}

/** One choice in a menu of actions. */
export interface BlockMenuItem {
    /** The item's words: name the action, in sentence case ("Archive project"). */
    label: ReactNode;
    /** A 15px icon before the label, usually from lucide-react. */
    icon?: ReactNode;
    /** What it does; the menu closes after it. */
    onSelect?(): void;
    /** Shows the item greyed out, so it can't be chosen right now. */
    disabled?: boolean;
    /** Red, for actions that delete or can't be undone. */
    destructive?: boolean;
    /** Draws a line above the item, starting a new group. */
    separatorBefore?: boolean;
}

/** A button in an app's page: a page's primary action, a toolbar's button. */
export interface BlockButton {
    /** The button's words: name the action ("Deploy", "Invite people"). */
    label: ReactNode;
    /** A 16px icon before the label, usually from lucide-react. */
    icon?: ReactNode;
    /** What it does. */
    onClick?(): void;
    /** Shows it greyed out. */
    disabled?: boolean;
    /** Shows a spinner while what it started is under way. */
    loading?: boolean;
}

/** A status shown as a badge: "Live", "Needs review". */
export interface BlockStatus {
    /** The badge's words. */
    label: ReactNode;
    /** Its colour: success, warning, danger, active (in progress) or neutral.
     * @default "neutral" */
    tone?: BadgeVariant;
}

/** A place in an app's navigation. */
export interface AppNavItem {
    /** Unique in the navigation; what `current` and `onNavigate` use. */
    id: string;
    /** Its name, as the item shows it. */
    label: string;
    /** A 15px icon before the label, usually from lucide-react, or a small coloured dot for a project. */
    icon?: ReactNode;
    /** A count or a badge at the item's end: unread messages, open reviews. */
    count?: ReactNode;
    /** Makes the item a link to this address instead of a button. */
    href?: string;
}

/** A group of places in an app's navigation, under an optional heading. */
export interface AppNavGroup {
    /** Names the group for screen readers ("Workspace", "Projects"). */
    label: string;
    /** A small heading shown above the group. */
    heading?: ReactNode;
    /** Its places, in order. */
    items: AppNavItem[];
}

/** A workspace the person can switch to, in the workspace menu. */
export interface AppWorkspace {
    /** Its name. */
    name: string;
    /** The one they're in: ticked in the menu. */
    current?: boolean;
    /** Switches to it. */
    onSelect?(): void;
}

/** The person who's signed in. */
export interface AppAccount {
    /** Their name; its initials show when there's no picture. */
    name: string;
    /** Their email address, under the name. */
    email?: string;
    /** A photo URL. */
    avatar?: string;
}

/** A choice in an app shell's menus. With `page`, choosing it opens that place, as a navigation item would. */
export interface AppMenuItem extends BlockMenuItem {
    /** The id of the place it opens ("settings"): it becomes current and the phone drawer closes. */
    page?: string;
}

/** A command in an app shell's search (⌘K). With `page`, running it opens that place. */
export interface AppCommand extends Omit<Command, "run"> {
    /** What it does. */
    run?(): void;
    /** The id of the place it opens: it becomes current and the phone drawer closes. */
    page?: string;
}

export interface BlockMenuItemsProps {
    items: BlockMenuItem[];
    /** Runs after an item's own onSelect. */
    onAfterSelect?(item: BlockMenuItem): void;
}

/** A column of a block's table: a Table column that can step aside on smaller screens. */
export interface BlockTableColumn<Row> extends TableColumn<Row> {
    /** Hides the column under 1024px wide ("tablet") or under 760px ("phone"), to keep the table readable there. */
    hideBelow?: "tablet" | "phone";
}

export interface AppShellStateOptions {
    current?: string;
    defaultCurrent?: string;
    onNavigate?(id: string): void;
    commands?: AppCommand[];
}

export interface AppWorkspaceItemsProps {
    workspaces: AppWorkspace[];
    onNewWorkspace?(): void;
    /** The menu's heading. */
    heading: ReactNode;
    /** The last item's words. */
    newWorkspace: ReactNode;
    /** Keeps the unticked workspaces' names in line with the ticked one's. */
    spacerClassName: string;
}
