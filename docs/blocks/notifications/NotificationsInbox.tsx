import type { ReactNode } from "react";

import { Notifications01, type Notifications01Item } from "@openwarelabs/blocks";
import { Avatar, Badge, NavItem, NavList, Text, type BadgeVariant } from "@openwarelabs/ui";
import { Bot, Rocket } from "lucide-react";

import "./NotificationsInbox.css";

/** A name or a title inside a notification, in the text colour against the muted line. */
const Strong = ({ children }: { children: ReactNode }) => (
    <Text as="strong" variant="label" tone="default">
        {children}
    </Text>
);

const notifications: Notifications01Item[] = [
    {
        id: "n1",
        from: "Clara Novak",
        message: (
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
        icon: <Bot size={15} />,
        message: (
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
        icon: <Rocket size={14} />,
        tone: "danger",
        message: (
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
        message: (
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
        message: (
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
        message: (
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

export function NotificationsInbox() {
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

                <Notifications01 notifications={notifications} viewAllHref="#" defaultOpen />
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
