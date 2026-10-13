import { useState, type ReactNode } from "react";

import { Badge, Button, Link, SectionHeading, buttonClassName } from "@openwarelabs/ui";
import { Bot, Check, ChevronDown, GitPullRequest, Mail, RotateCcw, Rss } from "lucide-react";

import "./Changelog.css";

type Group = "New" | "Improved" | "Fixed";

const groupBadge = { New: "active", Improved: "success", Fixed: "neutral" } as const;

interface Release {
    version: string;
    date: string;
    iso: string;
    title: string;
    summary: string;
    visual?: ReactNode;
    changes: Partial<Record<Group, string[]>>;
}

/** The headline of 2.14, drawn: a pull request an agent opened. */
function AgentPullRequest() {
    return (
        <div
            className="changelog__visual"
            role="img"
            aria-label="A pull request opened by an agent: Fix invoice dates in the EU, with every check passed and ready for review."
        >
            <div className="changelog__pr">
                <div className="changelog__pr-head">
                    <GitPullRequest size={16} />
                    <span className="changelog__pr-title">
                        <span className="changelog__pr-name">Fix invoice dates in the EU</span>
                        <span className="changelog__pr-branch">agent/fix-invoice-dates → main · billing-api</span>
                    </span>
                    <Badge size="sm" variant="success">
                        Ready for review
                    </Badge>
                </div>
                <div className="changelog__steps">
                    {["Read the issue", "Changed 3 files", "Ran 214 tests", "Opened the pull request"].map((step) => (
                        <span key={step}>
                            <Check size={13} />
                            {step}
                        </span>
                    ))}
                </div>
                <div className="changelog__pr-foot">
                    <span className="changelog__agent">
                        <Bot size={13} />
                    </span>
                    <span>
                        Agent run<span className="changelog__for"> for Tomás Reyes</span> · 6 min
                    </span>
                    <span className="changelog__diffstat">
                        <span className="changelog__added">+42</span>
                        <span className="changelog__removed">−17</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

/** The headline of 2.13, drawn: a failed deploy, one click from the last good one. */
function Rollback() {
    return (
        <div
            className="changelog__visual"
            role="img"
            aria-label="billing-api deploy 418 has failed, with a Roll back button; deploy 417, the last good build, is kept ready."
        >
            <div className="changelog__deploys">
                <div className="changelog__deploy">
                    <span className="changelog__deploy-name">
                        <strong>billing-api #418</strong>
                        <span>fix/vat-rounding · Priya Nair · 2 min ago</span>
                    </span>
                    <Badge size="sm" variant="danger">
                        Failed
                    </Badge>
                    <span className={buttonClassName({ size: "sm" })}>
                        <RotateCcw size={14} />
                        Roll back
                    </span>
                </div>
                <div className="changelog__deploy changelog__deploy--warm">
                    <span className="changelog__deploy-name">
                        <strong>billing-api #417</strong>
                        <span>main · the last good build, kept warm</span>
                    </span>
                    <Badge size="sm" variant="neutral">
                        Ready
                    </Badge>
                    <span className="changelog__deploy-spacer" />
                </div>
            </div>
        </div>
    );
}

const releases: Release[] = [
    {
        version: "2.14",
        date: "8 Oct 2026",
        iso: "2026-10-08",
        title: "Agents open their own pull requests",
        summary:
            "Assign a task to an agent and it works on a branch of its own, runs your checks and opens a pull request for your team to review. You can follow every step as it happens.",
        visual: <AgentPullRequest />,
        changes: {
            New: [
                "Agents open pull requests, with a summary of what changed and why.",
                "Reply to a review comment and the agent pushes a fix to the same branch.",
            ],
            Improved: ["Agent runs list every command they ran, with its output.", "Runs on large repositories start about 40% sooner."],
            Fixed: ["Review requests no longer go to people who have left the project."],
        },
    },
    {
        version: "2.13",
        date: "22 Sep 2026",
        iso: "2026-09-22",
        title: "Roll back any deploy in one click",
        summary: "Every project keeps its last good build warm. When a deploy goes wrong, roll back from the deploy page and you're live again in seconds.",
        visual: <Rollback />,
        changes: {
            New: ["Roll back from a deploy's page, its menu or the command palette.", "Deploys can pause for approval before they go to production."],
            Improved: ["Build logs stream as they're written, and keep your place when you scroll up."],
            Fixed: ["Deploys started from a tag show the tag instead of a commit hash.", "The deploy list no longer jumps when a build finishes."],
        },
    },
    {
        version: "2.12",
        date: "9 Sep 2026",
        iso: "2026-09-09",
        title: "A review queue that knows what's waiting on you",
        summary: "Reviews now has a queue of the changes that need you, oldest first, with how long each has been waiting.",
        changes: {
            New: ["The review queue, with filters for project and size."],
            Improved: ["Suggested reviewers are the people who last changed those files.", "Diffs over 1,000 lines open in a quarter of the time."],
            Fixed: ["The diff view keeps your place when new commits arrive."],
        },
    },
    {
        version: "2.11",
        date: "26 Aug 2026",
        iso: "2026-08-26",
        title: "API keys for each project",
        summary: "Create keys that can only reach one project, give each a name, and see when it was last used.",
        changes: {
            New: ["Project API keys, with read-only and read-write scopes."],
            Improved: ["Workspace keys show when they were last used, and from where."],
            Fixed: ["Revoked keys stop working everywhere within a second."],
        },
    },
    {
        version: "2.10",
        date: "12 Aug 2026",
        iso: "2026-08-12",
        title: "Two-step sign-in for every workspace",
        summary: "Owners can require two-step sign-in for everyone in the workspace, with an authenticator app or a security key.",
        changes: {
            New: ["Security keys as a second step.", "A setting to require two-step sign-in for every member."],
            Fixed: ["Invitations sent to an address in capitals can be accepted again."],
        },
    },
];

const shownAtFirst = 3;

export function Changelog() {
    const [showAll, setShowAll] = useState(false);
    const shown = showAll ? releases : releases.slice(0, shownAtFirst);

    return (
        <section className="changelog" aria-labelledby="changelog-title">
            <div className="changelog__inner">
                <div className="changelog__header">
                    <SectionHeading
                        eyebrow="Changelog"
                        title={<span id="changelog-title">What's new in Acme</span>}
                        intro="Everything we ship, newest first. Most weeks bring something new."
                    />
                    <div className="changelog__subscribe">
                        <Link href="#" variant="standalone">
                            <Rss size={15} aria-hidden="true" />
                            RSS feed
                        </Link>
                        <Link href="#" variant="standalone">
                            <Mail size={15} aria-hidden="true" />
                            Monthly email
                        </Link>
                    </div>
                </div>

                <ol className="changelog__list">
                    {shown.map((release, index) => (
                        <li key={release.version} className="changelog__release">
                            <div className="changelog__when">
                                <span className="changelog__version">v{release.version}</span>
                                <time className="changelog__date" dateTime={release.iso}>
                                    {release.date}
                                </time>
                                {index === 0 ? (
                                    <Badge size="sm" variant="neutral">
                                        Latest
                                    </Badge>
                                ) : null}
                            </div>
                            <article className="changelog__body" aria-labelledby={`changelog-${release.version}`}>
                                <span className="changelog__node" aria-hidden="true" />
                                <h3 id={`changelog-${release.version}`} className="changelog__title">
                                    {release.title}
                                </h3>
                                <p className="changelog__summary">{release.summary}</p>
                                {release.visual}
                                <div className="changelog__groups">
                                    {(Object.keys(groupBadge) as Group[]).map((group) =>
                                        release.changes[group] ? (
                                            <div key={group} className="changelog__group">
                                                <Badge size="sm" variant={groupBadge[group]}>
                                                    {group}
                                                </Badge>
                                                <ul className="changelog__items" aria-label={`${group} in ${release.version}`}>
                                                    {release.changes[group].map((change) => (
                                                        <li key={change}>{change}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null,
                                    )}
                                </div>
                            </article>
                        </li>
                    ))}
                </ol>

                {showAll ? null : (
                    <div className="changelog__more">
                        <Button shape="pill" endIcon={<ChevronDown size={16} />} onClick={() => setShowAll(true)}>
                            Show {releases.length - shownAtFirst} older releases
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
