import type { ReactNode } from "react";

import { Features04 } from "@openwarelabs/blocks";
import { Avatar, AvatarGroup, Badge, ProgressBar, Spinner } from "@openwarelabs/ui";
import { Bot, Check, FileCode, GitPullRequest, ListTodo, Rocket } from "lucide-react";

import "./FeaturesTabs.css";

/** The app around each picture: window dots, a breadcrumb and the people on the project. */
function Frame({ path, label, children }: { path: string[]; label: string; children: ReactNode }) {
    return (
        <div className="features-tabs__frame" role="img" aria-label={label}>
            <div className="features-tabs__chrome">
                <span className="features-tabs__dots">
                    <span />
                    <span />
                    <span />
                </span>
                <span className="features-tabs__path">
                    <span className="features-tabs__mark" />
                    {path.map((part, index) => (
                        <span key={part} className="features-tabs__crumb" data-current={index === path.length - 1 || undefined}>
                            {part}
                        </span>
                    ))}
                </span>
                <AvatarGroup size="sm" max={3} className="features-tabs__people">
                    <Avatar name="Siobhan Murphy" />
                    <Avatar name="Ciarán Kelly" />
                    <Avatar name="Aoife O'Sullivan" />
                    <Avatar name="Declan Walsh" />
                    <Avatar name="Niamh Byrne" />
                </AvatarGroup>
            </div>
            <div className="features-tabs__screen">{children}</div>
        </div>
    );
}

/** A person, or the agent working for them. */
function Owner({ name }: { name: string }) {
    return name === "Agent" ? (
        <span className="features-tabs__bot">
            <Bot size={13} />
        </span>
    ) : (
        <Avatar name={name} size="sm" />
    );
}

const board = [
    {
        column: "Todo",
        issues: [
            { id: "ACME-421", title: "Export invoices as CSV", label: "billing-api", owner: "Róisín O'Brien" },
            { id: "ACME-424", title: "Dark theme for the status page", label: "marketing-site", owner: "Niamh Byrne" },
            { id: "ACME-426", title: "Remove the old pricing table", label: "marketing-site", owner: "Agent" },
        ],
    },
    {
        column: "In progress",
        issues: [
            { id: "ACME-412", title: "Bump the Stripe SDK to v15", label: "billing-api", owner: "Agent", progress: 88 },
            { id: "ACME-417", title: "Offline drafts on Android", label: "mobile-app", owner: "Aoife O'Sullivan" },
        ],
    },
    {
        column: "In review",
        issues: [
            { id: "ACME-409", title: "Fix invoice dates in the EU", label: "billing-api", owner: "Ciarán Kelly" },
            { id: "ACME-415", title: "Pricing page copy", label: "marketing-site", owner: "Siobhan Murphy" },
        ],
    },
];

