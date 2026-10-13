import { useEffect, useState, type ReactNode } from "react";

import { Badge, Button, Card, SegmentedControl, Stat, Table, type BadgeVariant, type TableColumn } from "@openwarelabs/ui";
import { ArrowUp, Bot, CircleX, GitMerge, GitPullRequest, KeyRound, Rocket, UserPlus } from "lucide-react";

import "./DashboardActivity.css";

type Kind = "deploy" | "review" | "agent" | "team";

interface Event {
    id: string;
    kind: Kind;
    icon: ReactNode;
    tone?: "success" | "danger" | "primary";
    text: ReactNode;
    meta: string;
    day: "Today" | "Yesterday";
}

const events: Event[] = [
    {
        id: "e1",
        kind: "deploy",
        icon: <Rocket size={14} />,
        tone: "success",
        text: (
            <>
                <strong>Maya Chen</strong> deployed <strong>Pricing page copy</strong> to marketing-site
            </>
        ),
        meta: "Live in 48 s · 4 min ago",
        day: "Today",
    },
    {
        id: "e2",
        kind: "agent",
        icon: <Bot size={14} />,
        tone: "primary",
        text: (
            <>
                An agent opened <strong>#219 Fix invoice dates in the EU</strong> for Tomás Reyes
            </>
        ),
        meta: "billing-api · 6 files changed · 26 min ago",
        day: "Today",
    },
    {
        id: "e3",
        kind: "review",
        icon: <GitMerge size={14} />,
        text: (
            <>
                <strong>Priya Nair</strong> merged <strong>#306 Cache avatars between launches</strong>
            </>
        ),
        meta: "mobile-app · 1 h ago",
        day: "Today",
    },
    {
        id: "e4",
        kind: "review",
        icon: <GitPullRequest size={14} />,
        text: (
            <>
                <strong>Lena Fischer</strong> asked for changes on <strong>#217 Round VAT per line</strong>
            </>
        ),
        meta: "billing-api · 3 comments · 2 h ago",
        day: "Today",
    },
    {
        id: "e5",
        kind: "deploy",
        icon: <CircleX size={14} />,
        tone: "danger",
        text: (
            <>
                A deploy of <strong>docs</strong> failed while rebuilding the search index
            </>
        ),
        meta: "Stopped at step 3 of 5 · 5 h ago",
        day: "Today",
    },
    {
        id: "e6",
        kind: "team",
        icon: <UserPlus size={14} />,
        text: (
            <>
                <strong>Omar Haddad</strong> joined the workspace as a member
            </>
        ),
        meta: "Invited by Maya Chen · Yesterday",
        day: "Yesterday",
    },
    {
        id: "e7",
        kind: "agent",
        icon: <Bot size={14} />,
        tone: "primary",
        text: (
            <>
                An agent finished <strong>Rename the colour tokens</strong> for Aiko Tanaka
            </>
        ),
        meta: "design-system · 152 lines · Yesterday",
        day: "Yesterday",
    },
    {
        id: "e8",
        kind: "team",
        icon: <KeyRound size={14} />,
        text: (
            <>
                <strong>Jonas Berg</strong> created the API key <strong>CI deploys</strong>
            </>
        ),
        meta: "Expires in 90 days · Yesterday",
        day: "Yesterday",
    },
];

/** What arrives while the page is open. */
const incoming: Event[] = [
    {
        id: "n1",
        kind: "review",
        icon: <GitPullRequest size={14} />,
        text: (
            <>
                <strong>Sam Okafor</strong> approved <strong>#482 Pricing page copy</strong>
            </>
        ),
        meta: "marketing-site · Just now",
        day: "Today",
    },
    {
        id: "n2",
        kind: "deploy",
        icon: <Rocket size={14} />,
        tone: "success",
        text: (
            <>
                <strong>Aiko Tanaka</strong> deployed <strong>Tooltips flip when there's no room</strong> to design-system
            </>
        ),
        meta: "Live in 1 min 05 s · Just now",
        day: "Today",
    },
];

const filters = [
    { value: "all", label: "All" },
    { value: "deploy", label: "Deploys" },
    { value: "review", label: "Reviews" },
    { value: "agent", label: "Agents" },
];

interface ProjectRow {
    id: string;
    color: string;
    status: "Live" | "Building" | "Failed";
    deploys: number;
    success: number;
}

const tone: Record<ProjectRow["status"], BadgeVariant> = { Live: "success", Building: "active", Failed: "danger" };

const projectRows: ProjectRow[] = [
    { id: "marketing-site", color: "var(--ow-primary)", status: "Live", deploys: 42, success: 100 },
    { id: "billing-api", color: "var(--ow-success-solid)", status: "Building", deploys: 18, success: 94.4 },
    { id: "design-system", color: "var(--ow-text-muted)", status: "Live", deploys: 11, success: 100 },
    { id: "mobile-app", color: "var(--ow-brass)", status: "Live", deploys: 9, success: 88.9 },
    { id: "docs", color: "var(--ow-danger-solid)", status: "Failed", deploys: 6, success: 83.3 },
];

