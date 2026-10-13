import { useEffect, useRef, useState } from "react";

import {
    Avatar,
    AvatarGroup,
    Badge,
    Button,
    Menu,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    NavItem,
    ScrollShadow,
    SearchField,
    SettingsRow,
    Switch,
    Text,
    Tooltip,
    User,
    toast,
    type BadgeVariant,
} from "@openwarelabs/ui";
import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, LogOut, PanelRight, Plus, Rocket, Settings, User as UserIcon, X } from "lucide-react";

import "./ShellThreePane.css";

type Status = "Live" | "Building" | "Failed";

interface Deploy {
    message: string;
    branch: string;
    who: string;
    when: string;
    duration: string;
    status: Status;
}

interface Project {
    id: string;
    description: string;
    color: string;
    owner: string;
    members: string[];
    repo: string;
    branch: string;
    region: string;
    runtime: string;
    created: string;
    figures: Array<[label: string, value: string]>;
    deploys: Deploy[];
}

const tone: Record<Status, BadgeVariant> = { Live: "success", Building: "active", Failed: "danger" };

/** One of a project's deploys: its message, branch, who started it, when, how long it took and how it went. */
function row(message: string, branch: string, who: string, when: string, duration: string, status: Status): Deploy {
    return { message, branch, who, when, duration, status };
}

const projects: Project[] = [
    {
        id: "billing-api",
        description: "Invoices, payments and the EU tax rules behind them.",
        color: "var(--ow-success-solid)",
        owner: "Tomás Reyes",
        members: ["Tomás Reyes", "Clara Novak", "Omar Haddad", "Lena Fischer"],
        repo: "acme/billing-api",
        branch: "main",
        region: "Frankfurt",
        runtime: "Node 22",
        created: "4 March 2025",
        figures: [
            ["Deploys this week", "18"],
            ["Median build", "2 min 40 s"],
            ["Open reviews", "4"],
        ],
        deploys: [
            row("Fix invoice dates in the EU", "fix/invoice-dates", "Agent for Tomás Reyes", "26 min ago", "", "Building"),
            row("Retry failed card payments once", "main", "Omar Haddad", "5 h ago", "2 min 31 s", "Live"),
            row("Round VAT per line, not per invoice", "main", "Lena Fischer", "Yesterday", "1 min 12 s", "Failed"),
            row("Send receipts in the customer's language", "main", "Clara Novak", "2 days ago", "2 min 44 s", "Live"),
        ],
    },
    {
        id: "marketing-site",
        description: "The public site: the home page, pricing and the blog.",
        color: "var(--ow-primary)",
        owner: "Maya Chen",
        members: ["Maya Chen", "Sam Okafor", "Aiko Tanaka", "Lena Fischer", "Omar Haddad", "Jonas Berg"],
        repo: "acme/marketing-site",
        branch: "main",
        region: "Frankfurt",
        runtime: "Next.js 15",
        created: "12 January 2024",
        figures: [
            ["Deploys this week", "42"],
            ["Median build", "48 s"],
            ["Open reviews", "2"],
        ],
        deploys: [
            row("Pricing page copy", "main", "Maya Chen", "4 min ago", "48 s", "Live"),
            row("Add alt text to the blog images", "agent/alt-text", "Agent for Sam Okafor", "3 h ago", "52 s", "Live"),
            row("Move the changelog to MDX", "main", "Aiko Tanaka", "Yesterday", "1 min 03 s", "Live"),
        ],
    },
    {
        id: "mobile-app",
        description: "The iOS and Android app, built from one codebase.",
        color: "var(--ow-brass)",
        owner: "Clara Novak",
        members: ["Clara Novak", "Jonas Berg", "Aiko Tanaka", "Sam Okafor", "Maya Chen"],
        repo: "acme/mobile-app",
        branch: "release/2.4",
        region: "Dublin",
        runtime: "React Native 0.76",
        created: "2 June 2024",
        figures: [
            ["Deploys this week", "9"],
            ["Median build", "3 min 12 s"],
            ["Open reviews", "3"],
        ],
        deploys: [
            row("Update React Native to 0.76", "agent/rn-076", "Agent for Clara Novak", "1 h ago", "", "Building"),
            row("Release 2.4", "release/2.4", "Clara Novak", "2 h ago", "3 min 12 s", "Live"),
            row("Dark mode for the settings screen", "main", "Jonas Berg", "Yesterday", "3 min 05 s", "Live"),
        ],
    },
    {
        id: "docs",
        description: "Guides, tutorials and the API reference.",
        color: "var(--ow-danger-solid)",
        owner: "Jonas Berg",
        members: ["Jonas Berg", "Lena Fischer", "Maya Chen"],
        repo: "acme/docs",
        branch: "main",
        region: "Frankfurt",
        runtime: "Astro 5",
        created: "20 September 2024",
        figures: [
            ["Deploys this week", "6"],
            ["Median build", "1 min 50 s"],
            ["Open reviews", "1"],
        ],
        deploys: [
            row("Rebuild the search index", "agent/search-index", "Agent for Jonas Berg", "Yesterday", "4 min 02 s", "Failed"),
            row("Document the webhooks API", "main", "Lena Fischer", "2 days ago", "1 min 48 s", "Live"),
            row("Fix broken links in the quickstart", "main", "Jonas Berg", "3 days ago", "1 min 41 s", "Live"),
        ],
    },
    {
        id: "design-system",
        description: "The components and tokens every Acme app shares.",
        color: "var(--ow-text-muted)",
        owner: "Aiko Tanaka",
        members: ["Aiko Tanaka", "Maya Chen", "Clara Novak"],
        repo: "acme/design-system",
        branch: "main",
        region: "Frankfurt",
        runtime: "React 18",
        created: "8 August 2023",
        figures: [
            ["Deploys this week", "11"],
            ["Median build", "1 min 05 s"],
            ["Open reviews", "2"],
        ],
        deploys: [
            row("Tooltips flip when there's no room", "main", "Aiko Tanaka", "3 h ago", "1 min 05 s", "Live"),
            row("New date picker", "feat/date-picker", "Clara Novak", "Yesterday", "1 min 10 s", "Live"),
            row("Darker borders in dark mode", "main", "Maya Chen", "4 days ago", "58 s", "Live"),
        ],
    },
];

