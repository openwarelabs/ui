import { useState } from "react";

import { Shell02 } from "@openwarelabs/blocks";
import { Badge, Button, Card, Text, type BadgeVariant } from "@openwarelabs/ui";
import { Bot, FolderKanban, Gauge, LogOut, Plus, Rocket, Settings, Sparkles, User } from "lucide-react";

import "./ShellTopBar.css";

interface Row {
    title: string;
    meta: string;
    when: string;
    status: string;
    tone: BadgeVariant;
}

/** A few sections, each with its own page: a title, one action and what's new in it. */
const sections = [
    {
        id: "overview",
        label: "Overview",
        icon: Gauge,
        description: "What your team shipped this week.",
        action: { label: "New project", icon: Plus },
        figures: [
            { label: "Deploys this week", value: "128" },
            { label: "Open reviews", value: "9" },
            { label: "Agent runs", value: "1,904" },
        ],
        listTitle: "Latest activity",
        rows: [
            { title: "Pricing page copy", meta: "marketing-site · Siobhan Murphy", when: "4 min ago", status: "Live", tone: "success" },
            { title: "Fix invoice dates in the EU", meta: "billing-api · Agent for Ciarán Kelly", when: "26 min ago", status: "Building", tone: "active" },
            { title: "Release 2.4", meta: "mobile-app · Aoife O'Sullivan", when: "2 h ago", status: "Live", tone: "success" },
            { title: "Rebuild the search index", meta: "docs · Agent for Declan Walsh", when: "Yesterday", status: "Failed", tone: "danger" },
        ] as Row[],
    },
    {
        id: "projects",
        label: "Projects",
        icon: FolderKanban,
        description: "Five projects in the Acme workspace.",
        action: { label: "New project", icon: Plus },
        figures: [
            { label: "Live", value: "3" },
            { label: "Building", value: "1" },
            { label: "Failed", value: "1" },
        ],
        listTitle: "Recently updated",
        rows: [
            { title: "marketing-site", meta: "Next.js · 6 members", when: "4 min ago", status: "Live", tone: "success" },
            { title: "billing-api", meta: "Node 22 · 4 members", when: "26 min ago", status: "Building", tone: "active" },
            { title: "mobile-app", meta: "React Native · 5 members", when: "2 h ago", status: "Live", tone: "success" },
            { title: "docs", meta: "Astro · 3 members", when: "Yesterday", status: "Failed", tone: "danger" },
        ] as Row[],
    },
    {
        id: "deploys",
        label: "Deploys",
        icon: Rocket,
        description: "Every build of every branch, newest first.",
        action: { label: "Deploy a branch", icon: Rocket },
        figures: [
            { label: "Deploys today", value: "14" },
            { label: "Succeeded", value: "96%" },
            { label: "Median build", value: "1 min 12 s" },
        ],
        listTitle: "Today",
        rows: [
            { title: "main · 9f3c2a1", meta: "marketing-site · Siobhan Murphy · 48 s", when: "4 min ago", status: "Live", tone: "success" },
            {
                title: "fix/invoice-dates · 4be71d0",
                meta: "billing-api · Ciarán Kelly · building for 2 min",
                when: "26 min ago",
                status: "Building",
                tone: "active",
            },
            { title: "release/2.4 · c81aa95", meta: "mobile-app · Aoife O'Sullivan · 3 min 12 s", when: "2 h ago", status: "Live", tone: "success" },
            { title: "main · 07d5e3f", meta: "design-system · Niamh Byrne · 1 min 05 s", when: "3 h ago", status: "Live", tone: "success" },
        ] as Row[],
    },
    {
        id: "agents",
        label: "Agents",
        icon: Bot,
        description: "Routine work handed to agents, and what's waiting for your review.",
        action: { label: "Start a run", icon: Sparkles },
        figures: [
            { label: "Running now", value: "1" },
            { label: "Waiting for review", value: "3" },
            { label: "Merged this week", value: "27" },
        ],
        listTitle: "Recent runs",
        rows: [
            {
                title: "Fix invoice dates in the EU",
                meta: "billing-api · for Ciarán Kelly · 6 files changed",
                when: "26 min ago",
                status: "Running",
                tone: "active",
            },
            {
                title: "Update React Native to 0.76",
                meta: "mobile-app · for Aoife O'Sullivan · 14 files changed",
                when: "1 h ago",
                status: "Needs review",
                tone: "warning",
            },
            {
                title: "Add alt text to the blog images",
                meta: "marketing-site · for Seán McCarthy · 22 files changed",
                when: "3 h ago",
                status: "Merged",
                tone: "success",
            },
            { title: "Rebuild the search index", meta: "docs · for Declan Walsh · stopped at step 3 of 5", when: "Yesterday", status: "Failed", tone: "danger" },
        ] as Row[],
    },
];

