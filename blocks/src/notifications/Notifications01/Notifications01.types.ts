import type { HTMLAttributes, ReactNode } from "react";

/** One notification in the popover. */
export interface Notifications01Item {
    /** Tells them apart. */
    id: string;
    /** Who it's from: a person's name, drawn as their Avatar. */
    from?: string;
    /** A 14–15px icon in a circle instead of an Avatar, for what the product sends itself (an agent, a deploy). */
    icon?: ReactNode;
    /** The icon's circle: the brand's tint, or red for something that failed.
     * @default "primary" */
    tone?: "primary" | "danger";
    /** What happened, with the names in bold: <><strong>Aoife O'Sullivan</strong> mentioned you in …</>. */
    message: ReactNode;
    /** @deprecated No longer used: an item is named by the text it shows. Kept so code from 0.10.0 still compiles. */
    summary?: string;
    /** A line or two quoted from a comment, clamped to two lines. */
    quote?: ReactNode;
    /** Where it happened: "billing-api". */
    where: string;
    /** When: "4 min ago". */
    when: string;
    /** It mentions you, so it's under Mentions too. */
    mention?: boolean;
    /** Not read yet: a brass dot, and counted on the bell. */
    unread?: boolean;
    /** Where it goes. Without one, opening it only marks it read. */
    href?: string;
}

/** The words that aren't content, in English unless you pass your own. */
export interface Notifications01Labels {
    /** The popover's heading and name. @default "Notifications" */
    title?: string;
    /** The bell's name. @default (unread) => unread ? `Notifications, ${unread} unread` : "Notifications" */
    bell?(unread: number): string;
    /** @default "Mark all as read" */
    markAllRead?: string;
    /** The tabs' name for screen readers. @default "Show" */
    tabs?: string;
    /** @default "All" */
    all?: string;
    /** @default "Mentions" */
    mentions?: string;
    /** Read out before an unread one. @default "Unread: " */
    unread?: string;
    /** When a tab has none. @default "Nothing here yet." */
    empty?: string;
    /** The link at the foot. @default "View all notifications" */
    viewAll?: string;
    /** The settings button's name. @default "Notification settings" */
    settings?: string;
}

export interface Notifications01Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The latest notifications, newest first. */
    notifications: Notifications01Item[];
    /** Runs when one is opened; it's marked read as it opens. */
    onOpen?(notification: Notifications01Item): void;
    /** Runs on Mark all as read. */
    onMarkAllRead?(): void;
    /** Where "View all notifications" goes. Without it there's no link. */
    viewAllHref?: string;
    /** Runs when the settings button at the foot is pressed. */
    onSettings?(): void;
    /** Starts with the popover open, without moving focus into it. */
    defaultOpen?: boolean;
    labels?: Notifications01Labels;
}

/** The list inside one tab. */
export interface Notifications01ListProps {
    items: Notifications01Item[];
    isUnread(item: Notifications01Item): boolean;
    onOpen(item: Notifications01Item): void;
    labels: Notifications01Labels;
}
