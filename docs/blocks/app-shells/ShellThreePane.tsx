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
    ScrollShadow,
    SearchField,
    SettingsRow,
    Switch,
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
        members: ["Tomás Reyes", "Priya Nair", "Omar Haddad", "Lena Fischer"],
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
            row("Send receipts in the customer's language", "main", "Priya Nair", "2 days ago", "2 min 44 s", "Live"),
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
        owner: "Priya Nair",
        members: ["Priya Nair", "Jonas Berg", "Aiko Tanaka", "Sam Okafor", "Maya Chen"],
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
            row("Update React Native to 0.76", "agent/rn-076", "Agent for Priya Nair", "1 h ago", "", "Building"),
            row("Release 2.4", "release/2.4", "Priya Nair", "2 h ago", "3 min 12 s", "Live"),
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
        members: ["Aiko Tanaka", "Maya Chen", "Priya Nair"],
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
            row("New date picker", "feat/date-picker", "Priya Nair", "Yesterday", "1 min 10 s", "Live"),
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
    const titleRef = useRef<HTMLHeadingElement>(null);
    const inspectorTitleRef = useRef<HTMLHeadingElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const moved = useRef(false);
    useEffect(() => {
        if (!moved.current) return;
        if (view === "item") titleRef.current?.focus();
        if (view === "inspector") inspectorTitleRef.current?.focus();
        if (view === "list") listRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
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
                        <button type="button" className="shell-three-pane__workspace">
                            <span className="shell-three-pane__mark" aria-hidden="true" />
                            <span className="shell-three-pane__workspace-name">Acme</span>
                            <ChevronsUpDown size={15} aria-hidden="true" />
                        </button>
                    }
                >
                    <MenuLabel>Workspaces</MenuLabel>
                    <MenuItem icon={<Check size={15} />}>Acme</MenuItem>
                    <MenuItem icon={<span className="shell-three-pane__menu-spacer" />}>Personal</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<Plus size={15} />}>New workspace</MenuItem>
                </Menu>

                <div className="shell-three-pane__list-heading">
                    <span className="shell-three-pane__list-title">
                        Projects<span className="shell-three-pane__list-count">{projects.length}</span>
                    </span>
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
                                            <button
                                                type="button"
                                                className="shell-three-pane__project"
                                                aria-current={entry.id === selectedId ? "true" : undefined}
                                                onClick={() => {
                                                    setSelectedId(entry.id);
                                                    go("item");
                                                }}
                                            >
                                                <span className="shell-three-pane__dot" style={{ background: entry.color }} aria-hidden="true" />
                                                <span className="shell-three-pane__project-text">
                                                    <span className="shell-three-pane__project-name">{entry.id}</span>
                                                    <span className="shell-three-pane__project-meta">{(added[entry.id]?.[0] ?? entry.deploys[0]!).when}</span>
                                                </span>
                                                <Badge size="sm" variant={tone[entryStatus]}>
                                                    {entryStatus}
                                                </Badge>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="shell-three-pane__no-match">No projects match “{query.trim()}”.</p>
                        )}
                    </nav>
                </ScrollShadow>

                <Menu
                    label="Account"
                    above
                    width={232}
                    trigger={
                        <button type="button" className="shell-three-pane__user">
                            <Avatar name="Maya Chen" size="sm" />
                            <span className="shell-three-pane__user-text">
                                <span className="shell-three-pane__user-name">Maya Chen</span>
                                <span className="shell-three-pane__user-email">maya@example.com</span>
                            </span>
                            <ChevronsUpDown size={15} aria-hidden="true" />
                        </button>
                    }
                >
                    <MenuItem icon={<UserIcon size={15} />}>Profile</MenuItem>
                    <MenuItem icon={<Settings size={15} />}>Settings</MenuItem>
                    <MenuSeparator />
                    <MenuItem icon={<LogOut size={15} />}>Sign out</MenuItem>
                </Menu>
            </div>

            <div className="shell-three-pane__panel">
                <main className="shell-three-pane__item">
                    <div className="shell-three-pane__toolbar">
                        <span className="shell-three-pane__back">
                            <Button variant="ghost" size="sm" startIcon={<ChevronLeft size={16} />} onClick={() => go("list")}>
                                Projects
                            </Button>
                        </span>
                        <span className="shell-three-pane__crumbs" aria-hidden="true">
                            Projects
                            <ChevronRight size={14} />
                            <strong>{project.id}</strong>
                        </span>
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
                                    <h1 ref={titleRef} tabIndex={-1} className="shell-three-pane__title">
                                        {project.id}
                                    </h1>
                                    <Badge variant={tone[status]}>{status}</Badge>
                                </div>
                                <p className="shell-three-pane__description">{project.description}</p>
                            </div>
                            <Button variant="primary" startIcon={<Rocket size={16} />} onClick={deploy}>
                                Deploy
                            </Button>
                        </div>

                        <dl className="shell-three-pane__figures">
                            {project.figures.map(([label, value]) => (
                                <div key={label} className="shell-three-pane__figure">
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>

                        <section aria-labelledby="shell-three-pane-deploys">
                            <h2 id="shell-three-pane-deploys" className="shell-three-pane__section-title">
                                Recent deploys
                            </h2>
                            <ul className="shell-three-pane__deploys">
                                {deploys.map((entry, index) => (
                                    <li key={`${entry.message}-${index}`} className="shell-three-pane__deploy">
                                        <span className="shell-three-pane__deploy-text">
                                            <span className="shell-three-pane__deploy-title">{entry.message}</span>
                                            <span className="shell-three-pane__deploy-meta">
                                                <span className="shell-three-pane__branch">{entry.branch}</span> · {entry.who} · {entry.when}
                                            </span>
                                        </span>
                                        <span className="shell-three-pane__deploy-end">
                                            {entry.duration ? <span className="shell-three-pane__duration">{entry.duration}</span> : null}
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

                <aside className="shell-three-pane__inspector" aria-labelledby="shell-three-pane-details">
                    <div className="shell-three-pane__inspector-header">
                        <span className="shell-three-pane__inspector-back">
                            <Button variant="ghost" size="sm" iconOnly aria-label={`Back to ${project.id}`} onClick={() => go("item")}>
                                <ChevronLeft size={16} />
                            </Button>
                        </span>
                        <h2 id="shell-three-pane-details" ref={inspectorTitleRef} tabIndex={-1} className="shell-three-pane__inspector-title">
                            Details
                        </h2>
                        <span className="shell-three-pane__inspector-close">
                            <Button variant="ghost" size="sm" iconOnly aria-label="Hide details" onClick={() => setInspectorOpen(false)}>
                                <X size={16} />
                            </Button>
                        </span>
                    </div>

                    <div className="shell-three-pane__inspector-body">
                        <dl className="shell-three-pane__details">
                            <div className="shell-three-pane__detail">
                                <dt>Owner</dt>
                                <dd>
                                    <User name={project.owner} size="sm" />
                                </dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <dt>Members</dt>
                                <dd>
                                    <AvatarGroup size="sm" max={4} label={`${project.members.length} people on ${project.id}`}>
                                        {project.members.map((name) => (
                                            <Avatar key={name} name={name} label={name} />
                                        ))}
                                    </AvatarGroup>
                                </dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <dt>Repository</dt>
                                <dd className="shell-three-pane__mono">{project.repo}</dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <dt>Production</dt>
                                <dd className="shell-three-pane__mono">{project.branch}</dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <dt>Region</dt>
                                <dd>{project.region}</dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <dt>Runtime</dt>
                                <dd>{project.runtime}</dd>
                            </div>
                            <div className="shell-three-pane__detail">
                                <dt>Created</dt>
                                <dd>{project.created}</dd>
                            </div>
                        </dl>

                        <div className="shell-three-pane__settings">
                            <h3 className="shell-three-pane__settings-title">Settings</h3>
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
