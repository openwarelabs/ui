import { PageHeading03 } from "@openwarelabs/blocks";
import { toast, type BadgeVariant } from "@openwarelabs/ui";
import { Bot, GitPullRequest, SearchX } from "lucide-react";

type Status = "Needs review" | "Changes requested" | "Approved";

interface Review {
    number: number;
    title: string;
    project: string;
    author: string;
    agent: boolean;
    status: Status;
    updated: string;
    comments: number;
}

const tone: Record<Status, BadgeVariant> = { "Needs review": "warning", "Changes requested": "danger", Approved: "success" };

/** A review: its number, title, project, who it's for, whether an agent opened it, its status, when it last changed and its comments. */
function row(number: number, title: string, project: string, author: string, agent: boolean, status: Status, updated: string, comments: number): Review {
    return { number, title, project, author, agent, status, updated, comments };
}

const reviews: Review[] = [
    row(482, "Pricing page copy", "marketing-site", "Maya Chen", false, "Needs review", "12 min ago", 3),
    row(219, "Fix invoice dates in the EU", "billing-api", "Tomás Reyes", true, "Needs review", "26 min ago", 1),
    row(311, "Update React Native to 0.76", "mobile-app", "Clara Novak", true, "Needs review", "1 h ago", 0),
    row(309, "Haptics on pull to refresh", "mobile-app", "Aiko Tanaka", false, "Changes requested", "3 h ago", 5),
    row(220, "Write tests for the refund flow", "billing-api", "Omar Haddad", true, "Needs review", "4 h ago", 0),
    row(96, "Document the webhooks API", "docs", "Lena Fischer", false, "Approved", "Yesterday", 4),
    row(154, "Rename the colour tokens", "design-system", "Aiko Tanaka", true, "Approved", "Yesterday", 1),
    row(217, "Round VAT per line, not per invoice", "billing-api", "Lena Fischer", false, "Changes requested", "Yesterday", 7),
    row(481, "Translate the pricing page into German", "marketing-site", "Lena Fischer", true, "Needs review", "2 days ago", 2),
    row(306, "Cache avatars between launches", "mobile-app", "Sam Okafor", false, "Approved", "2 days ago", 2),
];

/** Each filter menu: what it's called and its choices. */
const facets = [
    { id: "status", label: "Status", options: ["Needs review", "Changes requested", "Approved"] },
    { id: "project", label: "Project", options: ["marketing-site", "billing-api", "mobile-app", "docs", "design-system"] },
    { id: "author", label: "Opened by", options: ["A person", "An agent"] },
];

export function PageHeadingFilters() {
    return (
        <PageHeading03
            title="Reviews"
            description="Changes from your team and its agents, waiting for someone to look at them."
            primaryAction={{
                label: "Request review",
                icon: <GitPullRequest size={16} />,
                onClick: () => toast("Pick a branch to review", { description: "Opening a review asks the project's owners first." }),
            }}
            facets={facets}
            defaultFilters={[{ facet: "status", value: "Needs review" }]}
            items={reviews.map((review) => ({
                id: String(review.number),
                title: review.title,
                reference: `#${review.number}`,
                meta: (
                    <>
                        {review.project} · {review.agent ? `Agent for ${review.author}` : review.author} · {review.updated}
                    </>
                ),
                person: review.author,
                icon: review.agent ? <Bot size={15} /> : undefined,
                status: { label: review.status, tone: tone[review.status] },
                comments: review.comments,
                facets: { status: review.status, project: review.project, author: review.agent ? "An agent" : "A person" },
                searchText: [review.title, review.project, review.author, `#${review.number}`],
            }))}
            emptyIcon={<SearchX size={20} />}
            labels={{
                searchPlaceholder: "Search by title, project or #number",
                search: "Search reviews",
                list: "Reviews",
                count: (shown, total) => (
                    <>
                        {shown} of {total} reviews
                    </>
                ),
                emptyTitle: "No reviews match",
            }}
        />
    );
}
