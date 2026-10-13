import type { ReactNode } from "react";

import { Avatar, Badge, DotGrid, Link, ProgressBar, SectionHeading, Spinner, Text } from "@openwarelabs/ui";
import { Bot, Check, CircleDashed, GitPullRequest, Rocket } from "lucide-react";

import "./FeaturesAlternating.css";

/** An agent working through an issue: what it has done, what it's doing, what's next. */
function AgentRunShot() {
    return (
        <div className="features-alternating__window">
            <div className="features-alternating__window-head">
                <span className="features-alternating__agent">
                    <Bot size={15} />
                </span>
                <span className="features-alternating__heading">
                    <span className="features-alternating__window-title">Bump the Stripe SDK to v15</span>
                    <span className="features-alternating__meta">billing-api · run 1,284</span>
                </span>
                <Badge size="sm" variant="active">
                    Running
                </Badge>
            </div>
            <ol className="features-alternating__steps">
                <li className="features-alternating__step" data-state="done">
                    <span className="features-alternating__marker">
                        <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="features-alternating__step-text">Read issue ACME-412 and the payment tests</span>
                    <span className="features-alternating__time">6s</span>
                </li>
                <li className="features-alternating__step" data-state="done">
                    <span className="features-alternating__marker">
                        <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="features-alternating__step-text">Changed 6 files in src/payments</span>
                    <span className="features-alternating__diff">
                        <span data-tone="add">+84</span> <span data-tone="remove">−61</span>
                    </span>
                </li>
                <li className="features-alternating__step" data-state="current">
                    <span className="features-alternating__marker">
                        <Spinner size="sm" label="" />
                    </span>
                    <ProgressBar className="features-alternating__tests" label="Running the test suite" value={212} max={240} valueLabel="212 of 240" />
                </li>
                <li className="features-alternating__step" data-state="next">
                    <span className="features-alternating__marker">
                        <CircleDashed size={16} />
                    </span>
                    <span className="features-alternating__step-text">Open a pull request for review</span>
                </li>
            </ol>
        </div>
    );
}

const reviews = [
    { title: "Fix invoice dates in the EU", project: "billing-api", by: "Tomás Reyes", add: 42, remove: 8, status: "Checks passed", tone: "success" },
    { title: "Bump the Stripe SDK to v15", project: "billing-api", by: "Agent", add: 84, remove: 61, status: "Ready", tone: "success" },
    { title: "Pricing page copy", project: "marketing-site", by: "Maya Chen", add: 12, remove: 9, status: "Preview building", tone: "active" },
    { title: "Offline drafts on Android", project: "mobile-app", by: "Clara Novak", add: 318, remove: 40, status: "Changes asked", tone: "warning" },
] as const;

