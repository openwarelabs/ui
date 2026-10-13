import { useState } from "react";

import {
    Badge,
    Button,
    Card,
    EmptyState,
    Pagination,
    SearchField,
    Select,
    Table,
    Text,
    User,
    toast,
    type BadgeVariant,
    type TableColumn,
    type TableSort,
} from "@openwarelabs/ui";
import { Rocket, SearchX } from "lucide-react";

import "./TableToolbar.css";

type Status = "Live" | "Building" | "Failed";

interface Deploy {
    id: string;
    message: string;
    sha: string;
    project: string;
    branch: string;
    author: string;
    status: Status;
    seconds: number;
    minutesAgo: number;
}

const tone: Record<Status, BadgeVariant> = { Live: "success", Building: "active", Failed: "danger" };

// [message, sha, project, branch, author, status, seconds, minutes ago]
const sample: Array<[string, string, string, string, string, Status, number, number]> = [
    ["Pricing page copy", "9f3c2a1", "marketing-site", "main", "Maya Chen", "Live", 48, 4],
    ["Fix invoice dates in the EU", "4be71d0", "billing-api", "fix/invoice-dates", "Tomás Reyes", "Building", 96, 26],
    ["Update React Native to 0.76", "a1d09e4", "mobile-app", "agent/rn-076", "Clara Novak", "Building", 140, 61],
    ["Release 2.4", "c81aa95", "mobile-app", "release/2.4", "Clara Novak", "Live", 192, 118],
    ["Tooltips flip when there's no room", "07d5e3f", "design-system", "main", "Aiko Tanaka", "Live", 65, 176],
    ["Add alt text to the blog images", "5e2b8c3", "marketing-site", "agent/alt-text", "Sam Okafor", "Live", 52, 190],
    ["Retry failed card payments once", "e44f1a7", "billing-api", "main", "Omar Haddad", "Live", 151, 302],
    ["Rebuild the search index", "b7c3d21", "docs", "agent/search-index", "Jonas Berg", "Failed", 242, 1310],
    ["Round VAT per line, not per invoice", "3a9f0b6", "billing-api", "main", "Lena Fischer", "Failed", 72, 1385],
    ["Dark mode for the settings screen", "d02e7f8", "mobile-app", "main", "Jonas Berg", "Live", 185, 1420],
    ["New date picker", "f61a4c2", "design-system", "feat/date-picker", "Clara Novak", "Live", 70, 1502],
    ["Move the changelog to MDX", "8c1d5e9", "marketing-site", "main", "Aiko Tanaka", "Live", 63, 1575],
    ["Send receipts in the customer's language", "2b7e9a0", "billing-api", "main", "Clara Novak", "Live", 164, 2810],
    ["Document the webhooks API", "71f0c3d", "docs", "main", "Lena Fischer", "Live", 108, 2875],
    ["Translate the pricing page into German", "c4a8e12", "marketing-site", "agent/pricing-de", "Lena Fischer", "Live", 55, 2990],
    ["Haptics on pull to refresh", "9d3b7f5", "mobile-app", "feat/haptics", "Aiko Tanaka", "Failed", 201, 3105],
    ["Rename the colour tokens", "e8b2d40", "design-system", "agent/token-names", "Aiko Tanaka", "Live", 61, 3220],
    ["Fix broken links in the quickstart", "16c9a3e", "docs", "main", "Jonas Berg", "Live", 101, 4290],
    ["Cache avatars between launches", "a73e5d8", "mobile-app", "main", "Sam Okafor", "Live", 188, 4410],
    ["Darker borders in dark mode", "5f0a2b9", "design-system", "main", "Maya Chen", "Live", 58, 5740],
    ["Write tests for the refund flow", "0c6e4f1", "billing-api", "agent/refund-tests", "Omar Haddad", "Live", 158, 5815],
    ["Customer logos on the home page", "b29d8e3", "marketing-site", "main", "Sam Okafor", "Live", 50, 5960],
    ["Search the docs from anywhere with ⌘K", "47e1c0a", "docs", "feat/search", "Jonas Berg", "Live", 115, 7180],
    ["Upgrade Node to 22", "d8a3f69", "billing-api", "chore/node-22", "Tomás Reyes", "Live", 149, 7255],
];

const deploys: Deploy[] = sample.map(([message, sha, project, branch, author, status, seconds, minutesAgo]) => ({
    id: sha,
    message,
    sha,
    project,
    branch,
    author,
    status,
    seconds,
    minutesAgo,
}));

