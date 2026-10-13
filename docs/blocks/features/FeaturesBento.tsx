import type { ReactNode } from "react";

import { Avatar, Badge, Kbd, SectionHeading, SettingsRow, Spinner, Stat, Switch } from "@openwarelabs/ui";
import { Bot, FolderKanban, GitBranch, GitPullRequest, Search } from "lucide-react";

import "./FeaturesBento.css";

const runSteps = [
    { text: "Read ACME-412 and the three files it mentions", time: "0:06" },
    { text: "Moved the Stripe SDK from v14.2 to v15.0", time: "1:48" },
    { text: "Rewrote two calls the new version removed", time: "2:31" },
    { text: "Ran 240 tests, all passing", time: "3:51" },
    { text: "Opened pull request #318", time: "4:12" },
];

/** The big card: a finished agent run and the pull request it opened. */
function AgentShot() {
    return (
        <>
            <div className="features-bento__window">
                <div className="features-bento__window-head">
                    <span className="features-bento__bot">
                        <Bot size={14} />
                    </span>
                    <span className="features-bento__window-title">Run 1,284 · billing-api</span>
                    <Badge size="sm" variant="success">
                        Done in 4m 12s
                    </Badge>
                </div>
                <ol className="features-bento__timeline">
                    {runSteps.map((step) => (
                        <li key={step.time} className="features-bento__timeline-step">
                            <span className="features-bento__timeline-dot" />
                            <span className="features-bento__timeline-text">{step.text}</span>
                            <span className="features-bento__timeline-time">{step.time}</span>
                        </li>
                    ))}
                </ol>
            </div>
            <div className="features-bento__window features-bento__pull-request">
                <span className="features-bento__pr-icon">
                    <GitPullRequest size={14} />
                </span>
                <span className="features-bento__lines">
                    <span className="features-bento__strong">Bump the Stripe SDK to v15</span>
                    <span className="features-bento__muted">
                        #318 · <span data-tone="add">+84</span> <span data-tone="remove">−61</span> · 6 files
                    </span>
                </span>
                <Badge size="sm" variant="active">
                    Ready for review
                </Badge>
            </div>
        </>
    );
}

const reviews = [
    { title: "Invoice dates in the EU", by: "Tomás Reyes", status: "Approved", tone: "success" },
    { title: "Pricing page copy", by: "Maya Chen", status: "In review", tone: "active" },
    { title: "Offline drafts", by: "Clara Novak", status: "Changes asked", tone: "warning" },
] as const;

function ReviewShot() {
    return (
        <div className="features-bento__window">
            {reviews.map((review) => (
                <div key={review.title} className="features-bento__row">
                    <Avatar name={review.by} size="sm" />
                    <span className="features-bento__row-title">{review.title}</span>
                    <Badge size="sm" variant={review.tone}>
                        {review.status}
                    </Badge>
                </div>
            ))}
        </div>
    );
}

const previews = [
    { branch: "release/2.4", status: "Live", tone: "success" },
    { branch: "fix/invoice-dates", status: "Building", tone: "active" },
    { branch: "spike/new-nav", status: "Failed", tone: "danger" },
] as const;

function PreviewShot() {
    return (
        <div className="features-bento__window">
            {previews.map((preview) => (
                <div key={preview.branch} className="features-bento__row">
                    <GitBranch size={14} className="features-bento__icon" />
                    <span className="features-bento__row-title features-bento__mono">{preview.branch}</span>
                    <Badge size="sm" variant={preview.tone} icon={preview.status === "Building" ? <Spinner size="sm" label="" /> : undefined}>
                        {preview.status}
                    </Badge>
                </div>
            ))}
        </div>
    );
}

const results = [
    { icon: <FolderKanban size={15} />, title: "billing-api", hint: "Project" },
    { icon: <GitPullRequest size={15} />, title: "Fix invoice dates in the EU", hint: "Review" },
    { icon: <Bot size={15} />, title: "Run 1,284 on billing-api", hint: "Agent run" },
];

