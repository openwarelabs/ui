import { Blog03, type Blog03Release } from "@openwarelabs/blocks";
import { Badge, buttonClassName } from "@openwarelabs/ui";
import { Bot, Check, GitPullRequest, Mail, RotateCcw, Rss } from "lucide-react";

import "./Changelog.css";

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
                        <span>fix/vat-rounding · Clara Novak · 2 min ago</span>
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

const releases: Blog03Release[] = [
    {
        version: "2.14",
        date: "8 Oct 2026",
        dateTime: "2026-10-08",
        title: "Agents open their own pull requests",
        summary:
            "Assign a task to an agent and it works on a branch of its own, runs your checks and opens a pull request for your team to review. You can follow every step as it happens.",
        visual: <AgentPullRequest />,
        changes: [
            {
                label: "New",
                variant: "active",
                items: [
                    "Agents open pull requests, with a summary of what changed and why.",
                    "Reply to a review comment and the agent pushes a fix to the same branch.",
                ],
            },
            {
                label: "Improved",
                variant: "success",
                items: ["Agent runs list every command they ran, with its output.", "Runs on large repositories start about 40% sooner."],
            },
            { label: "Fixed", variant: "neutral", items: ["Review requests no longer go to people who have left the project."] },
        ],
    },
    {
        version: "2.13",
        date: "22 Sep 2026",
        dateTime: "2026-09-22",
        title: "Roll back any deploy in one click",
        summary: "Every project keeps its last good build warm. When a deploy goes wrong, roll back from the deploy page and you're live again in seconds.",
        visual: <Rollback />,
        changes: [
            {
                label: "New",
                variant: "active",
                items: ["Roll back from a deploy's page, its menu or the command palette.", "Deploys can pause for approval before they go to production."],
            },
            { label: "Improved", variant: "success", items: ["Build logs stream as they're written, and keep your place when you scroll up."] },
            {
                label: "Fixed",
                variant: "neutral",
                items: ["Deploys started from a tag show the tag instead of a commit hash.", "The deploy list no longer jumps when a build finishes."],
            },
        ],
    },
    {
        version: "2.12",
        date: "9 Sep 2026",
        dateTime: "2026-09-09",
        title: "A review queue that knows what's waiting on you",
        summary: "Reviews now has a queue of the changes that need you, oldest first, with how long each has been waiting.",
        changes: [
            { label: "New", variant: "active", items: ["The review queue, with filters for project and size."] },
            {
                label: "Improved",
                variant: "success",
                items: ["Suggested reviewers are the people who last changed those files.", "Diffs over 1,000 lines open in a quarter of the time."],
            },
            { label: "Fixed", variant: "neutral", items: ["The diff view keeps your place when new commits arrive."] },
        ],
    },
    {
        version: "2.11",
        date: "26 Aug 2026",
        dateTime: "2026-08-26",
        title: "API keys for each project",
        summary: "Create keys that can only reach one project, give each a name, and see when it was last used.",
        changes: [
            { label: "New", variant: "active", items: ["Project API keys, with read-only and read-write scopes."] },
            { label: "Improved", variant: "success", items: ["Workspace keys show when they were last used, and from where."] },
            { label: "Fixed", variant: "neutral", items: ["Revoked keys stop working everywhere within a second."] },
        ],
    },
    {
        version: "2.10",
        date: "12 Aug 2026",
        dateTime: "2026-08-12",
        title: "Two-step sign-in for every workspace",
        summary: "Owners can require two-step sign-in for everyone in the workspace, with an authenticator app or a security key.",
        changes: [
            { label: "New", variant: "active", items: ["Security keys as a second step.", "A setting to require two-step sign-in for every member."] },
            { label: "Fixed", variant: "neutral", items: ["Invitations sent to an address in capitals can be accepted again."] },
        ],
    },
];

export function Changelog() {
    return (
        <Blog03
            eyebrow="Changelog"
            title="What's new in Acme"
            description="Everything we ship, newest first. Most weeks bring something new."
            links={[
                { label: "RSS feed", href: "#", icon: <Rss size={15} aria-hidden="true" /> },
                { label: "Monthly email", href: "#", icon: <Mail size={15} aria-hidden="true" /> },
            ]}
            releases={releases}
        />
    );
}
