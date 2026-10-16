import type { MouseEvent, ReactElement, ReactNode } from "react";

export interface NotificationItem {
    /** Unique among the items. */
    id: string;
    /** What happened, in a line: "Aoife mentioned you in Pricing". It names the item for screen readers. */
    title: ReactNode;
    /** A second line: a quote, or where it happened. */
    description?: ReactNode;
    /** When it happened: a Date or an ISO string. It shows as "5 min ago", with the full date on hover. */
    time: Date | string;
    /** Seen already. Unread items are bold, with a dot and a hidden "Unread" for screen readers. */
    read?: boolean;
    /** Who it's from, usually an `<Avatar>`. Hidden from screen readers: say who in the title. */
    avatar?: ReactNode;
    /** A 16px icon on a round tile, for things no person did (a deploy, a reminder), when there's no avatar. */
    icon?: ReactNode;
    /** Makes the item a link to what it's about. Without it, the item is a button. */
    href?: string;
    /** A button or two beside the item, such as Accept and Decline. They sit outside the item's own link. */
    actions?: ReactNode;
    /** The heading it's listed under. Set it to group by your own sections; it wins over `groupByDay`. */
    group?: string;
}

export interface NotificationLabels {
    /** The popover's heading and name. @default "Notifications" */
    title?: string;
    /** The bell's name with the count. @default (unread) => unread ? `Notifications, ${unread} unread` : "Notifications" */
    trigger?(unread: number): string;
    /** @default "Mark all as read" */
    markAllRead?: string;
    /** The tab list's name. @default "Show" */
    filter?: string;
    /** @default "All" */
    all?: string;
    /** @default "Unread" */
    unreadTab?: string;
    /** Read before each unread item. @default "Unread" */
    unread?: string;
    /** The ✕ on each item, followed by its title. @default "Dismiss" */
    dismiss?: string;
    /** Said once when new ones arrive while it's closed. @default (count) => count === 1 ? "1 new notification" : `${count} new notifications` */
    announce?(count: number): string;
    /** @default "Today" */
    today?: string;
    /** @default "Yesterday" */
    yesterday?: string;
    /** @default "Earlier" */
    earlier?: string;
    /** The empty list's title. @default "You're all caught up" */
    empty?: string;
    /** The empty Unread tab's title. @default "No unread notifications" */
    emptyUnread?: string;
}

export interface NotificationListProps {
    /** The notifications, newest first. */
    items: NotificationItem[];
    /** Called with an unread item's id when it's opened. */
    onRead?(id: string): void;
    /** Shows a ✕ on each item that calls this with its id; remove the item from `items`. */
    onDismiss?(id: string): void;
    /** Called when an item is clicked, before its link is followed. */
    onItemClick?(item: NotificationItem, event: MouseEvent<HTMLElement>): void;
    /** Lists the items under Today, Yesterday and Earlier. An item's own `group` wins.
     * @default false */
    groupByDay?: boolean;
    /** What shows when there are no items.
     * @default an EmptyState saying "You're all caught up" */
    empty?: ReactNode;
    /** The locale for "5 min ago" and dates. Defaults to the browser's. */
    locale?: string;
    /** The words it uses, for other languages. */
    labels?: NotificationLabels;
    /** Names the list for screen readers, when it has no heading of its own. */
    "aria-label"?: string;
    className?: string;
}

export interface NotificationCenterProps extends Omit<NotificationListProps, "aria-label"> {
    /** Called when "Mark all as read" is pressed; mark every item read. */
    onReadAll?(): void;
    /** Shown, when you control it. */
    open?: boolean;
    /** Shown at first, when it controls itself. Opened on load, it doesn't pull focus into it.
     * @default false */
    defaultOpen?: boolean;
    /** Called when it opens or closes. */
    onOpenChange?(open: boolean): void;
    /** All and Unread tabs above the list.
     * @default true */
    tabs?: boolean;
    /** The tab showing, when you control it. */
    filter?: NotificationFilter;
    /** The tab it starts on, when it controls itself.
     * @default "all" */
    defaultFilter?: NotificationFilter;
    /** Called when the tab changes. */
    onFilterChange?(filter: NotificationFilter): void;
    /** Under the list, such as a "View all" link to a full page. */
    footer?: ReactNode;
    /** The badge shows "9+" above this.
     * @default 9 */
    maxCount?: number;
    /** Your own button in place of the bell. Give it an aria-label with the unread count. */
    trigger?: ReactElement;
    /** Pixels, or any CSS width. It never gets wider than the window, less a margin.
     * @default 380 */
    width?: number | string;
}

/** Which items a NotificationCenter lists. */
export type NotificationFilter = "all" | "unread";

/** Internal: a run of items under one heading. */
export interface NotificationGroup {
    key: string;
    label?: string;
    items: NotificationItem[];
}

/** Internal: one row of the list. */
export interface NotificationRowProps {
    item: NotificationItem;
    /** "5 min ago", or the date when it's older than a week. */
    relative: string;
    /** The full date and time, for the hover title. */
    full: string;
    /** The machine-readable time, for `<time dateTime>`. */
    iso?: string;
    labels: NotificationLabels;
    onRead?(id: string): void;
    onDismiss?(id: string): void;
    onItemClick?(item: NotificationItem, event: MouseEvent<HTMLElement>): void;
}
