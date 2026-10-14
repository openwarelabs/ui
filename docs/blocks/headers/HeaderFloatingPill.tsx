import { Header01 } from "@openwarelabs/blocks";
import { Badge, Chip, Text } from "@openwarelabs/ui";

import "./HeaderFloatingPill.css";

const links = [
    { label: "Product", href: "#product" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#changelog", current: true },
    { label: "Docs", href: "#docs" },
    { label: "Company", href: "#company" },
];

// The sample page under the header: long enough to scroll beneath it.
const entries = [
    {
        date: "2026-10-09",
        day: "9 October 2026",
        kind: "New",
        tone: "active",
        title: "Agents open their own pull requests",
        text: "Assign a ticket to an agent and it branches, writes the change, runs your tests and opens a pull request with its reasoning in the description. You review it like any other.",
    },
    {
        date: "2026-10-02",
        day: "2 October 2026",
        kind: "Improved",
        tone: "neutral",
        title: "Faster reviews on large diffs",
        text: "Diffs over a thousand lines now load in under a second, and the files you've already reviewed stay folded when new commits arrive.",
    },
    {
        date: "2026-09-25",
        day: "25 September 2026",
        kind: "New",
        tone: "active",
        title: "A preview for every branch",
        text: "Each branch gets its own preview address, posted on the pull request as soon as the build is ready. Previews go to sleep after a week without visits.",
    },
    {
        date: "2026-09-18",
        day: "18 September 2026",
        kind: "Fixed",
        tone: "neutral",
        title: "Invoice dates in the EU",
        text: "Invoices for workspaces in the EU now show dates in the workspace's own format rather than the US one.",
    },
] as const;

export function HeaderFloatingPill() {
    return (
        <div className="header-floating-pill">
            <Header01
                brand={{ name: "Acme", href: "#", logo: <span className="header-floating-pill__mark" aria-hidden="true" /> }}
                links={links}
                secondaryLink={{ label: "Sign in", href: "#sign-in" }}
                primaryAction={{ label: "Start for free", href: "#start" }}
            />

            {/* Your page */}
            <main className="header-floating-pill__page">
                <div className="header-floating-pill__intro">
                    <Chip>Changelog</Chip>
                    <Text variant="page-title" className="header-floating-pill__title">
                        What's new in Acme
                    </Text>
                    <Text variant="lead" className="header-floating-pill__lead">
                        Everything we shipped, week by week. Follow along in the app, or get it by email on Fridays.
                    </Text>
                </div>
                <ol className="header-floating-pill__entries">
                    {entries.map((entry) => (
                        <li key={entry.title} className="header-floating-pill__entry">
                            <Text variant="caption" className="header-floating-pill__date">
                                <time dateTime={entry.date}>{entry.day}</time>
                            </Text>
                            <div className="header-floating-pill__entry-body">
                                <Badge size="sm" variant={entry.tone}>
                                    {entry.kind}
                                </Badge>
                                <Text variant="heading" as="h2" className="header-floating-pill__entry-title">
                                    {entry.title}
                                </Text>
                                <Text variant="copy" tone="soft" className="header-floating-pill__entry-text">
                                    {entry.text}
                                </Text>
                            </div>
                        </li>
                    ))}
                </ol>
            </main>
        </div>
    );
}
