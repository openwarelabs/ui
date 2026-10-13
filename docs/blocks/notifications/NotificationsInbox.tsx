import { useState, type ReactNode } from "react";

import { Avatar, Badge, Button, Link, NavItem, NavList, Popover, ScrollShadow, Tab, TabList, TabPanel, Tabs, Text, type BadgeVariant } from "@openwarelabs/ui";
import { Bell, Bot, CheckCheck, Rocket, Settings } from "lucide-react";

import "./NotificationsInbox.css";

interface Notification {
    id: string;
    /** A person's name, or "agent" / "deploy" for the ones Acme sends itself. */
    from: string;
    what: ReactNode;
    /** Read out in place of `what`, which mixes plain text and bold names. */
    summary: string;
    quote?: string;
    where: string;
    when: string;
    mention?: boolean;
    unread?: boolean;
}

/** A name or a title inside a notification, in the text colour against the muted line. */
const Strong = ({ children }: { children: ReactNode }) => (
    <Text as="strong" variant="label" tone="default">
        {children}
    </Text>
);

const initial: Notification[] = [
    {
        id: "n1",
        from: "Clara Novak",
        what: (
            <>
                <Strong>Clara Novak</Strong> mentioned you in <Strong>Fix invoice dates in the EU</Strong>
            </>
        ),
        summary: "Clara Novak mentioned you in Fix invoice dates in the EU",
        quote: "@maya can you check the rounding on the Irish invoices before we merge?",
        where: "billing-api",
        when: "4 min ago",
        mention: true,
        unread: true,
    },
    {
        id: "n2",
        from: "agent",
        what: (
            <>
                <Strong>Agent</Strong> opened <Strong>#482 Add VAT to EU invoices</Strong> for your review
            </>
        ),
        summary: "Agent opened #482 Add VAT to EU invoices for your review",
        where: "billing-api",
        when: "12 min ago",
        unread: true,
    },
    {
        id: "n3",
        from: "deploy",
        what: (
            <>
                <Strong>Deploy failed</Strong> on <Strong>main</Strong>: tests failed in checkout.spec.ts
            </>
        ),
        summary: "Deploy failed on main: tests failed in checkout.spec.ts",
        where: "marketing-site",
        when: "26 min ago",
        unread: true,
    },
    {
        id: "n4",
        from: "Tomás Reyes",
        what: (
            <>
                <Strong>Tomás Reyes</Strong> approved <Strong>Pricing page copy</Strong>
            </>
        ),
        summary: "Tomás Reyes approved Pricing page copy",
        where: "marketing-site",
        when: "1 h ago",
    },
    {
        id: "n5",
        from: "Jonas Berg",
        what: (
            <>
                <Strong>Jonas Berg</Strong> mentioned you in <Strong>Release 2.4</Strong>
            </>
        ),
        summary: "Jonas Berg mentioned you in Release 2.4",
        quote: "The release notes are ready. @maya, can you sign them off by Thursday?",
        where: "mobile-app",
        when: "3 h ago",
        mention: true,
    },
    {
        id: "n6",
        from: "Aiko Tanaka",
        what: (
            <>
                <Strong>Aiko Tanaka</Strong> added Sam Okafor to <Strong>design-system</Strong>
            </>
        ),
        summary: "Aiko Tanaka added Sam Okafor to design-system",
        where: "design-system",
        when: "Yesterday",
    },
];

const deploys: Array<{ project: string; branch: string; status: string; tone: BadgeVariant }> = [
    { project: "marketing-site", branch: "main", status: "Failed", tone: "danger" },
    { project: "billing-api", branch: "fix/invoice-dates", status: "Building", tone: "active" },
    { project: "mobile-app", branch: "release/2.4", status: "Live", tone: "success" },
    { project: "docs", branch: "main", status: "Live", tone: "success" },
    { project: "design-system", branch: "feat/focus-rings", status: "Live", tone: "success" },
];

function Sender({ from }: { from: string }) {
    if (from === "agent") {
        return (
            <span className="notifications-inbox__agent" aria-hidden="true">
                <Bot size={15} />
            </span>
        );
    }
    if (from === "deploy") {
        return (
            <span className="notifications-inbox__agent notifications-inbox__agent--danger" aria-hidden="true">
                <Rocket size={14} />
            </span>
        );
    }
    return <Avatar name={from} size="md" />;
}

