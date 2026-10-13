import { useState } from "react";

import { Avatar, Badge, Button, EmptyState, Menu, MenuItem, SearchField, Tag, VisuallyHidden, toast, type BadgeVariant } from "@openwarelabs/ui";
import { Bot, Check, ChevronDown, GitPullRequest, MessageSquare, SearchX } from "lucide-react";

import "./PageHeadingFilters.css";

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

/** Each filter menu: what it's called, its choices, and how a review matches one. */
const facets = [
    { id: "status", label: "Status", options: ["Needs review", "Changes requested", "Approved"], value: (review: Review) => review.status },
    {
        id: "project",
        label: "Project",
        options: ["marketing-site", "billing-api", "mobile-app", "docs", "design-system"],
        value: (review: Review) => review.project,
    },
    { id: "author", label: "Opened by", options: ["A person", "An agent"], value: (review: Review) => (review.agent ? "An agent" : "A person") },
] as const;

type FacetId = (typeof facets)[number]["id"];

interface Filter {
    facet: FacetId;
    value: string;
}

export function PageHeadingFilters() {
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<Filter[]>([{ facet: "status", value: "Needs review" }]);

    const isOn = (facet: FacetId, value: string) => filters.some((filter) => filter.facet === facet && filter.value === value);
    const toggle = (facet: FacetId, value: string) =>
        setFilters((current) =>
            isOn(facet, value) ? current.filter((filter) => !(filter.facet === facet && filter.value === value)) : [...current, { facet, value }],
        );
    const clearAll = () => {
        setFilters([]);
        setQuery("");
    };

    // Choices in the same menu widen the list (any of them); different menus narrow it (all of them).
    const text = query.trim().toLowerCase();
    const shown = reviews.filter((review) => {
        const matchesText = !text || [review.title, review.project, review.author, `#${review.number}`].some((field) => field.toLowerCase().includes(text));
        const matchesFilters = facets.every((facet) => {
            const chosen = filters.filter((filter) => filter.facet === facet.id).map((filter) => filter.value);
            return chosen.length === 0 || chosen.includes(facet.value(review));
        });
        return matchesText && matchesFilters;
    });

    return (
        <div className="page-heading-filters">
            <div className="page-heading-filters__panel">
                <div className="page-heading-filters__top">
                    <div className="page-heading-filters__header">
                        <div>
                            <h1 className="page-heading-filters__title">Reviews</h1>
                            <p className="page-heading-filters__lead">Changes from your team and its agents, waiting for someone to look at them.</p>
                        </div>
                        <Button
                            variant="primary"
                            startIcon={<GitPullRequest size={16} />}
                            onClick={() => toast("Pick a branch to review", { description: "Opening a review asks the project's owners first." })}
                        >
                            Request review
                        </Button>
                    </div>

                    <div className="page-heading-filters__toolbar">
                        <SearchField
                            className="page-heading-filters__search"
                            size="sm"
                            placeholder="Search by title, project or #number"
                            aria-label="Search reviews"
                            value={query}
                            onChange={setQuery}
                        />
                        {facets.map((facet) => {
                            const count = filters.filter((filter) => filter.facet === facet.id).length;
                            return (
                                <Menu
                                    key={facet.id}
                                    label={facet.label}
                                    trigger={
                                        <Button size="sm" endIcon={<ChevronDown size={14} />}>
                                            {facet.label}
                                            {count ? ` · ${count}` : ""}
                                        </Button>
                                    }
                                >
                                    {facet.options.map((option) => (
                                        <MenuItem
                                            key={option}
                                            role="menuitemcheckbox"
                                            aria-checked={isOn(facet.id, option)}
                                            icon={isOn(facet.id, option) ? <Check size={15} /> : <span className="page-heading-filters__menu-spacer" />}
                                            onClick={(event) => {
                                                // Keep the menu open, so several choices can be ticked in a row.
                                                event.preventDefault();
                                                toggle(facet.id, option);
                                            }}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            );
                        })}
                    </div>

                    <div className="page-heading-filters__applied">
                        {filters.map((filter) => {
                            const facet = facets.find((entry) => entry.id === filter.facet)!;
                            return (
                                <Tag
                                    key={`${filter.facet}-${filter.value}`}
                                    variant="active"
                                    removeLabel={`${facet.label} filter: ${filter.value}`}
                                    onRemove={() => toggle(filter.facet, filter.value)}
                                >
                                    <span className="page-heading-filters__tag-key">{facet.label}:</span> {filter.value}
                                </Tag>
                            );
                        })}
                        {filters.length ? (
                            <Button variant="ghost" size="sm" onClick={() => setFilters([])}>
                                Clear filters
                            </Button>
                        ) : null}
                        <span className="page-heading-filters__count" aria-live="polite">
                            {shown.length} of {reviews.length} reviews
                        </span>
                    </div>
                </div>

                {shown.length ? (
                    <ul className="page-heading-filters__list" aria-label="Reviews">
                        {shown.map((review) => (
                            <li key={review.number} className="page-heading-filters__row">
                                {review.agent ? (
                                    <span className="page-heading-filters__agent" aria-hidden="true">
                                        <Bot size={15} />
                                    </span>
                                ) : (
                                    <Avatar name={review.author} />
                                )}
                                <span className="page-heading-filters__row-text">
                                    <span className="page-heading-filters__row-title">{review.title}</span>
                                    <span className="page-heading-filters__row-meta">
                                        <span className="page-heading-filters__number">#{review.number}</span> · {review.project} ·{" "}
                                        {review.agent ? `Agent for ${review.author}` : review.author} · {review.updated}
                                    </span>
                                </span>
                                <Badge size="sm" variant={tone[review.status]}>
                                    {review.status}
                                </Badge>
                                <span className="page-heading-filters__comments" data-none={review.comments ? undefined : ""}>
                                    <MessageSquare size={14} aria-hidden="true" />
                                    {review.comments}
                                    <VisuallyHidden> comments</VisuallyHidden>
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="page-heading-filters__empty">
                        <EmptyState
                            icon={<SearchX size={20} />}
                            title="No reviews match"
                            description="Try a different search, or take a filter off to see more."
                            actions={<Button onClick={clearAll}>Clear search and filters</Button>}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
