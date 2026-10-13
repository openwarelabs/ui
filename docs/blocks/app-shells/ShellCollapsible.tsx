import { useEffect, useState, type ReactElement } from "react";

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
    Table,
    Tooltip,
    User,
    type BadgeVariant,
    type Command,
    type TableColumn,
} from "@openwarelabs/ui";
import {
    Bot,
    Check,
    ChevronRight,
    ChevronsUpDown,
    FolderKanban,
    Gauge,
    Inbox,
    LogOut,
    Menu as MenuIcon,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Rocket,
    Search,
    Settings,
    Sparkles,
    User as UserIcon,
} from "lucide-react";

import "./ShellCollapsible.css";

const sections = [
    { id: "overview", label: "Overview", icon: Gauge },
    { id: "projects", label: "Projects", icon: FolderKanban, count: 12 },
    { id: "deploys", label: "Deploys", icon: Rocket },
    { id: "agents", label: "Agents", icon: Bot, count: 3 },
    { id: "inbox", label: "Inbox", icon: Inbox, count: 5, unread: true },
];

const projects = [
    { id: "marketing-site", color: "var(--ow-primary)" },
    { id: "billing-api", color: "var(--ow-success-solid)" },
    { id: "mobile-app", color: "var(--ow-brass)" },
];

type RunStatus = "Running" | "Needs review" | "Merged" | "Failed";

interface Run {
    id: string;
    task: string;
    project: string;
    branch: string;
    owner: string;
    status: RunStatus;
    added: number;
    removed: number;
    minutes: number;
    startedMinutesAgo: number;
}

const tone: Record<RunStatus, BadgeVariant> = { Running: "active", "Needs review": "warning", Merged: "success", Failed: "danger" };

// [task, project, branch, for, status, lines added, lines removed, minutes it took, minutes ago it started]
const sample: Array<[string, string, string, string, RunStatus, number, number, number, number]> = [
    ["Fix invoice dates in the EU", "billing-api", "agent/invoice-dates", "Tomás Reyes", "Running", 84, 31, 6, 6],
    ["Update React Native to 0.76", "mobile-app", "agent/rn-076", "Clara Novak", "Needs review", 412, 388, 23, 64],
    ["Add alt text to the blog images", "marketing-site", "agent/alt-text", "Sam Okafor", "Merged", 96, 12, 9, 190],
    ["Write tests for the refund flow", "billing-api", "agent/refund-tests", "Omar Haddad", "Needs review", 238, 4, 14, 260],
    ["Rebuild the search index", "docs", "agent/search-index", "Jonas Berg", "Failed", 0, 0, 4, 1300],
    ["Rename the colour tokens", "design-system", "agent/token-names", "Aiko Tanaka", "Merged", 152, 149, 11, 1450],
    ["Translate the pricing page into German", "marketing-site", "agent/pricing-de", "Lena Fischer", "Needs review", 61, 2, 7, 2900],
];

const runs: Run[] = sample.map(([task, project, branch, owner, status, added, removed, minutes, startedMinutesAgo], index) => ({
    id: `run-${index + 1}`,
    task,
    project,
    branch,
    owner,
    status,
    added,
    removed,
    minutes,
    startedMinutesAgo,
}));