/** The review queue: pull requests from people and agents, each with its size and state. */
function ReviewQueueShot() {
    return (
        <div className="features-alternating__window">
            <div className="features-alternating__window-head">
                <span className="features-alternating__window-title">Waiting for review</span>
                <span className="features-alternating__count">4</span>
            </div>
            <ul className="features-alternating__reviews">
                {reviews.map((review) => (
                    <li key={review.title} className="features-alternating__review">
                        {review.by === "Agent" ? (
                            <span className="features-alternating__agent features-alternating__agent--small">
                                <Bot size={13} />
                            </span>
                        ) : (
                            <Avatar name={review.by} size="sm" />
                        )}
                        <span className="features-alternating__heading">
                            <span className="features-alternating__review-title">{review.title}</span>
                            <span className="features-alternating__meta">
                                {review.project} · {review.by === "Agent" ? "Agent for Jonas Berg" : review.by}
                            </span>
                        </span>
                        <span className="features-alternating__diff features-alternating__diff--review">
                            <span data-tone="add">+{review.add}</span> <span data-tone="remove">−{review.remove}</span>
                        </span>
                        <Badge size="sm" variant={review.tone}>
                            {review.status}
                        </Badge>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const log = [
    { time: "12:04:11", text: "Build started on main at a3f9c21" },
    { time: "12:04:59", text: "Built 214 pages in 48s" },
    { time: "12:05:06", text: "212 checks passed" },
    { time: "12:05:08", text: "Promoted to production by Maya Chen" },
];

/** A deploy: what went out, its log, and the last good one to roll back to. */
function DeployShot() {
    return (
        <div className="features-alternating__window">
            <div className="features-alternating__window-head">
                <span className="features-alternating__heading">
                    <span className="features-alternating__window-title">Pricing page copy</span>
                    <span className="features-alternating__meta">marketing-site · production · 4 min ago</span>
                </span>
                <Badge size="sm" variant="success">
                    Live
                </Badge>
            </div>
            <div className="features-alternating__log">
                {log.map((line) => (
                    <span key={line.time} className="features-alternating__log-line">
                        <span className="features-alternating__log-time">{line.time}</span>
                        {line.text}
                    </span>
                ))}
            </div>
            <div className="features-alternating__previous">
                <span className="features-alternating__heading">
                    <span className="features-alternating__review-title">Nav spacing on phones</span>
                    <span className="features-alternating__meta">Previous deploy · 2 h ago</span>
                </span>
                <span className="features-alternating__fake-button">Roll back</span>
            </div>
        </div>
    );
}

interface Feature {
    id: string;
    kicker: string;
    icon: ReactNode;
    title: string;
    text: string;
    points: string[];
    link: string;
    shot: ReactNode;
    shotLabel: string;
}

const features: Feature[] = [
    {
        id: "agents",
        kicker: "Agents",
        icon: <Bot size={15} />,
        title: "Hand the routine work to agents",
        text: "Assign an issue to an agent and it reads the code, makes the change, runs your tests and opens a pull request. You step in to review, not to babysit.",
        points: ["Works in a sandbox with your project's settings", "Stops and asks when a test fails twice", "Every step is logged and can be undone"],
        link: "How agents work",
        shot: <AgentRunShot />,
        shotLabel: "An agent run on billing-api: it has read the issue and changed six files, and is running the tests, 212 of 240 done.",
    },
    {
        id: "reviews",
        kicker: "Reviews",
        icon: <GitPullRequest size={15} />,
        title: "Review every change in one place",
        text: "Pull requests from your team and from agents land in the same queue, each with its diff, its preview and the checks that ran.",
        points: [
            "Approve, ask for changes or hand it back to the agent",
            "Previews build before you open the diff",
            "Smallest changes first, so the queue keeps moving",
        ],
        link: "See the review queue",
        shot: <ReviewQueueShot />,
        shotLabel: "The review queue with four pull requests from people and an agent, each showing lines added and removed and its status.",
    },
    {
        id: "deploys",
        kicker: "Deploys",
        icon: <Rocket size={15} />,
        title: "Ship it, or roll it back, in one click",
        text: "Every branch gets a preview. When a change is approved, promote it to production; if something looks wrong, the last good deploy is a click away.",
        points: ["Builds, checks and promotion in one log", "Roll back without a new build", "Deploys announce themselves in the issue"],
        link: "Read about deploys",
        shot: <DeployShot />,
        shotLabel: "A live deploy of marketing-site with its build log, and the previous deploy ready to roll back to.",
    },
];

export function FeaturesAlternating() {
    return (
        <section className="features-alternating" aria-labelledby="features-alternating-title">
            <div className="features-alternating__inner">
                <SectionHeading
                    eyebrow="How it works"
                    title={<span id="features-alternating-title">From the first idea to the deploy</span>}
                    intro="Acme follows a change the whole way: who asked for it, who or what made it, who approved it and when it went live."
                />

                <div className="features-alternating__rows">
                    {features.map((feature) => (
                        <article key={feature.id} className="features-alternating__row" aria-labelledby={`features-alternating-${feature.id}`}>
                            <div className="features-alternating__copy">
                                <Text variant="label" tone="primary" className="features-alternating__kicker">
                                    {feature.icon}
                                    {feature.kicker}
                                </Text>
                                <Text variant="heading" id={`features-alternating-${feature.id}`} className="features-alternating__title">
                                    {feature.title}
                                </Text>
                                <Text variant="lead" className="features-alternating__text">
                                    {feature.text}
                                </Text>
                                <ul className="features-alternating__points">
                                    {feature.points.map((point) => (
                                        <Text as="li" key={point} tone="soft" className="features-alternating__point">
                                            <Check size={16} aria-hidden="true" />
                                            {point}
                                        </Text>
                                    ))}
                                </ul>
                                <Link href="#" variant="standalone" className="features-alternating__link">
                                    {feature.link} →
                                </Link>
                            </div>
                            <DotGrid className="features-alternating__stage" role="img" aria-label={feature.shotLabel}>
                                {feature.shot}
                            </DotGrid>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