function NotificationList({ items, onOpen }: { items: Notification[]; onOpen: (id: string) => void }) {
    if (!items.length) {
        return (
            <Text tone="muted" align="center" className="notifications-inbox__empty">
                Nothing here yet.
            </Text>
        );
    }
    return (
        <ScrollShadow maxSize={320}>
            <ul className="notifications-inbox__list">
                {items.map((item) => (
                    <li key={item.id}>
                        {/* Each one opens the thing it's about; opening it marks it read. */}
                        <Link
                            href="#"
                            variant="standalone"
                            className="notifications-inbox__item"
                            aria-label={`${item.unread ? "Unread: " : ""}${item.summary}, ${item.where}, ${item.when}`}
                            onClick={(event) => {
                                event.preventDefault();
                                onOpen(item.id);
                            }}
                        >
                            <Sender from={item.from} />
                            <span className="notifications-inbox__text">
                                <Text as="span" tone="muted">
                                    {item.what}
                                </Text>
                                {item.quote ? (
                                    <Text variant="caption" tone="soft" className="notifications-inbox__quote">
                                        {item.quote}
                                    </Text>
                                ) : null}
                                <Text variant="caption">
                                    {item.where} · {item.when}
                                </Text>
                            </span>
                            {item.unread ? <span className="notifications-inbox__unread" /> : null}
                        </Link>
                    </li>
                ))}
            </ul>
        </ScrollShadow>
    );
}

export function NotificationsInbox() {
    const [items, setItems] = useState(initial);
    const [tab, setTab] = useState("all");
    // Open on load for the preview without pulling focus into it; once someone opens it, focus moves in.
    const [focusOnOpen, setFocusOnOpen] = useState(false);

    const unread = items.filter((item) => item.unread).length;
    const mentions = items.filter((item) => item.mention);
    const unreadMentions = mentions.filter((item) => item.unread).length;

    const open = (id: string) => setItems((list) => list.map((item) => (item.id === id ? { ...item, unread: false } : item)));
    const markAllRead = () => setItems((list) => list.map((item) => ({ ...item, unread: false })));

    return (
        <div className="notifications-inbox">
            <header className="notifications-inbox__bar">
                <Text variant="card-title" as="span" className="notifications-inbox__brand">
                    <span className="notifications-inbox__mark" aria-hidden="true" />
                    Acme
                </Text>
                <NavList label="Main" orientation="horizontal" className="notifications-inbox__nav">
                    {["Projects", "Reviews", "Deploys", "Agents"].map((item) => (
                        <NavItem key={item} href="#" active={item === "Deploys"}>
                            {item}
                        </NavItem>
                    ))}
                </NavList>

                <Popover
                    defaultOpen
                    autoFocus={focusOnOpen}
                    onOpenChange={(open) => open || setFocusOnOpen(true)}
                    placement="bottom-end"
                    width="min(400px, calc(100vw - 16px))"
                    aria-label="Notifications"
                    className="notifications-inbox__popover"
                    trigger={
                        <Button
                            className="notifications-inbox__bell"
                            variant="ghost"
                            iconOnly
                            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
                        >
                            <Bell size={18} />
                            {unread ? (
                                <Badge className="notifications-inbox__count" size="sm" variant="active" aria-hidden="true">
                                    {unread}
                                </Badge>
                            ) : null}
                        </Button>
                    }
                >
                    <div className="notifications-inbox__head">
                        <Text variant="card-title" as="h2">
                            Notifications
                        </Text>
                        <Button variant="ghost" size="sm" startIcon={<CheckCheck size={16} />} disabled={!unread} onClick={markAllRead}>
                            Mark all as read
                        </Button>
                    </div>

                    <Tabs className="notifications-inbox__tabs" variant="line" value={tab} onValueChange={setTab}>
                        <TabList aria-label="Show">
                            <Tab value="all">
                                All
                                {unread ? (
                                    <Badge size="sm" className="notifications-inbox__tab-count">
                                        {unread}
                                    </Badge>
                                ) : null}
                            </Tab>
                            <Tab value="mentions">
                                Mentions
                                {unreadMentions ? (
                                    <Badge size="sm" className="notifications-inbox__tab-count">
                                        {unreadMentions}
                                    </Badge>
                                ) : null}
                            </Tab>
                        </TabList>
                        <TabPanel value="all">
                            <NotificationList items={items} onOpen={open} />
                        </TabPanel>
                        <TabPanel value="mentions">
                            <NotificationList items={mentions} onOpen={open} />
                        </TabPanel>
                    </Tabs>

                    <div className="notifications-inbox__foot">
                        <Link href="#" variant="standalone">
                            View all notifications
                        </Link>
                        <Button variant="ghost" size="sm" iconOnly aria-label="Notification settings">
                            <Settings size={16} />
                        </Button>
                    </div>
                </Popover>
                <Avatar className="notifications-inbox__me" name="Maya Chen" size="sm" label="Maya Chen" />
            </header>

            <main className="notifications-inbox__panel">
                <div>
                    <Text variant="heading" as="h1">
                        Deploys
                    </Text>
                    <Text variant="copy" className="notifications-inbox__page-subtitle">
                        Every deploy across your projects, newest first.
                    </Text>
                </div>
                <ul className="notifications-inbox__deploys">
                    {deploys.map((deploy) => (
                        <li key={deploy.project} className="notifications-inbox__deploy">
                            <Text variant="label">{deploy.project}</Text>
                            <Text variant="code" tone="muted" className="notifications-inbox__branch">
                                {deploy.branch}
                            </Text>
                            <Badge size="sm" variant={deploy.tone}>
                                {deploy.status}
                            </Badge>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