function ago(minutes: number) {
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h ago`;
    const days = Math.floor(minutes / (24 * 60));
    return days === 1 ? "Yesterday" : `${days} days ago`;
}

const columns: Array<TableColumn<Run>> = [
    {
        key: "task",
        header: "Task",
        sortable: true,
        render: (run) => (
            <span className="shell-collapsible__task">
                <span className="shell-collapsible__task-title">{run.task}</span>
                <span className="shell-collapsible__task-meta">
                    {run.project}
                    <span className="shell-collapsible__branch">
                        {" · "}
                        <span className="shell-collapsible__mono">{run.branch}</span>
                    </span>
                </span>
            </span>
        ),
    },
    {
        key: "status",
        header: "Status",
        sortable: true,
        render: (run) => (
            <Badge size="sm" variant={tone[run.status]}>
                {run.status}
            </Badge>
        ),
    },
    { key: "owner", header: "For", render: (run) => <User name={run.owner} size="sm" /> },
    {
        key: "changes",
        header: "Changes",
        render: (run) =>
            run.added + run.removed ? (
                <span className="shell-collapsible__changes">
                    <span className="shell-collapsible__added">+{run.added}</span>
                    <span className="shell-collapsible__removed">−{run.removed}</span>
                </span>
            ) : (
                <span className="shell-collapsible__muted">None</span>
            ),
    },
    {
        key: "duration",
        header: "Took",
        align: "end",
        sortable: true,
        sortValue: (run) => run.minutes,
        render: (run) => <span className="shell-collapsible__muted">{run.minutes} min</span>,
    },
    {
        key: "started",
        header: "Started",
        align: "end",
        sortable: true,
        sortValue: (run) => run.startedMinutesAgo,
        render: (run) => <span className="shell-collapsible__muted">{ago(run.startedMinutesAgo)}</span>,
    },
];

/** Names an item in a tooltip while the sidebar shows only its icon. */
function Tip({ show, label, children }: { show: boolean; label: string; children: ReactElement }) {
    return show ? (
        <Tooltip label={label} placement="right">
            {children}
        </Tooltip>
    ) : (
        children
    );
}

/** Everything in the sidebar; the same list goes in the drawer on phones, always unfolded there. */
function Navigation({
    active,
    collapsed,
    onNavigate,
    onSearch,
}: {
    active: string;
    collapsed: boolean;
    onNavigate: (id: string) => void;
    onSearch: () => void;
}) {
    return (
        <div className="shell-collapsible__nav">
            <Tip show={collapsed} label="Acme">
                <Menu
                    label="Workspaces"
                    width={232}
                    trigger={
                        <button type="button" className="shell-collapsible__workspace">
                            <span className="shell-collapsible__mark" aria-hidden="true" />
                            <span className="shell-collapsible__workspace-name shell-collapsible__fade">Acme</span>
                            <ChevronsUpDown size={15} aria-hidden="true" className="shell-collapsible__fade" />
                        </button>
                    }
                >
                    <MenuLabel>Workspaces</MenuLabel>
                    <MenuItem icon={<Check size={15} />}>Acme</MenuItem>
                    <MenuItem icon={<span className="shell-collapsible__menu-spacer" />}>Personal</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<Plus size={15} />}>New workspace</MenuItem>
                </Menu>
            </Tip>

            <Tip show={collapsed} label="Search">
                <button type="button" className="shell-collapsible__search" onClick={onSearch}>
                    <Search size={15} aria-hidden="true" />
                    <span className="shell-collapsible__search-text shell-collapsible__fade">Search</span>
                    <Kbd>⌘K</Kbd>
                </button>
            </Tip>

            <NavList label="Workspace">
                {sections.map(({ id, label, icon: Icon, count, unread }) => (
                    <Tip key={id} show={collapsed} label={count ? `${label} (${count})` : label}>
                        <NavItem
                            icon={
                                <span className="shell-collapsible__icon">
                                    <Icon size={15} />
                                    {unread ? <span className="shell-collapsible__unread" aria-hidden="true" /> : null}
                                </span>
                            }
                            active={active === id}
                            end={count}
                            onClick={() => onNavigate(id)}
                        >
                            {label}
                        </NavItem>
                    </Tip>
                ))}
            </NavList>

            <NavList label="Projects" heading="Projects">
                {projects.map((project) => (
                    <Tip key={project.id} show={collapsed} label={project.id}>
                        <NavItem
                            icon={<span className="shell-collapsible__dot" style={{ background: project.color }} />}
                            active={active === project.id}
                            onClick={() => onNavigate(project.id)}
                        >
                            {project.id}
                        </NavItem>
                    </Tip>
                ))}
            </NavList>

            <div className="shell-collapsible__account">
                <Tip show={collapsed} label="Maya Chen">
                    <Menu
                        label="Account"
                        above
                        width={232}
                        trigger={
                            <button type="button" className="shell-collapsible__user">
                                <Avatar name="Maya Chen" size="sm" />
                                <span className="shell-collapsible__user-text shell-collapsible__fade">
                                    <span className="shell-collapsible__user-name">Maya Chen</span>
                                    <span className="shell-collapsible__user-email">maya@example.com</span>
                                </span>
                                <ChevronsUpDown size={15} aria-hidden="true" className="shell-collapsible__fade" />
                            </button>
                        }
                    >
                        <MenuItem icon={<UserIcon size={15} />}>Profile</MenuItem>
                        <MenuItem icon={<Settings size={15} />} onSelect={() => onNavigate("settings")}>
                            Settings
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem icon={<LogOut size={15} />}>Sign out</MenuItem>
                    </Menu>
                </Tip>
            </div>
        </div>
    );
}

export function ShellCollapsible() {
    const [active, setActive] = useState("agents");
    // Folded on tablets to start with, open on desktops; nothing is remembered between visits.
    const [collapsed, setCollapsed] = useState(() => window.matchMedia("(max-width: 1023px)").matches);
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
        { id: "start-run", title: "Start an agent run", group: "Actions", icon: <Sparkles />, run: () => navigate("agents") },
    ];

    return (
        <div className={`shell-collapsible${collapsed ? " shell-collapsible--collapsed" : ""}`}>
            <aside id="shell-collapsible-sidebar" className="shell-collapsible__aside" aria-label="Main navigation">
                <Navigation active={active} collapsed={collapsed} onNavigate={navigate} onSearch={() => setSearchOpen(true)} />
            </aside>

            <div className="shell-collapsible__body">
                <header className="shell-collapsible__topbar">
                    <Button variant="ghost" iconOnly aria-label="Open navigation" onClick={() => setNavOpen(true)}>
                        <MenuIcon size={18} />
                    </Button>
                    <span className="shell-collapsible__topbar-brand">
                        <span className="shell-collapsible__mark" aria-hidden="true" />
                        Acme
                    </span>
                    <Button variant="ghost" iconOnly aria-label="Search" onClick={() => setSearchOpen(true)}>
                        <Search size={18} />
                    </Button>
                </header>

                <main className="shell-collapsible__panel">
                    <div className="shell-collapsible__toolbar">
                        <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="bottom">
                            <Button
                                variant="ghost"
                                size="sm"
                                iconOnly
                                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                                aria-expanded={!collapsed}
                                aria-controls="shell-collapsible-sidebar"
                                onClick={() => setCollapsed((current) => !current)}
                            >
                                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                            </Button>
                        </Tooltip>
                        <span className="shell-collapsible__toolbar-divider" aria-hidden="true" />
                        <span className="shell-collapsible__crumbs">
                            Agents
                            <ChevronRight size={14} aria-hidden="true" />
                            <strong>Runs</strong>
                        </span>
                    </div>

                    <div className="shell-collapsible__page">
                        <div className="shell-collapsible__page-header">
                            <div>
                                <h1 className="shell-collapsible__title">Agent runs</h1>
                                <p className="shell-collapsible__subtitle">Routine work your agents picked up, and where each run stands.</p>
                            </div>
                            <Button variant="primary" startIcon={<Sparkles size={16} />}>
                                Start a run
                            </Button>
                        </div>

                        <Table
                            className="shell-collapsible__table"
                            caption="Agent runs"
                            hideCaption
                            columns={columns}
                            rows={runs}
                            defaultSort={{ key: "started", direction: "ascending" }}
                        />
                    </div>
                </main>
            </div>

            <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" size={300} title="Menu">
                <Navigation active={active} collapsed={false} onNavigate={navigate} onSearch={() => setSearchOpen(true)} />
            </Drawer>
            <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} commands={commands} placeholder="Search projects and pages…" />
        </div>
    );
}
