import { useEffect, useState } from "react";

import {
    Avatar,
    Badge,
    Button,
    CommandPalette,
    Drawer,
    Kbd,
    Menu,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    NavItem,
    NavList,
    Stat,
    type Command,
} from "@openwarelabs/ui";
import { Bot, Check, ChevronsUpDown, FolderKanban, Gauge, Inbox, LogOut, Menu as MenuIcon, Plus, Rocket, Search, Settings, User } from "lucide-react";

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

/** Everything in the sidebar; the same list goes in the drawer on phones. */
function Navigation({ active, onNavigate, onSearch }: { active: string; onNavigate: (id: string) => void; onSearch: () => void }) {
    return (
        <div className="shell-sidebar__nav">
            <Menu
                label="Workspaces"
                width={232}
                trigger={
                    <button type="button" className="shell-sidebar__workspace">
                        <span className="shell-sidebar__mark" aria-hidden="true" />
                        <span className="shell-sidebar__workspace-name">Acme</span>
                        <ChevronsUpDown size={15} aria-hidden="true" />
                    </button>
                }
            >
                <MenuLabel>Workspaces</MenuLabel>
                <MenuItem icon={<Check size={15} />}>Acme</MenuItem>
                <MenuItem icon={<span className="shell-sidebar__menu-spacer" />}>Personal</MenuItem>
                <MenuSeparator />
                <MenuItem icon={<Plus size={15} />}>New workspace</MenuItem>
            </Menu>

            <button type="button" className="shell-sidebar__search" onClick={onSearch}>
                <Search size={15} aria-hidden="true" />
                <span className="shell-sidebar__search-text">Search</span>
                <Kbd>⌘K</Kbd>
            </button>

            <NavList label="Workspace">
                {sections.map(({ id, label, icon: Icon, count }) => (
                    <NavItem key={id} icon={<Icon size={15} />} active={active === id} end={count} onClick={() => onNavigate(id)}>
                        {label}
                    </NavItem>
                ))}
            </NavList>

            <NavList label="Projects" heading="Projects">
                {projects.map((project) => (
                    <NavItem
                        key={project.id}
                        icon={<span className="shell-sidebar__dot" style={{ background: project.color }} />}
                        active={active === project.id}
                        onClick={() => onNavigate(project.id)}
                    >
                        {project.id}
                    </NavItem>
                ))}
            </NavList>

            <div className="shell-sidebar__account">
                <Menu
                    label="Account"
                    above
                    width={232}
                    trigger={
                        <button type="button" className="shell-sidebar__user">
                            <Avatar name="Maya Chen" size="sm" />
                            <span className="shell-sidebar__user-text">
                                <span className="shell-sidebar__user-name">Maya Chen</span>
                                <span className="shell-sidebar__user-email">maya@example.com</span>
                            </span>
                            <ChevronsUpDown size={15} aria-hidden="true" />
                        </button>
                    }
                >
                    <MenuItem icon={<User size={15} />}>Profile</MenuItem>
                    <MenuItem icon={<Settings size={15} />} onSelect={() => onNavigate("settings")}>
                        Settings
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<LogOut size={15} />}>Sign out</MenuItem>
                </Menu>
            </div>
        </div>
    );
}

export function ShellSidebar() {
    const [active, setActive] = useState("overview");
    const [navOpen, setNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

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

    const navigate = (id: string) => {
        setActive(id);
        setNavOpen(false);
    };

    const commands: Command[] = [
        ...sections.map(({ id, label, icon: Icon }) => ({ id, title: label, group: "Go to", icon: <Icon />, run: () => navigate(id) })),
        ...projects.map((project) => ({ id: project.id, title: project.id, group: "Projects", icon: <FolderKanban />, run: () => navigate(project.id) })),
        { id: "new-project", title: "New project", group: "Actions", icon: <Plus />, run: () => navigate("projects") },
    ];

    return (
        <div className="shell-sidebar">
            <aside className="shell-sidebar__aside" aria-label="Main navigation">
                <Navigation active={active} onNavigate={navigate} onSearch={() => setSearchOpen(true)} />
            </aside>

            <div className="shell-sidebar__body">
                <header className="shell-sidebar__topbar">
                    <Button variant="ghost" iconOnly aria-label="Open navigation" onClick={() => setNavOpen(true)}>
                        <MenuIcon size={18} />
                    </Button>
                    <span className="shell-sidebar__topbar-brand">
                        <span className="shell-sidebar__mark" aria-hidden="true" />
                        Acme
                    </span>
                    <Button variant="ghost" iconOnly aria-label="Search" onClick={() => setSearchOpen(true)}>
                        <Search size={18} />
                    </Button>
                </header>

                <main className="shell-sidebar__panel">
                    <div className="shell-sidebar__page-header">
                        <div>
                            <h1 className="shell-sidebar__title">Overview</h1>
                            <p className="shell-sidebar__subtitle">What your team shipped this week.</p>
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

                    <section className="shell-sidebar__card" aria-labelledby="shell-sidebar-recent">
                        <h2 id="shell-sidebar-recent" className="shell-sidebar__card-title">
                            Latest deploys
                        </h2>
                        <ul className="shell-sidebar__list">
                            {recent.map((item) => (
                                <li key={item.what} className="shell-sidebar__item">
                                    <span className="shell-sidebar__item-text">
                                        <span className="shell-sidebar__item-title">{item.what}</span>
                                        <span className="shell-sidebar__item-meta">
                                            {item.project} · {item.who} · {item.when}
                                        </span>
                                    </span>
                                    <Badge size="sm" variant={item.status === "Live" ? "success" : "active"}>
                                        {item.status}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </section>
                </main>
            </div>

            <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" size={300} title="Menu">
                <Navigation active={active} onNavigate={navigate} onSearch={() => setSearchOpen(true)} />
            </Drawer>
            <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} commands={commands} placeholder="Search projects and pages…" />
        </div>
    );
}