/** On phones one pane shows at a time; under 1024px the inspector takes the item's place. */
type View = "list" | "item" | "inspector";

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const list = window.matchMedia(query);
        const update = () => setMatches(list.matches);
        update();
        list.addEventListener("change", update);
        return () => list.removeEventListener("change", update);
    }, [query]);
    return matches;
}

export function ShellThreePane() {
    const [selectedId, setSelectedId] = useState("billing-api");
    const [view, setView] = useState<View>("list");
    const [inspectorOpen, setInspectorOpen] = useState(true);
    const [query, setQuery] = useState("");
    const [added, setAdded] = useState<Record<string, Deploy[]>>({});
    const [settings, setSettings] = useState<Record<string, { previews: boolean; agents: boolean }>>({});
    const wide = useMediaQuery("(min-width: 1024px)");

    const project = projects.find((entry) => entry.id === selectedId)!;
    const deploys = [...(added[project.id] ?? []), ...project.deploys];
    const status = deploys[0]!.status;
    const statusOf = (entry: Project) => (added[entry.id]?.[0] ?? entry.deploys[0]!).status;
    const own = settings[project.id] ?? { previews: true, agents: project.id !== "billing-api" };
    const setOwn = (change: Partial<typeof own>) => setSettings((current) => ({ ...current, [project.id]: { ...own, ...change } }));
    const visible = projects.filter((entry) => entry.id.includes(query.trim().toLowerCase()));

    // When a narrow screen swaps panes, take focus to the new pane's heading so keyboards and screen readers follow.
    const itemRef = useRef<HTMLElement>(null);
    const inspectorRef = useRef<HTMLElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const moved = useRef(false);
    useEffect(() => {
        if (!moved.current) return;
        if (view === "item") itemRef.current?.querySelector<HTMLElement>("h1")?.focus();
        if (view === "inspector") inspectorRef.current?.querySelector<HTMLElement>("h2")?.focus();
        if (view === "list") listRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    }, [view]);
    const go = (next: View) => {
        moved.current = true;
        setView(next);
    };

    const showDetails = () => (wide ? setInspectorOpen((open) => !open) : go("inspector"));

    // A deploy builds for a few seconds, then goes live.
    const timers = useRef<number[]>([]);
    useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

    const deploy = () => {
        const { id, branch } = project;
        const next: Deploy = { message: "Deploy from the dashboard", branch, who: "Maya Chen", when: "Just now", duration: "", status: "Building" };
        setAdded((current) => ({ ...current, [id]: [next, ...(current[id] ?? [])] }));
        toast(`Deploying ${branch} of ${id}`, { description: "It's building now. It goes live as soon as the checks pass." });
        timers.current.push(
            window.setTimeout(() => {
                setAdded((current) => ({
                    ...current,
                    [id]: (current[id] ?? []).map((entry) => (entry === next ? { ...entry, status: "Live", duration: "41 s" } : entry)),
                }));
                toast.success(`${id} is live`, { description: `${branch} built in 41 s.` });
            }, 4000),
        );
    };

    return (
        <div className="shell-three-pane" data-view={view} data-inspector={inspectorOpen ? "open" : "closed"}>
            <div ref={listRef} className="shell-three-pane__list">
                <Menu
                    label="Workspaces"
                    width={232}
                    trigger={
                        <Button variant="ghost" size="sm" fullWidth className="shell-three-pane__workspace" endIcon={<ChevronsUpDown size={15} />}>
                            <span className="shell-three-pane__mark" aria-hidden="true" />
                            <Text as="span" variant="card-title" tone="default" className="shell-three-pane__workspace-name">
                                Acme
                            </Text>
                        </Button>
                    }
                >
                    <MenuLabel>Workspaces</MenuLabel>
                    <MenuItem icon={<Check size={15} />}>Acme</MenuItem>
                    <MenuItem icon={<span className="shell-three-pane__menu-spacer" />}>Personal</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<Plus size={15} />}>New workspace</MenuItem>
                </Menu>

                <div className="shell-three-pane__list-heading">
                    <Text variant="label">
                        Projects
                        <Text as="span" tone="muted" className="shell-three-pane__list-count">
                            {projects.length}
                        </Text>
                    </Text>
                    <Tooltip label="New project">
                        <Button variant="ghost" size="sm" iconOnly aria-label="New project">
                            <Plus size={16} />
                        </Button>
                    </Tooltip>
                </div>

                <SearchField
                    size="sm"
                    className="shell-three-pane__search"
                    placeholder="Filter projects"
                    aria-label="Filter projects"
                    value={query}
                    onChange={setQuery}
                />

                <ScrollShadow className="shell-three-pane__scroll">
                    <nav aria-label="Projects">
                        {visible.length ? (
                            <ul className="shell-three-pane__projects">
                                {visible.map((entry) => {
                                    const entryStatus = statusOf(entry);
                                    return (
                                        <li key={entry.id}>
                                            <NavItem
                                                className="shell-three-pane__project"
                                                icon={<span className="shell-three-pane__dot" style={{ background: entry.color }} aria-hidden="true" />}
                                                active={entry.id === selectedId}
                                                end={
                                                    <Badge size="sm" variant={tone[entryStatus]}>
                                                        {entryStatus}
                                                    </Badge>
                                                }
                                                onClick={() => {
                                                    setSelectedId(entry.id);
                                                    go("item");
                                                }}
                                            >
                                                {/* The name takes the item's own type, which turns heavier on the open project. */}
                                                <span className="shell-three-pane__project-text">
                                                    <span className="shell-three-pane__project-name">{entry.id}</span>
                                                    <Text variant="caption" truncate>
                                                        {(added[entry.id]?.[0] ?? entry.deploys[0]!).when}
                                                    </Text>
                                                </span>
                                            </NavItem>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <Text variant="copy" className="shell-three-pane__no-match">
                                No projects match “{query.trim()}”.
                            </Text>
                        )}
                    </nav>
                </ScrollShadow>

                <Menu
                    label="Account"
                    above
                    width={232}
                    trigger={
                        <Button variant="ghost" fullWidth className="shell-three-pane__user" endIcon={<ChevronsUpDown size={15} />}>
                            <Avatar name="Maya Chen" size="sm" />
                            <span className="shell-three-pane__user-text">
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
                    <MenuItem icon={<UserIcon size={15} />}>Profile</MenuItem>
                    <MenuItem icon={<Settings size={15} />}>Settings</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<LogOut size={15} />}>Sign out</MenuItem>
                </Menu>
            </div>

            <div className="shell-three-pane__panel">
                <main ref={itemRef} className="shell-three-pane__item">
                    <div className="shell-three-pane__toolbar">
                        <span className="shell-three-pane__back">
                            <Button variant="ghost" size="sm" startIcon={<ChevronLeft size={16} />} onClick={() => go("list")}>
                                Projects
                            </Button>
                        </span>
                        <Text as="span" tone="muted" className="shell-three-pane__crumbs" aria-hidden="true">
                            Projects
                            <ChevronRight size={14} />
                            <Text as="span" variant="label" tone="default" truncate>
                                {project.id}
                            </Text>
                        </Text>
                        <Tooltip label={wide && inspectorOpen ? "Hide details" : "Show details"}>
                            <Button
                                variant="ghost"
                                size="sm"
                                iconOnly
                                aria-label={wide && inspectorOpen ? "Hide details" : "Show details"}
                                aria-expanded={wide ? inspectorOpen : undefined}
                                onClick={showDetails}
                            >
                                <PanelRight size={16} />
                            </Button>
                        </Tooltip>
                    </div>

                    <div className="shell-three-pane__content">
                        <div className="shell-three-pane__header">
                            <div>
                                <div className="shell-three-pane__title-row">
                                    <Text as="h1" variant="heading" tabIndex={-1} className="shell-three-pane__title">
                                        {project.id}
                                    </Text>
                                    <Badge variant={tone[status]}>{status}</Badge>
                                </div>
                                <Text variant="copy" className="shell-three-pane__description">
                                    {project.description}
                                </Text>
                            </div>
                            <Button variant="primary" startIcon={<Rocket size={16} />} onClick={deploy}>
                                Deploy
                            </Button>
                        </div>

                        <dl className="shell-three-pane__figures">
                            {project.figures.map(([label, value]) => (
                                <div key={label} className="shell-three-pane__figure">
                                    <Text as="dt" variant="caption">
                                        {label}
                                    </Text>
                                    <Text as="dd" variant="heading" className="shell-three-pane__figure-value">
                                        {value}
                                    </Text>
                                </div>
                            ))}
                        </dl>

                        <section aria-labelledby="shell-three-pane-deploys">
                            <Text as="h2" variant="card-title" id="shell-three-pane-deploys" className="shell-three-pane__section-title">
                                Recent deploys
                            </Text>
                            <ul className="shell-three-pane__deploys">
                                {deploys.map((entry, index) => (
                                    <li key={`${entry.message}-${index}`} className="shell-three-pane__deploy">
                                        <span className="shell-three-pane__deploy-text">
                                            <Text as="span" truncate>
                                                {entry.message}
                                            </Text>
                                            <Text variant="caption" truncate>
                                                <Text as="span" variant="code" className="shell-three-pane__mono">
                                                    {entry.branch}
                                                </Text>{" "}
                                                · {entry.who} · {entry.when}
                                            </Text>
                                        </span>
                                        <span className="shell-three-pane__deploy-end">
                                            {entry.duration ? (
                                                <Text variant="caption" className="shell-three-pane__duration">
                                                    {entry.duration}
                                                </Text>
                                            ) : null}
                                            <Badge size="sm" variant={tone[entry.status]}>
                                                {entry.status}
                                            </Badge>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                </main>

                <aside ref={inspectorRef} className="shell-three-pane__inspector" aria-labelledby="shell-three-pane-details">
                    <div className="shell-three-pane__inspector-header">
                        <span className="shell-three-pane__inspector-back">
                            <Button variant="ghost" size="sm" iconOnly aria-label={`Back to ${project.id}`} onClick={() => go("item")}>
                                <ChevronLeft size={16} />
                            </Button>
                        </span>
                        <Text as="h2" variant="card-title" id="shell-three-pane-details" tabIndex={-1} className="shell-three-pane__inspector-title">
                            Details
                        </Text>
                        <span className="shell-three-pane__inspector-close">
                            <Button variant="ghost" size="sm" iconOnly aria-label="Hide details" onClick={() => setInspectorOpen(false)}>
                                <X size={16} />
                            </Button>
                        </span>
                    </div>

                    <div className="shell-three-pane__inspector-body">
                        <dl className="shell-three-pane__details">
                            <div className="shell-three-pane__detail">
                                <Text as="dt" tone="muted">
                                    Owner
                                </Text>
                                <dd>
                                    <User name={project.owner} size="sm" />
                                </dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <Text as="dt" tone="muted">
                                    Members
                                </Text>
                                <dd>
                                    <AvatarGroup size="sm" max={4} label={`${project.members.length} people on ${project.id}`}>
                                        {project.members.map((name) => (
                                            <Avatar key={name} name={name} label={name} />
                                        ))}
                                    </AvatarGroup>
                                </dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <Text as="dt" tone="muted">
                                    Repository
                                </Text>
                                <Text as="dd" variant="code" truncate className="shell-three-pane__mono">
                                    {project.repo}
                                </Text>
                            </div>
                            <div className="shell-three-pane__detail">
                                <Text as="dt" tone="muted">
                                    Production
                                </Text>
                                <Text as="dd" variant="code" truncate className="shell-three-pane__mono">
                                    {project.branch}
                                </Text>
                            </div>
                            <div className="shell-three-pane__detail">
                                <Text as="dt" tone="muted">
                                    Region
                                </Text>
                                <Text as="dd" truncate>
                                    {project.region}
                                </Text>
                            </div>
                            <div className="shell-three-pane__detail">
                                <Text as="dt" tone="muted">
                                    Runtime
                                </Text>
                                <Text as="dd" truncate>
                                    {project.runtime}
                                </Text>
                            </div>
                            <div className="shell-three-pane__detail">
                                <Text as="dt" tone="muted">
                                    Created
                                </Text>
                                <Text as="dd" truncate>
                                    {project.created}
                                </Text>
                            </div>
                        </dl>

                        <div className="shell-three-pane__settings">
                            <Text as="h3" variant="caption" className="shell-three-pane__settings-title">
                                Settings
                            </Text>
                            <SettingsRow label="Preview deploys" description="Build every pull request on its own address.">
                                <Switch checked={own.previews} onChange={(previews) => setOwn({ previews })} label="Preview deploys" />
                            </SettingsRow>
                            <SettingsRow label="Agent pull requests" description="Let agents open pull requests here.">
                                <Switch checked={own.agents} onChange={(agents) => setOwn({ agents })} label="Agent pull requests" />
                            </SettingsRow>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