function took(seconds: number) {
    return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s`;
}

function ago(minutes: number) {
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 24 * 60) return `${Math.floor(minutes / 60)} h ago`;
    const days = Math.floor(minutes / (24 * 60));
    return days === 1 ? "Yesterday" : `${days} days ago`;
}

const columns: Array<TableColumn<Deploy>> = [
    {
        key: "message",
        header: "Commit",
        sortable: true,
        render: (deploy) => (
            <span className="table-toolbar__commit">
                <Text as="span">{deploy.message}</Text>
                <Text as="span" variant="code" tone="muted" className="table-toolbar__meta">
                    {deploy.sha}
                    <span className="table-toolbar__on">
                        {" on "}
                        <Text as="span" variant="code" tone="soft" className="table-toolbar__meta">
                            {deploy.branch}
                        </Text>
                    </span>
                </Text>
            </span>
        ),
    },
    { key: "project", header: "Project", sortable: true, render: (deploy) => <span className="table-toolbar__nowrap">{deploy.project}</span> },
    { key: "author", header: "By", sortable: true, render: (deploy) => <User name={deploy.author} size="sm" /> },
    {
        key: "status",
        header: "Status",
        sortable: true,
        render: (deploy) => (
            <Badge size="sm" variant={tone[deploy.status]}>
                {deploy.status}
            </Badge>
        ),
    },
    {
        key: "seconds",
        header: "Took",
        align: "end",
        sortable: true,
        render: (deploy) => (
            <Text as="span" tone="muted" className="table-toolbar__nowrap">
                {took(deploy.seconds)}
            </Text>
        ),
    },
    {
        key: "minutesAgo",
        header: "Created",
        align: "end",
        sortable: true,
        render: (deploy) => (
            <Text as="span" tone="muted" className="table-toolbar__nowrap">
                {ago(deploy.minutesAgo)}
            </Text>
        ),
    },
];

const perPage = 8;

function compare(a: string | number, b: string | number) {
    return typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "en", { sensitivity: "base" });
}

export function TableToolbar() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("all");
    const [project, setProject] = useState("all");
    const [sort, setSort] = useState<TableSort>({ key: "minutesAgo", direction: "ascending" });
    const [page, setPage] = useState(1);

    // Any change to what's shown starts again from the first page.
    const narrow =
        <T,>(set: (value: T) => void) =>
        (value: T) => {
            set(value);
            setPage(1);
        };

    const text = query.trim().toLowerCase();
    const matching = deploys.filter(
        (deploy) =>
            (status === "all" || deploy.status === status) &&
            (project === "all" || deploy.project === project) &&
            (!text || [deploy.message, deploy.sha, deploy.branch, deploy.project, deploy.author].some((field) => field.toLowerCase().includes(text))),
    );

    // The table only shows arrows (manualSort): sorting happens here, before the rows are split into pages.
    const sorted = [...matching].sort((a, b) => compare(a[sort.key as keyof Deploy], b[sort.key as keyof Deploy]));
    if (sort.direction === "descending") sorted.reverse();

    const pageCount = Math.max(1, Math.ceil(sorted.length / perPage));
    const current = Math.min(page, pageCount);
    const rows = sorted.slice((current - 1) * perPage, current * perPage);
    const first = sorted.length ? (current - 1) * perPage + 1 : 0;

    const clear = () => {
        setQuery("");
        setStatus("all");
        setProject("all");
        setPage(1);
    };

    return (
        <section className="table-toolbar" aria-labelledby="table-toolbar-title">
            <div className="table-toolbar__inner">
                <div className="table-toolbar__header">
                    <div>
                        <Text as="h2" variant="heading" id="table-toolbar-title">
                            Deploys
                        </Text>
                        <Text variant="copy" className="table-toolbar__lead">
                            Every build of every branch across Acme, newest first.
                        </Text>
                    </div>
                    <Button
                        variant="primary"
                        startIcon={<Rocket size={16} />}
                        onClick={() => toast("Choose a project and a branch", { description: "A deploy starts building as soon as you confirm it." })}
                    >
                        Deploy a branch
                    </Button>
                </div>

                <Card padding="none" className="table-toolbar__card">
                    <div className="table-toolbar__toolbar">
                        <SearchField
                            className="table-toolbar__search"
                            size="sm"
                            placeholder="Search commits, branches, people"
                            aria-label="Search deploys"
                            value={query}
                            onChange={narrow(setQuery)}
                        />
                        <Select
                            className="table-toolbar__select"
                            size="sm"
                            aria-label="Status"
                            value={status}
                            onChange={narrow(setStatus)}
                            options={[
                                { value: "all", label: "Any status" },
                                { value: "Live", label: "Live" },
                                { value: "Building", label: "Building" },
                                { value: "Failed", label: "Failed" },
                            ]}
                        />
                        <Select
                            className="table-toolbar__select"
                            size="sm"
                            aria-label="Project"
                            value={project}
                            onChange={narrow(setProject)}
                            options={[
                                { value: "all", label: "All projects" },
                                ...["marketing-site", "billing-api", "mobile-app", "docs", "design-system"].map((id) => ({ value: id, label: id })),
                            ]}
                        />
                        <Text variant="caption" className="table-toolbar__count" aria-live="polite">
                            {matching.length === deploys.length ? `${deploys.length} deploys` : `${matching.length} of ${deploys.length} deploys`}
                        </Text>
                    </div>

                    <Table
                        caption="Deploys"
                        hideCaption
                        columns={columns}
                        rows={rows}
                        sort={sort}
                        onSortChange={(next) => {
                            setSort(next);
                            setPage(1);
                        }}
                        manualSort
                        emptyContent={
                            <EmptyState
                                className="table-toolbar__empty"
                                icon={<SearchX size={20} />}
                                title="No deploys match"
                                description={text ? `Nothing matches “${query.trim()}” with these filters.` : "No deploys have this status in this project."}
                                actions={<Button onClick={clear}>Clear search and filters</Button>}
                            />
                        }
                    />

                    {sorted.length ? (
                        <div className="table-toolbar__footer">
                            <Text variant="caption" className="table-toolbar__range">
                                {first}–{first + rows.length - 1} of {sorted.length}
                            </Text>
                            {pageCount > 1 ? <Pagination size="sm" page={current} pageCount={pageCount} onPageChange={setPage} label="Deploy pages" /> : null}
                        </div>
                    ) : null}
                </Card>
            </div>
        </section>
    );
}
