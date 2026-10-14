import { Shell01 } from "@openwarelabs/blocks";
import { Badge, Button, Card, Stat, Text } from "@openwarelabs/ui";
import { Bot, FolderKanban, Gauge, Inbox, LogOut, Plus, Rocket, Settings, User } from "lucide-react";

import "./ShellSidebar.css";

const sections = [
    { id: "overview", label: "Overview", icon: Gauge },
    { id: "projects", label: "Projects", icon: FolderKanban, count: 12 },
    { id: "deploys", label: "Deploys", icon: Rocket },
    { id: "agents", label: "Agents", icon: Bot, count: 3 },
    { id: "inbox", label: "Inbox", icon: Inbox, count: 5 },
];

const projects = [
    { id: "marketing-site", color: "var(--ow-primary)" },
    { id: "billing-api", color: "var(--ow-success-solid)" },
    { id: "mobile-app", color: "var(--ow-brass)" },
];

const recent = [
    { project: "marketing-site", what: "Pricing page copy", who: "Maya Chen", when: "4 min ago", status: "Live" },
    { project: "billing-api", what: "Fix invoice dates in the EU", who: "Agent · Tomás Reyes", when: "26 min ago", status: "Building" },
    { project: "mobile-app", what: "Release 2.4", who: "Clara Novak", when: "2 h ago", status: "Live" },
];

export function ShellSidebar() {
    return (
        <Shell01
            workspace="Acme"
            logo={<span className="shell-sidebar__mark" aria-hidden="true" />}
            workspaces={[{ name: "Acme", current: true }, { name: "Personal" }]}
            navigation={[
                {
                    label: "Workspace",
                    items: sections.map(({ id, label, icon: Icon, count }) => ({ id, label, icon: <Icon size={15} />, count })),
                },
                {
                    label: "Projects",
                    heading: "Projects",
                    items: projects.map((project) => ({
                        id: project.id,
                        label: project.id,
                        icon: <span className="shell-sidebar__dot" style={{ background: project.color }} />,
                    })),
                },
            ]}
            defaultCurrent="overview"
            account={{ name: "Maya Chen", email: "maya@example.com" }}
            accountMenu={[
                { label: "Profile", icon: <User size={15} /> },
                { label: "Settings", icon: <Settings size={15} />, page: "settings" },
                { label: "Sign out", icon: <LogOut size={15} />, separatorBefore: true },
            ]}
            commands={[
                ...sections.map(({ id, label, icon: Icon }) => ({ id, title: label, group: "Go to", icon: <Icon />, page: id })),
                ...projects.map((project) => ({ id: project.id, title: project.id, group: "Projects", icon: <FolderKanban />, page: project.id })),
                { id: "new-project", title: "New project", group: "Actions", icon: <Plus />, page: "projects" },
            ]}
            labels={{ searchPlaceholder: "Search projects and pages…" }}
        >
            <div className="shell-sidebar__page-header">
                <div>
                    <Text as="h1" variant="heading">
                        Overview
                    </Text>
                    <Text variant="copy" className="shell-sidebar__subtitle">
                        What your team shipped this week.
                    </Text>
                </div>
                <Button variant="primary" startIcon={<Plus size={16} />}>
                    New project
                </Button>
            </div>

            <div className="shell-sidebar__stats">
                <Stat label="Deploys this week" value="128" change="+12%" />
                <Stat label="Open reviews" value="9" change="−4" changeTone="positive" />
                <Stat label="Agent runs" value="1,904" change="+31%" />
            </div>

            <Card padding="none">
                <section aria-labelledby="shell-sidebar-recent">
                    <Text as="h2" variant="card-title" id="shell-sidebar-recent" className="shell-sidebar__card-title">
                        Latest deploys
                    </Text>
                    <ul className="shell-sidebar__list">
                        {recent.map((item) => (
                            <li key={item.what} className="shell-sidebar__item">
                                <span className="shell-sidebar__item-text">
                                    <Text as="span">{item.what}</Text>
                                    <Text variant="caption" truncate>
                                        {item.project} · {item.who} · {item.when}
                                    </Text>
                                </span>
                                <Badge size="sm" variant={item.status === "Live" ? "success" : "active"}>
                                    {item.status}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                </section>
            </Card>
        </Shell01>
    );
}
