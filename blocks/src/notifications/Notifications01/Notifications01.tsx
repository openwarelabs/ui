import { useState } from "react";

import { Avatar, Badge, Button, cx, Link, Popover, ScrollShadow, Tab, TabList, TabPanel, Tabs, Text } from "@openwarelabs/ui";

import { BellIcon, CheckCheckIcon, SettingsIcon } from "@blocks/shared/icons";
import type { Notifications01Item, Notifications01ListProps, Notifications01Props } from "./Notifications01.types";

function Sender({ item }: { item: Notifications01Item }) {
    if (item.icon) {
        return (
            <span className={cx("ow-notifications01__agent", item.tone === "danger" && "ow-notifications01__agent--danger")} aria-hidden="true">
                {item.icon}
            </span>
        );
    }
    return <Avatar name={item.from ?? ""} size="md" />;
}

function NotificationList({ items, isUnread, onOpen, labels }: Notifications01ListProps) {
    if (!items.length) {
        return (
            <Text tone="muted" align="center" className="ow-notifications01__empty">
                {labels.empty ?? "Nothing here yet."}
            </Text>
        );
    }
    return (
        <ScrollShadow maxSize={320}>
            <ul className="ow-notifications01__list">
                {items.map((item) => {
                    const unread = isUnread(item);
                    return (
                        <li key={item.id}>
                            {/* Each one opens the thing it's about; opening it marks it read. */}
                            <Link
                                href={item.href ?? "#"}
                                variant="standalone"
                                className="ow-notifications01__item"
                                aria-label={`${unread ? (labels.unread ?? "Unread: ") : ""}${item.summary}, ${item.where}, ${item.when}`}
                                onClick={(event) => {
                                    if (item.href === undefined) event.preventDefault();
                                    onOpen(item);
                                }}
                            >
                                <Sender item={item} />
                                <span className="ow-notifications01__text">
                                    <Text as="span" tone="muted">
                                        {item.message}
                                    </Text>
                                    {item.quote ? (
                                        <Text variant="caption" tone="soft" className="ow-notifications01__quote">
                                            {item.quote}
                                        </Text>
                                    ) : null}
                                    <Text variant="caption">
                                        {item.where} · {item.when}
                                    </Text>
                                </span>
                                {unread ? <span className="ow-notifications01__unread" /> : null}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </ScrollShadow>
    );
}

/** A bell with the unread count that opens the latest notifications, in All and Mentions tabs, with Mark all as read. */
export function Notifications01({
    notifications,
    onOpen,
    onMarkAllRead,
    viewAllHref,
    onSettings,
    defaultOpen = false,
    labels = {},
    className,
    ...props
}: Notifications01Props) {
    // The ones read here, on top of what came in already read.
    const [read, setRead] = useState<ReadonlySet<string>>(() => new Set());
    const [tab, setTab] = useState("all");
    // Opened on load, it doesn't pull focus into it; once someone opens it, focus moves in.
    const [focusOnOpen, setFocusOnOpen] = useState(!defaultOpen);

    const isUnread = (item: Notifications01Item) => Boolean(item.unread) && !read.has(item.id);
    const unread = notifications.filter(isUnread).length;
    const mentions = notifications.filter((item) => item.mention);
    const unreadMentions = mentions.filter(isUnread).length;

    const open = (item: Notifications01Item) => {
        setRead((current) => new Set(current).add(item.id));
        onOpen?.(item);
    };
    const markAllRead = () => {
        setRead(new Set(notifications.map((item) => item.id)));
        onMarkAllRead?.();
    };

    const title = labels.title ?? "Notifications";

    return (
        <div className={cx("ow-notifications01", className)} {...props}>
            <Popover
                defaultOpen={defaultOpen}
                autoFocus={focusOnOpen}
                onOpenChange={(isOpen) => isOpen || setFocusOnOpen(true)}
                placement="bottom-end"
                width="min(400px, calc(100vw - 16px))"
                aria-label={title}
                className="ow-notifications01__popover"
                trigger={
                    <Button
                        className="ow-notifications01__bell"
                        variant="ghost"
                        iconOnly
                        aria-label={labels.bell ? labels.bell(unread) : unread ? `Notifications, ${unread} unread` : "Notifications"}
                    >
                        <BellIcon size={18} />
                        {unread ? (
                            <Badge className="ow-notifications01__count" size="sm" variant="active" aria-hidden="true">
                                {unread}
                            </Badge>
                        ) : null}
                    </Button>
                }
            >
                <div className="ow-notifications01__head">
                    <Text variant="card-title" as="h2">
                        {title}
                    </Text>
                    <Button variant="ghost" size="sm" startIcon={<CheckCheckIcon size={16} />} disabled={!unread} onClick={markAllRead}>
                        {labels.markAllRead ?? "Mark all as read"}
                    </Button>
                </div>

                <Tabs className="ow-notifications01__tabs" variant="line" value={tab} onValueChange={setTab}>
                    <TabList aria-label={labels.tabs ?? "Show"}>
                        <Tab value="all">
                            {labels.all ?? "All"}
                            {unread ? (
                                <Badge size="sm" className="ow-notifications01__tab-count">
                                    {unread}
                                </Badge>
                            ) : null}
                        </Tab>
                        <Tab value="mentions">
                            {labels.mentions ?? "Mentions"}
                            {unreadMentions ? (
                                <Badge size="sm" className="ow-notifications01__tab-count">
                                    {unreadMentions}
                                </Badge>
                            ) : null}
                        </Tab>
                    </TabList>
                    <TabPanel value="all">
                        <NotificationList items={notifications} isUnread={isUnread} onOpen={open} labels={labels} />
                    </TabPanel>
                    <TabPanel value="mentions">
                        <NotificationList items={mentions} isUnread={isUnread} onOpen={open} labels={labels} />
                    </TabPanel>
                </Tabs>

                <div className="ow-notifications01__foot">
                    {viewAllHref !== undefined ? (
                        <Link href={viewAllHref} variant="standalone">
                            {labels.viewAll ?? "View all notifications"}
                        </Link>
                    ) : (
                        <span />
                    )}
                    <Button variant="ghost" size="sm" iconOnly aria-label={labels.settings ?? "Notification settings"} onClick={onSettings}>
                        <SettingsIcon size={16} />
                    </Button>
                </div>
            </Popover>
        </div>
    );
}