export function ShellTopBar() {
    const [active, setActive] = useState<string>("overview");
    const section = sections.find((entry) => entry.id === active) ?? sections[0]!;
    const ActionIcon = section.action.icon;

    return (
        <Shell02
            workspace="Acme"
            logo={<span className="shell-top-bar__mark" aria-hidden="true" />}
            workspaces={[{ name: "Acme", current: true }, { name: "Personal" }]}
            navigation={sections.map(({ id, label, icon: Icon }) => ({ id, label, icon: <Icon size={15} /> }))}
            current={active}
            onNavigate={setActive}
            account={{ name: "Siobhan Murphy", email: "siobhan@example.com" }}
            accountMenu={[
                { label: "Profile", icon: <User size={15} /> },
                { label: "Settings", icon: <Settings size={15} /> },
                { label: "Sign out", icon: <LogOut size={15} />, separatorBefore: true },
            ]}
            commands={[
                ...sections.map(({ id, label, icon: Icon }) => ({ id, title: label, group: "Go to", icon: <Icon />, page: id })),
                { id: "new-project", title: "New project", group: "Actions", icon: <Plus />, page: "projects" },
                { id: "start-run", title: "Start an agent run", group: "Actions", icon: <Sparkles />, page: "agents" },
            ]}
            labels={{ searchPlaceholder: "Search projects and pages…" }}
        >
            <div className="shell-top-bar__page-header">
                <div>
                    <Text as="h1" variant="heading">
                        {section.label}
                    </Text>
                    <Text variant="copy" className="shell-top-bar__subtitle">
                        {section.description}
                    </Text>
                </div>
                <Button variant="primary" startIcon={<ActionIcon size={16} />}>
                    {section.action.label}
                </Button>
            </div>

            <dl className="shell-top-bar__figures">
                {section.figures.map((figure) => (
                    <div key={figure.label} className="shell-top-bar__figure">
                        <Text as="dt" variant="caption">
                            {figure.label}
                        </Text>
                        <Text as="dd" variant="heading">
                            {figure.value}
                        </Text>
                    </div>
                ))}
            </dl>

            <Card padding="none">
                <section aria-labelledby="shell-top-bar-list">
                    <Text as="h2" variant="card-title" id="shell-top-bar-list" className="shell-top-bar__card-title">
                        {section.listTitle}
                    </Text>
                    <ul className="shell-top-bar__list">
                        {section.rows.map((row) => (
                            <li key={row.title} className="shell-top-bar__item">
                                <span className="shell-top-bar__item-text">
                                    <Text as="span" truncate>
                                        {row.title}
                                    </Text>
                                    <Text variant="caption" truncate>
                                        {row.meta}
                                    </Text>
                                </span>
                                <span className="shell-top-bar__item-end">
                                    <Text variant="caption" className="shell-top-bar__item-when">
                                        {row.when}
                                    </Text>
                                    <Badge size="sm" variant={row.tone}>
                                        {row.status}
                                    </Badge>
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </Card>
        </Shell02>
    );
}
