import { useEffect, useRef, useState } from "react";

import { Avatar, Badge, Button, Dialog, Link, NavItem, NavList, Text, VisuallyHidden, type BadgeVariant } from "@openwarelabs/ui";
import { Bot, GitPullRequest, ListChecks, Rocket, Sparkles } from "lucide-react";

import "./OnboardingWelcome.css";

const reviews: Array<{ title: string; project: string; who: string; status: string; tone: BadgeVariant }> = [
    { title: "Fix invoice dates in the EU", project: "billing-api", who: "Agent for Tomás Reyes", status: "Ready", tone: "active" },
    { title: "Pricing page copy", project: "marketing-site", who: "Maya Chen", status: "Approved", tone: "success" },
    { title: "Release 2.4", project: "mobile-app", who: "Clara Novak", status: "Changes requested", tone: "warning" },
    { title: "Update the API reference", project: "docs", who: "Agent for Jonas Berg", status: "In review", tone: "neutral" },
    { title: "Focus rings on every button", project: "design-system", who: "Aiko Tanaka", status: "In review", tone: "neutral" },
];

const changes = [
    {
        icon: GitPullRequest,
        title: "Agents open their own pull requests",
        description: "Hand over an issue; get back a branch and passing tests.",
    },
    {
        icon: ListChecks,
        title: "One place for reviews",
        description: "Everything waiting on you, from people and agents.",
    },
    {
        icon: Rocket,
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
    const continueButton = useRef<HTMLButtonElement>(null);

    // The dialog focuses its first link as it opens; start on the button that carries on instead.
    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => continueButton.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [open]);

    const close = () => {
        setOpen(false);
        setSeen(true);
    };

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
                <Avatar name="Maya Chen" size="sm" label="Maya Chen" />
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

            <Dialog
                open={open}
                onClose={close}
                width={480}
                className="onboarding-welcome__dialog"
                title={
                    <>
                        <Text variant="caption" className="onboarding-welcome__eyebrow">
                            <span className="onboarding-welcome__eyebrow-dot" aria-hidden="true" />
                            October update
                        </Text>
                        What's new in Acme
                    </>
                }
                description="Three changes from this month, and a few smaller fixes."
                actions={
                    <>
                        <Link href="#" variant="muted">
                            Read the changelog
                        </Link>
                        <Button ref={continueButton} variant="primary" onClick={close}>
                            Continue
                        </Button>
                    </>
                }
            >
                <PullRequestShot />
                <ul className="onboarding-welcome__changes">
                    {changes.map((change) => (
                        <li key={change.title} className="onboarding-welcome__change">
                            <span className="onboarding-welcome__change-icon" aria-hidden="true">
                                <change.icon size={15} />
                            </span>
                            <span className="onboarding-welcome__change-text">
                                <Text variant="label">{change.title}</Text>
                                <Text variant="copy" as="span">
                                    {change.description}
                                </Text>
                            </span>
                        </li>
                    ))}
                </ul>
            </Dialog>
        </div>
    );
}
