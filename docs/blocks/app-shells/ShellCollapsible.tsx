import { Shell04 } from "@openwarelabs/blocks";
import { Badge, Button, Table, Text, User, type BadgeVariant, type TableColumn } from "@openwarelabs/ui";
import { Bot, FolderKanban, Gauge, Inbox, LogOut, Rocket, Settings, Sparkles, User as UserIcon } from "lucide-react";

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
                <Text as="span">{run.task}</Text>
                <Text variant="caption">
                    {run.project}
                    <span className="shell-collapsible__branch">
                        {" · "}
                        <Text as="span" variant="code" className="shell-collapsible__mono">
                            {run.branch}
                        </Text>
                    </span>
                </Text>
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
                    <Text as="span" variant="code" tone="success" className="shell-collapsible__mono">
                        +{run.added}
                    </Text>
                    <Text as="span" variant="code" tone="danger" className="shell-collapsible__mono">
                        −{run.removed}
                    </Text>
                </span>
            ) : (
                <Text as="span" tone="muted" className="shell-collapsible__nowrap">
                    None
                </Text>
            ),
    },
    {
        key: "duration",
        header: "Took",
        align: "end",
        sortable: true,
        sortValue: (run) => run.minutes,
        render: (run) => (
            <Text as="span" tone="muted" className="shell-collapsible__nowrap">
                {run.minutes} min
            </Text>
        ),
    },
    {
        key: "started",
        header: "Started",
        align: "end",
        sortable: true,
        sortValue: (run) => run.startedMinutesAgo,
        render: (run) => (
            <Text as="span" tone="muted" className="shell-collapsible__nowrap">
                {ago(run.startedMinutesAgo)}
            </Text>
        ),
    },
];

export function ShellCollapsible() {
    return (
        <Shell04
            workspace="Acme"
            logo={<span className="shell-collapsible__mark" aria-hidden="true" />}
            workspaces={[{ name: "Acme", current: true }, { name: "Personal" }]}
            navigation={[
                {
                    label: "Workspace",
                    items: sections.map(({ id, label, icon: Icon, count, unread }) => ({ id, label, icon: <Icon size={15} />, count, unread })),
                },
                {
                    label: "Projects",
                    heading: "Projects",
                    items: projects.map((project) => ({
                        id: project.id,
                        label: project.id,
                        icon: <span className="shell-collapsible__dot" style={{ background: project.color }} />,
                    })),
                },
            ]}
            defaultCurrent="agents"
            account={{ name: "Maya Chen", email: "maya@example.com" }}
            accountMenu={[
                { label: "Profile", icon: <UserIcon size={15} /> },
                { label: "Settings", icon: <Settings size={15} />, page: "settings" },
                { label: "Sign out", icon: <LogOut size={15} />, separatorBefore: true },
            ]}
            commands={[
                ...sections.map(({ id, label, icon: Icon }) => ({ id, title: label, group: "Go to", icon: <Icon />, page: id })),
                ...projects.map((project) => ({ id: project.id, title: project.id, group: "Projects", icon: <FolderKanban />, page: project.id })),
                { id: "start-run", title: "Start an agent run", group: "Actions", icon: <Sparkles />, page: "agents" },
            ]}
            breadcrumbs={["Agents", "Runs"]}
            labels={{ searchPlaceholder: "Search projects and pages…" }}
        >
            <div className="shell-collapsible__page-header">
                <div>
                    <Text as="h1" variant="heading">
                        Agent runs
                    </Text>
                    <Text variant="copy" className="shell-collapsible__subtitle">
                        Routine work your agents picked up, and where each run stands.
                    </Text>
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
        </Shell04>
    );
}