/** The command menu, drawn still: what ⌘K finds for "bill". */
function CommandShot() {
    return (
        <div className="features-bento__window">
            <div className="features-bento__search">
                <Search size={15} className="features-bento__icon" />
                <span className="features-bento__query">
                    bill
                    <span className="features-bento__caret" />
                </span>
                <Kbd>esc</Kbd>
            </div>
            <div className="features-bento__results">
                {results.map((result, index) => (
                    <div key={result.title} className="features-bento__result" data-highlighted={index === 0 || undefined}>
                        <span className="features-bento__icon">{result.icon}</span>
                        <span className="features-bento__row-title">{result.title}</span>
                        <span className="features-bento__muted">{result.hint}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InsightShot() {
    return (
        <Stat
            label="Median time to review"
            value="42m"
            change="−18%"
            changeTone="positive"
            description="vs last month"
            trend={[71, 66, 68, 58, 55, 49, 46, 42]}
        />
    );
}

const noop = () => {};

function AccessShot() {
    return (
        <div className="features-bento__window features-bento__settings">
            <SettingsRow label="Single sign-on" description="Okta, Google or any SAML provider">
                <Switch checked onChange={noop} label="Single sign-on" tabIndex={-1} />
            </SettingsRow>
            <SettingsRow label="Require a review to deploy" description="Applies to people and agents">
                <Switch checked onChange={noop} label="Require a review to deploy" tabIndex={-1} />
            </SettingsRow>
        </div>
    );
}

interface Feature {
    id: string;
    title: string;
    text: string;
    shot: ReactNode;
    shotLabel: string;
}

const features: Feature[] = [
    {
        id: "agents",
        title: "Agents that open their own pull requests",
        text: "Assign an issue to an agent. It works in a sandbox with your project's settings, runs the tests and hands you a pull request, with every step written down.",
        shot: <AgentShot />,
        shotLabel: "A finished agent run on billing-api: five steps over four minutes, ending in pull request 318, ready for review.",
    },
    {
        id: "reviews",
        title: "One queue for every review",
        text: "Your team's changes and the agents', side by side.",
        shot: <ReviewShot />,
        shotLabel: "Three pull requests in the review queue: one approved, one in review, one with changes asked.",
    },
    {
        id: "previews",
        title: "A preview for every branch",
        text: "Every push builds a copy of the app to click through.",
        shot: <PreviewShot />,
        shotLabel: "Preview deploys for three branches: one live, one building, one failed.",
    },
    {
        id: "command",
        title: "A keystroke from anything",
        text: "Press ⌘K to find any project, review or run.",
        shot: <CommandShot />,
        shotLabel: "The command menu searching for “bill”, showing a project, a review and an agent run.",
    },
    {
        id: "insights",
        title: "See where the time goes",
        text: "Review time, deploys and agent runs, week by week.",
        shot: <InsightShot />,
        shotLabel: "Median time to review: 42 minutes, down 18% on last month.",
    },
    {
        id: "access",
        title: "Access that fits your organisation",
        text: "Single sign-on, roles and required reviews on Business.",
        shot: <AccessShot />,
        shotLabel: "Workspace settings with single sign-on and required reviews both turned on.",
    },
];

export function FeaturesBento() {
    return (
        <section className="features-bento" aria-labelledby="features-bento-title">
            <div className="features-bento__inner">
                <div className="features-bento__header">
                    <SectionHeading eyebrow="Features" title={<span id="features-bento-title">Less waiting on the work around the work</span>} />
                    <p className="features-bento__intro">
                        The parts of shipping that used to need a person, a ping and a wait now happen on their own, and show you what they did.
                    </p>
                </div>

                <div className="features-bento__grid">
                    {features.map((feature) => (
                        <article
                            key={feature.id}
                            className={`features-bento__card features-bento__card--${feature.id}`}
                            aria-labelledby={`features-bento-${feature.id}`}
                        >
                            <div className="features-bento__copy">
                                <h3 id={`features-bento-${feature.id}`} className="features-bento__title">
                                    {feature.title}
                                </h3>
                                <p className="features-bento__text">{feature.text}</p>
                            </div>
                            <div className="features-bento__visual" role="img" aria-label={feature.shotLabel}>
                                {feature.shot}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
