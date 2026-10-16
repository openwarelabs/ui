import { useState } from "react";

import { Onboarding03 } from "@openwarelabs/blocks";
import { Avatar, Badge, Button, NavItem, NavList, Text, VisuallyHidden, type BadgeVariant } from "@openwarelabs/ui";
import { Bot, GitPullRequest, ListChecks, Rocket, Sparkles } from "lucide-react";

import "./OnboardingWelcome.css";

const reviews: Array<{ title: string; project: string; who: string; status: string; tone: BadgeVariant }> = [
    { title: "Fix invoice dates in the EU", project: "billing-api", who: "Agent for Ciarán Kelly", status: "Ready", tone: "active" },
    { title: "Pricing page copy", project: "marketing-site", who: "Siobhan Murphy", status: "Approved", tone: "success" },
    { title: "Release 2.4", project: "mobile-app", who: "Aoife O'Sullivan", status: "Changes requested", tone: "warning" },
    { title: "Update the API reference", project: "docs", who: "Agent for Declan Walsh", status: "In review", tone: "neutral" },
    { title: "Focus rings on every button", project: "design-system", who: "Niamh Byrne", status: "In review", tone: "neutral" },
];

const changes = [
    {
        icon: <GitPullRequest size={15} />,
        title: "Agents open their own pull requests",
        description: "Hand over an issue; get back a branch and passing tests.",
    },
    {
        icon: <ListChecks size={15} />,
        title: "One place for reviews",
        description: "Everything waiting on you, from people and agents.",
    },
    {
        icon: <Rocket size={15} />,
        title: "A preview for every branch",
        description: "Click through each change before you merge it.",
    },
];

/** An agent's pull request, drawn with components. Swap it for a screenshot or a short video. */
function PullRequestShot() {
    return (
        <div
            className="onboarding-welcome__visual"
            role="img"
            aria-label="A pull request an agent opened: Fix invoice dates in the EU, 42 lines added and 8 removed, ready for review."
        >
            <div className="onboarding-welcome__pr">
                <div className="onboarding-welcome__pr-head">
                    <GitPullRequest size={16} />
                    <span className="onboarding-welcome__pr-title">Fix invoice dates in the EU</span>
                    <span className="onboarding-welcome__pr-number">#482</span>
                </div>
                <div className="onboarding-welcome__pr-meta">
                    <span className="onboarding-welcome__bot">
                        <Bot size={12} />
                    </span>
                    <span className="onboarding-welcome__branch">fix/invoice-dates</span>
                    <span className="onboarding-welcome__diff">
                        <span className="onboarding-welcome__added">+42</span>
                        <span className="onboarding-welcome__removed">−8</span>
                    </span>
                    <Badge size="sm" variant="active">
                        Ready for review
                    </Badge>
                </div>
            </div>
        </div>
    );
}

export function OnboardingWelcome() {
    const [open, setOpen] = useState(true);
    const [seen, setSeen] = useState(false);

    return (
        <div className="onboarding-welcome">
            <header className="onboarding-welcome__bar">
                <Text variant="card-title" as="span" className="onboarding-welcome__brand">
                    <span className="onboarding-welcome__mark" aria-hidden="true" />
                    Acme
                </Text>
                <NavList label="Main" orientation="horizontal" className="onboarding-welcome__nav">
                    {["Projects", "Reviews", "Deploys", "Agents"].map((item) => (
                        <NavItem key={item} href="#" active={item === "Reviews"}>
                            {item}
                        </NavItem>
                    ))}
                </NavList>
                <Button className="onboarding-welcome__news" variant="ghost" size="sm" startIcon={<Sparkles size={16} />} onClick={() => setOpen(true)}>
                    What's new
                    {seen ? null : (
                        <>
                            <span className="onboarding-welcome__news-dot" aria-hidden="true" />
                            <VisuallyHidden>(unread)</VisuallyHidden>
                        </>
                    )}
                </Button>
                <Avatar name="Siobhan Murphy" size="sm" label="Siobhan Murphy" />
            </header>

            <main className="onboarding-welcome__panel">
                <div>
                    <Text variant="heading" as="h2">
                        Reviews
                    </Text>
                    <Text variant="copy" className="onboarding-welcome__subtitle">
                        Changes waiting on you and your team.
                    </Text>
                </div>
                <ul className="onboarding-welcome__list">
                    {reviews.map((review) => (
                        <li key={review.title} className="onboarding-welcome__row">
                            <Avatar name={review.who.replace("Agent for ", "")} size="sm" />
                            <span className="onboarding-welcome__row-text">
                                <Text variant="label" truncate>
                                    {review.title}
                                </Text>
                                <Text variant="caption" truncate>
                                    {review.project} · {review.who}
                                </Text>
                            </span>
                            <Badge size="sm" variant={review.tone}>
                                {review.status}
                            </Badge>
                        </li>
                    ))}
                </ul>
            </main>

            {/* Opens as the page loads; "What's new" in the bar opens it again. */}
            <Onboarding03
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) setSeen(true);
                }}
                eyebrow="October update"
                title="What's new in Acme"
                description="Three changes from this month, and a few smaller fixes."
                visual={<PullRequestShot />}
                changes={changes}
                link={{ label: "Read the changelog", href: "#" }}
            />
        </div>
    );
}