function PlanScreen() {
    return (
        <div className="features-tabs__board">
            {board.map(({ column, issues }) => (
                <div key={column} className="features-tabs__column">
                    <span className="features-tabs__column-head">
                        <span className="features-tabs__status" data-column={column} />
                        {column}
                        <span className="features-tabs__count">{issues.length}</span>
                    </span>
                    {issues.map((issue) => (
                        <div key={issue.id} className="features-tabs__issue">
                            <span className="features-tabs__issue-id">{issue.id}</span>
                            <span className="features-tabs__issue-title">{issue.title}</span>
                            {"progress" in issue ? (
                                <ProgressBar value={issue.progress} showValue={false} aria-label="Agent progress" className="features-tabs__issue-progress" />
                            ) : null}
                            <span className="features-tabs__issue-foot">
                                <span className="features-tabs__label">{issue.label}</span>
                                <Owner name={issue.owner} />
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

const runs = [
    {
        title: "Bump the Stripe SDK to v15",
        project: "billing-api",
        for: "Declan Walsh",
        state: "Running tests, 212 of 240",
        status: "Running",
        tone: "active",
        time: "3m",
    },
    {
        title: "Fix the flaky checkout test",
        project: "mobile-app",
        for: "Aoife O'Sullivan",
        state: "Opened pull request #96",
        status: "Ready",
        tone: "success",
        time: "11m",
    },
    {
        title: "Rename plans on the pricing page",
        project: "marketing-site",
        for: "Siobhan Murphy",
        state: "Asked which names to use",
        status: "Needs you",
        tone: "warning",
        time: "26m",
    },
    {
        title: "Translate the API guide into German",
        project: "docs",
        for: "Róisín O'Brien",
        state: "Merged by Róisín O'Brien",
        status: "Merged",
        tone: "neutral",
        time: "1h",
    },
] as const;

function DelegateScreen() {
    return (
        <div className="features-tabs__runs">
            <div className="features-tabs__screen-head">
                <span className="features-tabs__screen-title">Agent runs</span>
                <span className="features-tabs__muted">1 running · 1 waiting for you</span>
            </div>
            {runs.map((run) => (
                <div key={run.title} className="features-tabs__run">
                    <span className="features-tabs__bot features-tabs__bot--large">
                        {run.status === "Running" ? <Spinner size="sm" label="" /> : <Bot size={15} />}
                    </span>
                    <span className="features-tabs__lines">
                        <span className="features-tabs__strong">{run.title}</span>
                        <span className="features-tabs__muted">
                            {run.project} · for {run.for}
                        </span>
                    </span>
                    <span className="features-tabs__run-state">{run.state}</span>
                    <span className="features-tabs__time">{run.time}</span>
                    <Badge size="sm" variant={run.tone}>
                        {run.status}
                    </Badge>
                </div>
            ))}
        </div>
    );
}

const files = [
    { name: "src/invoices/dates.ts", add: 12, remove: 4 },
    { name: "src/invoices/dates.test.ts", add: 26, remove: 0 },
    { name: "src/invoices/pdf.ts", add: 4, remove: 4 },
];

const diff = [
    { kind: " ", old: 14, new: 14, code: "export function invoiceDate(issuedAt: Date, timeZone: string) {" },
    { kind: "-", old: 15, new: null, code: "    return issuedAt.toISOString().slice(0, 10);" },
    { kind: "+", old: null, new: 15, code: "    // In the customer's zone, or late invoices show a day early." },
    { kind: "+", old: null, new: 16, code: '    return new Intl.DateTimeFormat("en-CA", {' },
    { kind: "+", old: null, new: 17, code: "        timeZone," },
    { kind: "+", old: null, new: 18, code: '        year: "numeric", month: "2-digit", day: "2-digit",' },
    { kind: "+", old: null, new: 19, code: "    }).format(issuedAt);" },
    { kind: " ", old: 16, new: 20, code: "}" },
];

const checks = ["240 tests passed", "Preview is ready", "Approved by Aoife O'Sullivan"];

function ReviewScreen() {
    return (
        <div className="features-tabs__review">
            <div className="features-tabs__files">
                {files.map((file, index) => (
                    <span key={file.name} className="features-tabs__file" data-current={index === 0 || undefined}>
                        <FileCode size={14} />
                        <span className="features-tabs__file-name">{file.name.split("/").pop()}</span>
                        <span className="features-tabs__add">+{file.add}</span>
                    </span>
                ))}
            </div>
            <div className="features-tabs__diff">
                <div className="features-tabs__diff-head">
                    <span className="features-tabs__mono">src/invoices/dates.ts</span>
                    <span className="features-tabs__add">+12</span>
                    <span className="features-tabs__remove">−4</span>
                </div>
                <div className="features-tabs__code">
                    {diff.map((line, index) => (
                        <span key={index} className="features-tabs__line" data-kind={line.kind === "+" ? "add" : line.kind === "-" ? "remove" : undefined}>
                            <span className="features-tabs__gutter">{line.old ?? ""}</span>
                            <span className="features-tabs__gutter">{line.new ?? ""}</span>
                            <span className="features-tabs__sign">{line.kind}</span>
                            <span className="features-tabs__code-text">{line.code}</span>
                        </span>
                    ))}
                </div>
            </div>
            <div className="features-tabs__checks">
                <span className="features-tabs__screen-title">Fix invoice dates in the EU</span>
                <span className="features-tabs__muted">#311 by Ciarán Kelly</span>
                <ul className="features-tabs__check-list">
                    {checks.map((check) => (
                        <li key={check}>
                            <span className="features-tabs__tick">
                                <Check size={11} strokeWidth={3} />
                            </span>
                            {check}
                        </li>
                    ))}
                </ul>
                <span className="features-tabs__merge">Merge and deploy</span>
            </div>
        </div>
    );
}

const deploys = [
    { project: "marketing-site", branch: "main", what: "Pricing page copy", who: "Siobhan Murphy", when: "4 min ago", status: "Live", tone: "success" },
    {
        project: "billing-api",
        branch: "fix/invoice-dates",
        what: "Fix invoice dates in the EU",
        who: "Ciarán Kelly",
        when: "1 min ago",
        status: "Building",
        tone: "active",
    },
    { project: "mobile-app", branch: "release/2.4", what: "Release 2.4", who: "Aoife O'Sullivan", when: "2 h ago", status: "Live", tone: "success" },
    { project: "docs", branch: "spike/new-nav", what: "Try the new navigation", who: "Niamh Byrne", when: "3 h ago", status: "Failed", tone: "danger" },
] as const;

function ShipScreen() {
    return (
        <div className="features-tabs__ship">
            <div className="features-tabs__deploys">
                {deploys.map((deploy) => (
                    <div key={deploy.branch} className="features-tabs__deploy">
                        <span className="features-tabs__lines">
                            <span className="features-tabs__strong">{deploy.what}</span>
                            <span className="features-tabs__muted">
                                {deploy.project} · <span className="features-tabs__mono">{deploy.branch}</span>
                            </span>
                        </span>
                        <span className="features-tabs__by">
                            <Avatar name={deploy.who} size="sm" />
                            {deploy.who}
                        </span>
                        <span className="features-tabs__time">{deploy.when}</span>
                        <Badge size="sm" variant={deploy.tone}>
                            {deploy.status}
                        </Badge>
                    </div>
                ))}
            </div>
            <div className="features-tabs__log">
                <span>
                    <span className="features-tabs__log-time">12:41:03</span>Installing 312 packages from the lockfile
                </span>
                <span>
                    <span className="features-tabs__log-time">12:41:19</span>Building billing-api for preview
                </span>
                <span>
                    <span className="features-tabs__log-time">12:41:52</span>Running 240 checks…
                </span>
            </div>
        </div>
    );
}

const parts = [
    {
        value: "plan",
        label: "Plan",
        icon: <ListTodo size={16} />,
        caption: "Cycles and issues that move on their own as pull requests open and merge.",
        path: ["Acme", "Cycle 24"],
        screen: <PlanScreen />,
        shotLabel: "A cycle board with issues in Todo, In progress and In review, some owned by people and some by agents.",
    },
    {
        value: "delegate",
        label: "Delegate",
        icon: <Bot size={16} />,
        caption: "Agents take the routine issues and report back: running, ready, or waiting for an answer.",
        path: ["Acme", "Agents"],
        screen: <DelegateScreen />,
        shotLabel: "Four agent runs: one running tests, one ready with a pull request, one asking a question and one merged.",
    },
    {
        value: "review",
        label: "Review",
        icon: <GitPullRequest size={16} />,
        caption: "The diff, the preview and the checks on one screen, next to the issue behind them.",
        path: ["Acme", "billing-api", "#311"],
        screen: <ReviewScreen />,
        shotLabel: "A pull request that fixes invoice dates: the changed lines in dates.ts, and its checks, all passed and approved.",
    },
    {
        value: "ship",
        label: "Ship",
        icon: <Rocket size={16} />,
        caption: "Every branch gets a preview, and every deploy says who shipped what, and when.",
        path: ["Acme", "Deploys"],
        screen: <ShipScreen />,
        shotLabel: "Recent deploys across four projects, live, building and failed, with the build log of the one in progress.",
    },
];

export function FeaturesTabs() {
    return (
        <Features04
            eyebrow="One workspace"
            title="Plan it, hand it off, review it, ship it"
            description="Each part of the work has its own screen, and they all share the same issues, people and history."
            tabs={parts.map((part) => ({
                label: part.label,
                icon: part.icon,
                caption: part.caption,
                visual: (
                    <Frame path={part.path} label={part.shotLabel}>
                        {part.screen}
                    </Frame>
                ),
            }))}
            labels={{ tabs: "Parts of Acme" }}
        />
    );
}
