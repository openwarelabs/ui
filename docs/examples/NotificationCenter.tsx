import { useState } from "react";

import {
    Avatar,
    Button,
    Link,
    NotificationCenter,
    NotificationList,
    SiteHeader,
    Stack,
    Text,
    type NotificationItem,
} from "@openwarelabs/ui";
import { CalendarClock, Rocket, UserPlus } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "NotificationCenter",
    category: "Overlays",
    description:
        "A bell with the unread count that opens the latest notifications in a popover, with All and Unread tabs, Mark all as read and a link to the rest. NotificationList is the same list on its own, for a full page.",
    source: "components/NotificationCenter/NotificationCenter.tsx",
    imports: ["NotificationCenter", "NotificationList"],
    props: ["NotificationCenterProps", "NotificationItem", "NotificationListProps", "NotificationLabels"],
    keyboard: [
        ["Enter / Space", "On the bell, opens the inbox and moves focus into it."],
        ["Tab", "Moves through Mark all as read, the tabs and each notification; tabbing past the end closes it."],
        ["Left / Right", "Switch between All and Unread, on the tabs."],
        ["Escape", "Closes it, and focus goes back to the bell."],
    ],
    notes: [
        'The bell is named with the count, "Notifications, 3 unread". The badge shows up to maxCount (9), then "9+".',
        'The popover is a non-modal dialog named "Notifications". Each notification is a link (with href) or a button, in a list; unread ones start with a hidden "Unread" as well as the dot.',
        "New unread notifications that arrive while it's closed update the badge and are announced once, politely: \"2 new notifications\".",
        'Times show as "5 min ago" (Intl.RelativeTimeFormat, in the locale you pass), and as a date after a week. The full date and time is on the <time> element\'s title.',
        "It marks items read and dismissed itself as people use it, and calls onRead, onReadAll and onDismiss so you can save that; keep items in step from there.",
        "Opening a notification closes the popover. Actions you add to an item (Accept, Decline) sit beside its link, not inside it.",
        "On a phone the popover spans the width of the screen, less 8px each side, and only the list scrolls.",
    ],
    related: ["Popover", "Badge", "EmptyState", "Tabs"],
    since: "0.16.0",
};

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000);

const inbox: NotificationItem[] = [
    {
        id: "1",
        title: "Clara Novak mentioned you in Fix invoice dates",
        description: "@maya can you check the rounding on the Irish invoices?",
        time: minutesAgo(4),
        avatar: <Avatar name="Clara Novak" />,
        href: "#/components/notification-center",
    },
    {
        id: "2",
        title: "Deploy failed on main",
        description: "Tests failed in checkout.spec.ts",
        time: minutesAgo(26),
        icon: <Rocket size={15} />,
        href: "#/components/notification-center",
    },
    {
        id: "3",
        title: "Tomás Reyes approved Pricing page copy",
        time: minutesAgo(70),
        avatar: <Avatar name="Tomás Reyes" />,
        href: "#/components/notification-center",
    },
    {
        id: "4",
        title: "Aiko Tanaka added you to design-system",
        time: minutesAgo(60 * 27),
        avatar: <Avatar name="Aiko Tanaka" />,
        read: true,
        href: "#/components/notification-center",
    },
];

/** A bell with three unread. Opening one marks it read; the footer links to the full page. */
export function Basic() {
    return (
        <NotificationCenter
            items={inbox}
            footer={
                <Link href="#/components/notification-center" variant="standalone">
                    View all notifications
                </Link>
            }
        />
    );
}
Basic.layout = { minHeight: 520, align: "start" as const };

/** Grouped by day, with actions on an invite and a ✕ to dismiss each one. It opens on the Unread tab. */
export function Grouped() {
    const [items, setItems] = useState<NotificationItem[]>([
        ...inbox,
        {
            id: "5",
            title: "Sam Okafor invited you to billing-api",
            time: minutesAgo(12),
            icon: <UserPlus size={15} />,
            actions: (
                <>
                    <Button size="sm" variant="primary" onClick={() => setItems((all) => all.filter((item) => item.id !== "5"))}>
                        Accept
                    </Button>
                    <Button size="sm" onClick={() => setItems((all) => all.filter((item) => item.id !== "5"))}>
                        Decline
                    </Button>
                </>
            ),
        },
        {
            id: "6",
            title: "Your trial ends in 3 days",
            time: minutesAgo(60 * 24 * 4),
            icon: <CalendarClock size={15} />,
            read: true,
        },
    ]);
    return (
        <NotificationCenter
            items={[...items].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())}
            groupByDay
            defaultFilter="unread"
            onDismiss={(id) => setItems((all) => all.filter((item) => item.id !== id))}
        />
    );
}
Grouped.layout = { minHeight: 560, align: "start" as const };

/** With nothing in it, it says so; pass `empty` for your own words. */
export function Empty() {
    return <NotificationCenter items={[]} tabs={false} />;
}
Empty.layout = { minHeight: 320, align: "start" as const };

/** NotificationList on its own, for a page of every notification, grouped by day. */
export function FullPage() {
    const [items, setItems] = useState(inbox);
    const read = (id: string) => setItems((all) => all.map((item) => (item.id === id ? { ...item, read: true } : item)));
    return (
        <Stack gap="md" style={{ width: "100%", maxWidth: 560, marginInline: "auto" }}>
            <Stack direction="row" justify="between" align="center">
                <Text variant="heading" as="h2">
                    Notifications
                </Text>
                <Button size="sm" variant="ghost" onClick={() => setItems((all) => all.map((item) => ({ ...item, read: true })))}>
                    Mark all as read
                </Button>
            </Stack>
            <NotificationList
                items={items.map((item) => ({ ...item, href: undefined }))}
                groupByDay
                onRead={read}
                onDismiss={(id) => setItems((all) => all.filter((item) => item.id !== id))}
            />
        </Stack>
    );
}
FullPage.layout = { fill: true, align: "start" as const };

/** In a site header, beside the account. "Send one" adds a notification while it's closed: the badge updates and it's announced. */
export function InHeader() {
    const [items, setItems] = useState(inbox.slice(0, 3));
    const send = () =>
        setItems((all) => [
            {
                id: String(Date.now()),
                title: "Jonas Berg commented on Release 2.4",
                time: new Date(),
                avatar: <Avatar name="Jonas Berg" />,
            },
            ...all,
        ]);
    return (
        <Stack gap="lg" style={{ width: "100%" }}>
            <SiteHeader
                brand={<Text variant="card-title" as="span">Acme</Text>}
                nav={
                    <>
                        <Link variant="standalone" href="#/components/notification-center">
                            Projects
                        </Link>
                        <Link variant="standalone" href="#/components/notification-center">
                            Deploys
                        </Link>
                    </>
                }
                actions={
                    <Stack direction="row" gap="sm" align="center">
                        <NotificationCenter
                            items={items}
                            onReadAll={() => setItems((all) => all.map((item) => ({ ...item, read: true })))}
                            onRead={(id) => setItems((all) => all.map((item) => (item.id === id ? { ...item, read: true } : item)))}
                        />
                        <Avatar name="Maya Chen" size="sm" label="Maya Chen" />
                    </Stack>
                }
            />
            <Button variant="ghost" onClick={send} style={{ marginInline: "auto" }}>
                Send one
            </Button>
        </Stack>
    );
}
InHeader.layout = { fill: true, minHeight: 520, ground: "paper" as const, align: "start" as const };
