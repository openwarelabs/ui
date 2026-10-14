import { Empty02 } from "@openwarelabs/blocks";
import { Avatar, Badge, Text, type TableColumn } from "@openwarelabs/ui";

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

const tone = { Live: "success", Building: "active", Failed: "danger" } as const;

const columns: Array<TableColumn<Deploy>> = [
    {
        key: "title",
        header: "Deploy",
        render: (deploy) => (
            <span className="empty-no-results__deploy">
                <Text variant="label">
                    #{deploy.id} {deploy.title}
                </Text>
                <Text variant="caption" truncate className="empty-no-results__branch">
                    {deploy.branch}
                </Text>
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
    {
        key: "when",
        header: "When",
        width: 110,
        align: "end",
        render: (deploy) => (
            <Text variant="body" tone="muted" className="empty-no-results__when">
                {deploy.when}
            </Text>
        ),
    },
];

const statuses: Status[] = ["Live", "Building", "Failed"];
const projects = ["marketing-site", "billing-api", "mobile-app", "docs"];

export function EmptyNoResults() {
    return (
        <Empty02
            className="empty-no-results"
            title="Deploys"
            description="Deploys from the last 30 days, across every project."
            columns={columns}
            rows={deploys}
            searchText={(deploy) => `#${deploy.id} ${deploy.title} ${deploy.branch} ${deploy.project}`}
            filters={[
                { key: "status", label: "Status", options: statuses, value: (deploy) => deploy.status },
                { key: "project", label: "Project", options: projects, value: (deploy) => deploy.project },
            ]}
            defaultQuery="invoice dates"
            defaultFilters={{ status: "Failed", project: "billing-api" }}
            emptyTitle={({ query }) => (query ? `No deploys match “${query}”` : "No deploys match these filters")}
            emptyDescription={({ query, filters }) => {
                const filtered = Boolean(filters.status || filters.project);
                const where = `${filters.project ? `in ${filters.project}` : "in every project"}${filters.status ? `, only at ${filters.status.toLowerCase()} deploys` : ""}`;
                return `We looked ${where}. ${query && filtered ? "Try other words, or clear the filters to look wider." : query ? "Try fewer or different words." : "Clear the filters to see them all."}`;
            }}
            labels={{ search: "Search deploys", count: (shown, total) => `${shown} of ${total} deploys` }}
        />
    );
}
