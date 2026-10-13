import { useState } from "react";

import {
    Avatar,
    Badge,
    Button,
    EmptyState,
    Menu,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    SearchField,
    Table,
    Tag,
    TagGroup,
    type TableColumn,
} from "@openwarelabs/ui";
import { ListFilter, SearchX } from "lucide-react";

import "./EmptyNoResults.css";

type Status = "Live" | "Building" | "Failed";

interface Deploy {
    id: number;
    title: string;
    branch: string;
    project: string;
    status: Status;
    by: string;
    when: string;
}

const deploys: Deploy[] = [
    {
        id: 421,
        title: "Fix invoice dates in the EU",
        branch: "fix/invoice-dates",
        project: "billing-api",
        status: "Live",
        by: "Tomás Reyes",
        when: "26 min ago",
    },
    { id: 420, title: "Pricing page copy", branch: "main", project: "marketing-site", status: "Live", by: "Maya Chen", when: "1 h ago" },
    {
        id: 419,
        title: "Invoice dates in the customer's time zone",
        branch: "feat/invoice-time-zones",
        project: "billing-api",
        status: "Building",
        by: "Clara Novak",
        when: "2 h ago",
    },
    { id: 418, title: "Update VAT rounding", branch: "fix/vat-rounding", project: "billing-api", status: "Failed", by: "Clara Novak", when: "3 h ago" },
    { id: 417, title: "Release 2.4", branch: "release/2.4", project: "mobile-app", status: "Live", by: "Aiko Tanaka", when: "Yesterday" },
    { id: 416, title: "Search in the docs sidebar", branch: "feat/docs-search", project: "docs", status: "Failed", by: "Sam Okafor", when: "Yesterday" },
    { id: 415, title: "Dark mode for the changelog", branch: "main", project: "marketing-site", status: "Live", by: "Lena Fischer", when: "2 days ago" },
    {
        id: 414,
        title: "Retry webhooks with backoff",
        branch: "fix/webhook-retries",
        project: "billing-api",
        status: "Live",
        by: "Omar Haddad",
        when: "3 days ago",
    },
];

const statuses: Status[] = ["Live", "Building", "Failed"];
const projects = ["marketing-site", "billing-api", "mobile-app", "docs"];
const tone = { Live: "success", Building: "active", Failed: "danger" } as const;

const columns: Array<TableColumn<Deploy>> = [
    {
        key: "title",
        header: "Deploy",
        render: (deploy) => (
            <span className="empty-no-results__deploy">
                <strong>
                    #{deploy.id} {deploy.title}
                </strong>
                <span>{deploy.branch}</span>
            </span>
        ),
    },
    {
        key: "status",
        header: "Status",
        width: 110,
        render: (deploy) => (
            <Badge size="sm" variant={tone[deploy.status]}>
                {deploy.status}
            </Badge>
        ),
    },
    { key: "project", header: "Project", width: 150 },
    {
        key: "by",
        header: "By",
        width: 170,
        render: (deploy) => (
            <span className="empty-no-results__by">
                <Avatar name={deploy.by} size="sm" />
                {deploy.by}
            </span>
        ),
    },
    { key: "when", header: "When", width: 110, align: "end", render: (deploy) => <span className="empty-no-results__muted">{deploy.when}</span> },
];

export function EmptyNoResults() {
    const [query, setQuery] = useState("invoice dates");
    const [status, setStatus] = useState<Status | null>("Failed");
    const [project, setProject] = useState<string | null>("billing-api");

    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const rows = deploys.filter(
        (deploy) =>
            (!status || deploy.status === status) &&
            (!project || deploy.project === project) &&
            words.every((word) => `#${deploy.id} ${deploy.title} ${deploy.branch} ${deploy.project}`.toLowerCase().includes(word)),
    );
    const filtered = Boolean(status || project);
    const searched = query.trim();

    const clearFilters = () => {
        setStatus(null);
        setProject(null);
    };

    const where = `${project ? `in ${project}` : "in every project"}${status ? `, only at ${status.toLowerCase()} deploys` : ""}`;

    return (
        <div className="empty-no-results">
            <main className="empty-no-results__panel">
                <h1 className="empty-no-results__title">Deploys</h1>
                <p className="empty-no-results__subtitle">Deploys from the last 30 days, across every project.</p>

                <div className="empty-no-results__toolbar">
                    <div className="empty-no-results__search">
                        <SearchField size="sm" aria-label="Search deploys" placeholder="Search deploys" value={query} onChange={setQuery} />
                    </div>
                    <TagGroup label="Filters">
                        {status ? (
                            <Tag variant="active" onRemove={() => setStatus(null)} removeLabel={`status filter: ${status}`}>
                                Status: {status}
                            </Tag>
                        ) : null}
                        {project ? (
                            <Tag variant="active" onRemove={() => setProject(null)} removeLabel={`project filter: ${project}`}>
                                Project: {project}
                            </Tag>
                        ) : null}
                        <Menu
                            label="Add a filter"
                            trigger={
                                <Button size="sm" variant="ghost" startIcon={<ListFilter size={16} />}>
                                    {filtered ? "Filter" : "Add filter"}
                                </Button>
                            }
                        >
                            <MenuLabel>Status</MenuLabel>
                            {statuses.map((value) => (
                                <MenuItem key={value} onSelect={() => setStatus(value)}>
                                    {value}
                                </MenuItem>
                            ))}
                            <MenuSeparator />
                            <MenuLabel>Project</MenuLabel>
                            {projects.map((value) => (
                                <MenuItem key={value} onSelect={() => setProject(value)}>
                                    {value}
                                </MenuItem>
                            ))}
                        </Menu>
                    </TagGroup>
                    <span className="empty-no-results__count" aria-live="polite">
                        {rows.length} of {deploys.length} deploys
                    </span>
                </div>

                <Table
                    className="empty-no-results__table"
                    caption="Deploys"
                    hideCaption
                    columns={columns}
                    rows={rows}
                    emptyContent={
                        <EmptyState
                            icon={<SearchX size={20} />}
                            title={
                                searched ? (
                                    <>
                                        No deploys match <span className="empty-no-results__query">“{searched}”</span>
                                    </>
                                ) : (
                                    "No deploys match these filters"
                                )
                            }
                            description={`We looked ${where}. ${searched && filtered ? "Try other words, or clear the filters to look wider." : searched ? "Try fewer or different words." : "Clear the filters to see them all."}`}
                            actions={
                                <>
                                    {searched ? (
                                        <Button variant={filtered ? "secondary" : "primary"} onClick={() => setQuery("")}>
                                            Clear search
                                        </Button>
                                    ) : null}
                                    {filtered ? (
                                        <Button variant="primary" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : null}
                                </>
                            }
                        />
                    }
                />
            </main>
        </div>
    );
}