const columns: Array<TableColumn<ProjectRow>> = [
    {
        key: "id",
        header: "Project",
        sortable: true,
        render: (row) => (
            <span className="dashboard-activity__project">
                <span className="dashboard-activity__dot" style={{ background: row.color }} aria-hidden="true" />
                {row.id}
            </span>
        ),
    },
    {
        key: "status",
        header: "Last deploy",
        render: (row) => (
            <Badge size="sm" variant={tone[row.status]}>
                {row.status}
            </Badge>
        ),
    },
    { key: "deploys", header: "This week", align: "end", sortable: true },
    {
        key: "success",
        header: "Succeeded",
        align: "end",
        sortable: true,
        render: (row) => <span className="dashboard-activity__muted">{row.success.toFixed(row.success === 100 ? 0 : 1)}%</span>,
    },
];

export function DashboardActivity() {
    const [filter, setFilter] = useState("all");
    const [feed, setFeed] = useState(events);
    const [waiting, setWaiting] = useState<Event[]>([]);
    const [fresh, setFresh] = useState<string[]>([]);
    const [earlier, setEarlier] = useState(false);

    // A moment after the page opens, two new events are waiting at the top of the feed.
    useEffect(() => {
        const timer = window.setTimeout(() => setWaiting(incoming), 5000);
        return () => window.clearTimeout(timer);
    }, []);

    const showWaiting = () => {
        setFeed((current) => [...waiting, ...current]);
        setFresh(waiting.map((event) => event.id));
        setWaiting([]);
    };

    const shown = feed.filter((event) => (filter === "all" || event.kind === filter) && (earlier || event.day === "Today"));
    const days = (["Today", "Yesterday"] as const)
        .map((day) => ({ day, items: shown.filter((event) => event.day === day) }))
        .filter((group) => group.items.length);

    return (
        <section className="dashboard-activity" aria-labelledby="dashboard-activity-title">
            <div className="dashboard-activity__inner">
                <div className="dashboard-activity__header">
                    <div>
                        <h1 id="dashboard-activity-title" className="dashboard-activity__title">
                            Overview
                        </h1>
                        <p className="dashboard-activity__lead">What changed across Acme this week, as it happens.</p>
                    </div>
                </div>

                <div className="dashboard-activity__stats">
                    <Stat label="Deploys this week" value="128" change="+12%" trend={[8, 12, 10, 15, 14, 19, 22]} />
                    <Stat label="Open reviews" value="9" change="−4" changeTone="positive" trend={[16, 15, 13, 14, 12, 11, 9]} />
                    <Stat label="Agent runs" value="1,904" change="+31%" trend={[20, 26, 25, 33, 38, 41, 52]} />
                    <Stat label="Median time to review" value="42 min" change="−18%" changeTone="positive" trend={[70, 64, 66, 55, 50, 46, 42]} />
                </div>

                <Card padding="none" className="dashboard-activity__card dashboard-activity__table-card">
                    <div className="dashboard-activity__card-header">
                        <h2 className="dashboard-activity__card-title">Projects</h2>
                    </div>
                    <Table
                        caption="Projects this week"
                        hideCaption
                        density="compact"
                        columns={columns}
                        rows={projectRows}
                        defaultSort={{ key: "deploys", direction: "descending" }}
                    />
                </Card>

                <Card padding="none" className="dashboard-activity__card dashboard-activity__feed">
                    <section aria-labelledby="dashboard-activity-feed">
                        <div className="dashboard-activity__card-header">
                            <h2 id="dashboard-activity-feed" className="dashboard-activity__card-title">
                                Activity
                            </h2>
                            <SegmentedControl size="sm" aria-label="Show" options={filters} value={filter} onChange={setFilter} />
                        </div>

                        <div aria-live="polite">
                            {waiting.length ? (
                                <div className="dashboard-activity__new">
                                    <Button size="sm" variant="ghost" startIcon={<ArrowUp size={14} />} onClick={showWaiting}>
                                        {waiting.length} new events
                                    </Button>
                                </div>
                            ) : null}
                        </div>

                        {days.length ? (
                            days.map((group) => (
                                <div key={group.day}>
                                    <h3 className="dashboard-activity__day">{group.day}</h3>
                                    <ol className="dashboard-activity__events">
                                        {group.items.map((event) => (
                                            <li key={event.id} className="dashboard-activity__event" data-fresh={fresh.includes(event.id) || undefined}>
                                                <span className="dashboard-activity__icon" data-tone={event.tone} aria-hidden="true">
                                                    {event.icon}
                                                </span>
                                                <p className="dashboard-activity__event-text">
                                                    {event.text}
                                                    <span className="dashboard-activity__event-meta">{event.meta}</span>
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            ))
                        ) : (
                            <p className="dashboard-activity__none">
                                {earlier ? "Nothing like this happened this week." : "Nothing like this has happened today."}
                            </p>
                        )}

                        {earlier ? null : (
                            <div className="dashboard-activity__earlier">
                                <Button size="sm" variant="ghost" onClick={() => setEarlier(true)}>
                                    Show earlier activity
                                </Button>
                            </div>
                        )}
                    </section>
                </Card>
            </div>
        </section>
    );
}
