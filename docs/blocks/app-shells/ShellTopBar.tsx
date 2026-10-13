import { useEffect, useState } from "react";

import {
    Avatar,
    Badge,
    Button,
    Card,
    CommandPalette,
    Drawer,
    Menu,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    NavItem,
    NavList,
    Text,
    type BadgeVariant,
    type Command,
} from "@openwarelabs/ui";
import { Bot, Check, ChevronsUpDown, FolderKanban, Gauge, LogOut, Menu as MenuIcon, Plus, Rocket, Search, Settings, Sparkles, User } from "lucide-react";

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
            { title: "Pricing page copy", meta: "marketing-site · Maya Chen", when: "4 min ago", status: "Live", tone: "success" },
            { title: "Fix invoice dates in the EU", meta: "billing-api · Agent for Tomás Reyes", when: "26 min ago", status: "Building", tone: "active" },
            { title: "Release 2.4", meta: "mobile-app · Clara Novak", when: "2 h ago", status: "Live", tone: "success" },
            { title: "Rebuild the search index", meta: "docs · Agent for Jonas Berg", when: "Yesterday", status: "Failed", tone: "danger" },
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
            { title: "main · 9f3c2a1", meta: "marketing-site · Maya Chen · 48 s", when: "4 min ago", status: "Live", tone: "success" },
            {
                title: "fix/invoice-dates · 4be71d0",
                meta: "billing-api · Tomás Reyes · building for 2 min",
                when: "26 min ago",
                status: "Building",
                tone: "active",
            },
            { title: "release/2.4 · c81aa95", meta: "mobile-app · Clara Novak · 3 min 12 s", when: "2 h ago", status: "Live", tone: "success" },
            { title: "main · 07d5e3f", meta: "design-system · Aiko Tanaka · 1 min 05 s", when: "3 h ago", status: "Live", tone: "success" },
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
                meta: "billing-api · for Tomás Reyes · 6 files changed",
                when: "26 min ago",
                status: "Running",
                tone: "active",
            },
            {
                title: "Update React Native to 0.76",
                meta: "mobile-app · for Clara Novak · 14 files changed",
                when: "1 h ago",
                status: "Needs review",
                tone: "warning",
            },
            {
                title: "Add alt text to the blog images",
                meta: "marketing-site · for Sam Okafor · 22 files changed",
                when: "3 h ago",
                status: "Merged",
                tone: "success",
            },
            { title: "Rebuild the search index", meta: "docs · for Jonas Berg · stopped at step 3 of 5", when: "Yesterday", status: "Failed", tone: "danger" },
        ] as Row[],
    },
];

type SectionId = (typeof sections)[number]["id"];

function WorkspaceMenu() {
    return (
        <Menu
            label="Workspaces"
            width={232}
            trigger={
                <Button variant="ghost" size="sm" className="shell-top-bar__workspace" endIcon={<ChevronsUpDown size={15} />}>
                    <span className="shell-top-bar__mark" aria-hidden="true" />
                    <Text as="span" variant="card-title" tone="default">
                        Acme
                    </Text>
                </Button>
            }
        >
            <MenuLabel>Workspaces</MenuLabel>
            <MenuItem icon={<Check size={15} />}>Acme</MenuItem>
            <MenuItem icon={<span className="shell-top-bar__menu-spacer" />}>Personal</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<Plus size={15} />}>New workspace</MenuItem>
        </Menu>
    );
}

function AccountItems() {
    return (
        <>
            <MenuItem icon={<User size={15} />}>Profile</MenuItem>
            <MenuItem icon={<Settings size={15} />}>Settings</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<LogOut size={15} />}>Sign out</MenuItem>
        </>
    );
}

export function ShellTopBar() {
    const [active, setActive] = useState<SectionId>("overview");
    const [navOpen, setNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const section = sections.find((entry) => entry.id === active)!;
    const ActionIcon = section.action.icon;

    // ⌘K or Ctrl+K opens search from anywhere.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const navigate = (id: SectionId) => {
        setActive(id);
        setNavOpen(false);
    };

    const commands: Command[] = [
        ...sections.map(({ id, label, icon: Icon }) => ({ id, title: label, group: "Go to", icon: <Icon />, run: () => navigate(id) })),
        { id: "new-project", title: "New project", group: "Actions", icon: <Plus />, run: () => navigate("projects") },
        { id: "start-run", title: "Start an agent run", group: "Actions", icon: <Sparkles />, run: () => navigate("agents") },
    ];

    const items = (orientation: "horizontal" | "vertical") =>
        sections.map(({ id, label, icon: Icon }) => (
            <NavItem key={id} icon={orientation === "vertical" ? <Icon size={15} /> : undefined} active={active === id} onClick={() => navigate(id)}>
                {label}
            </NavItem>
        ));

    return (
        <div className="shell-top-bar">
            <header className="shell-top-bar__header">
                <WorkspaceMenu />

                <NavList label="Main navigation" orientation="horizontal" className="shell-top-bar__nav">
                    {items("horizontal")}
                </NavList>

                <div className="shell-top-bar__end">
                    <Button size="sm" className="shell-top-bar__search" startIcon={<Search size={15} />} shortcut="⌘K" onClick={() => setSearchOpen(true)}>
                        <Text as="span" tone="muted" className="shell-top-bar__search-text">
                            Search
                        </Text>
                    </Button>
                    {/* Under 1024px wide the search field folds to its icon. */}
                    <Button variant="ghost" iconOnly className="shell-top-bar__search-icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
                        <Search size={18} />
                    </Button>
                    <span className="shell-top-bar__account">
                        <Menu
                            label="Account"
                            align="end"
                            width={232}
                            trigger={
                                <Button variant="ghost" iconOnly aria-label="Account: Maya Chen">
                                    <Avatar name="Maya Chen" size="md" />
                                </Button>
                            }
                        >
                            <MenuLabel>maya@example.com</MenuLabel>
                            <AccountItems />
                        </Menu>
                    </span>
                    <span className="shell-top-bar__menu-button">
                        <Button variant="ghost" iconOnly aria-label="Open navigation" onClick={() => setNavOpen(true)}>
                            <MenuIcon size={18} />
                        </Button>
                    </span>
                </div>
            </header>

            <main className="shell-top-bar__panel">
                <div className="shell-top-bar__page">
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
                </div>
            </main>

            <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="right" size={300} title="Menu">
                <div className="shell-top-bar__drawer">
                    <NavList label="Main navigation">{items("vertical")}</NavList>
                    <div className="shell-top-bar__drawer-account">
                        <Menu
                            label="Account"
                            above
                            width={232}
                            trigger={
                                <Button variant="ghost" fullWidth className="shell-top-bar__user" endIcon={<ChevronsUpDown size={15} />}>
                                    <Avatar name="Maya Chen" size="sm" />
                                    <span className="shell-top-bar__user-text">
                                        <Text as="span" variant="label" tone="default" truncate>
                                            Maya Chen
                                        </Text>
                                        <Text variant="caption" truncate>
                                            maya@example.com
                                        </Text>
                                    </span>
                                </Button>
                            }
                        >
                            <AccountItems />
                        </Menu>
                    </div>
                </div>
            </Drawer>
            <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} commands={commands} placeholder="Search projects and pages…" />
        </div>
    );
}
