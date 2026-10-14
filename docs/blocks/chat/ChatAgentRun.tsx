import { useEffect, useState, type ReactNode } from "react";

import {
    Badge,
    Button,
    ChainOfThought,
    ChatAgentAvatar,
    ChatSource,
    ChatSources,
    ChatTool,
    Code,
    Link,
    Prose,
    Text,
    VisuallyHidden,
    type BadgeVariant,
    type ChatSourceItem,
    type ChatToolStatus,
} from "@openwarelabs/ui";
import { ChevronRight, CircleStop, FileCode2, FilePenLine, FlaskConical, GitPullRequest, LifeBuoy, RotateCcw, UserRoundCheck } from "lucide-react";

import "./ChatAgentRun.css";

type RunState = "running" | "stopped" | "done";

interface FileChange {
    path: string;
    added: number;
    removed: number;
    /** Lines of the diff, each starting with "+", "-", " " or "@@". */
    diff: string[];
}

const edits: FileChange[] = [
    {
        path: "src/invoices/format.ts",
        added: 2,
        removed: 2,
        diff: [
            "@@ -9,7 +9,7 @@",
            " export function formatInvoiceDate(issuedAt: Date, customer: Customer) {",
            '-    return new Intl.DateTimeFormat("en-GB", {',
            "+    return new Intl.DateTimeFormat(customer.locale, {",
            '         dateStyle: "long",',
            '-        timeZone: "UTC",',
            "+        timeZone: customer.timeZone,",
            "     }).format(issuedAt);",
        ],
    },
    {
        path: "test/invoices/format.test.ts",
        added: 5,
        removed: 0,
        diff: [
            "@@ -0,0 +1,5 @@",
            '+it("dates an invoice in the customer\'s time zone", () => {',
            '+    const dublin = { locale: "en-IE", timeZone: "Europe/Dublin" };',
            '+    const issuedAt = new Date("2026-07-14T23:30:00Z");',
            '+    expect(formatInvoiceDate(issuedAt, dublin)).toBe("15 July 2026");',
            "+});",
        ],
    },
    {
        path: "src/customers/types.ts",
        added: 1,
        removed: 0,
        diff: ["@@ -4,6 +4,7 @@", "     locale: string;", "+    timeZone: string;", "     country: string;"],
    },
];

const pdfFix: FileChange[] = [
    {
        path: "src/invoices/pdf.ts",
        added: 1,
        removed: 1,
        diff: [
            "@@ -31,7 +31,7 @@",
            "-    const issued = formatDate(invoice.issuedAt);",
            "+    const issued = formatInvoiceDate(invoice.issuedAt, invoice.customer);",
        ],
    },
];

/** What the agent read before it changed anything, cited in its reasoning and its summary. */
const sources: Array<ChatSourceItem & { id: string }> = [
    {
        id: "ticket",
        index: 1,
        title: "Our July invoice is dated 14 July",
        source: "Support ticket 1093 · Halcyon · 15 July",
        snippet: "We were billed just after midnight on 15 July, but the invoice says 14 July. Our accountant needs the right date.",
        href: "#",
        icon: <LifeBuoy size={15} />,
    },
    {
        id: "format",
        index: 2,
        title: "formatInvoiceDate",
        source: "src/invoices/format.ts · lines 9–15",
        snippet:
            'export function formatInvoiceDate(issuedAt: Date) {\n    return new Intl.DateTimeFormat("en-GB", {\n        dateStyle: "long",\n        timeZone: "UTC",\n    }).format(issuedAt);\n}',
        href: "#",
        icon: <FileCode2 size={15} />,
    },
    {
        id: "pdf",
        index: 3,
        title: "renderInvoicePdf",
        source: "src/invoices/pdf.ts · lines 24–38",
        snippet: "// Its own formatter, also in UTC\nconst issued = formatDate(invoice.issuedAt);",
        href: "#",
        icon: <FileCode2 size={15} />,
    },
];

/** The inline citation for a source, by its number. */
const cite = (index: number) => {
    const { id, ...item } = sources.find((source) => source.index === index)!;
    return <ChatSource {...item} snippetFormat={id === "ticket" ? "text" : "code"} />;
};

/**
 * How far the run has got after the steps that are already done:
 * 0 the tests are running again, 1 it waits for approval to push, 2 it pushes, 3 it asks for a review, 4 it's finished.
 */
type Stage = 0 | 1 | 2 | 3 | 4;

const formatElapsed = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Lines added and removed, in green and red, with words for screen readers. */
function DiffCount({ added, removed }: { added: number; removed: number }) {
    return (
        <>
            <Text as="span" variant="caption" tone="success">
                <span aria-hidden="true">+{added}</span>
                <VisuallyHidden>{added} lines added,</VisuallyHidden>
            </Text>{" "}
            <Text as="span" variant="caption" tone="danger">
                <span aria-hidden="true">−{removed}</span>
                <VisuallyHidden>{removed} removed</VisuallyHidden>
            </Text>
        </>
    );
}

/** The files a step changed, each opening to its diff. */
function Files({ files, open, onToggle }: { files: FileChange[]; open: string[]; onToggle: (path: string) => void }) {
    return (
        <ul className="chat-agent-run__files" aria-label="Files changed">
            {files.map((file) => {
                const expanded = open.includes(file.path);
                return (
                    <li key={file.path} className="chat-agent-run__file">
                        <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            className="chat-agent-run__file-button"
                            aria-expanded={expanded}
                            startIcon={<ChevronRight className="chat-agent-run__chevron" size={14} />}
                            onClick={() => onToggle(file.path)}
                        >
                            <Text variant="code" tone="default" truncate className="chat-agent-run__path">
                                {file.path}
                            </Text>
                            <DiffCount added={file.added} removed={file.removed} />
                        </Button>
                        {expanded ? (
                            <Text as="pre" variant="code" className="chat-agent-run__diff" aria-label={`Changes to ${file.path}`}>
                                {file.diff.map((line, index) => {
                                    const kind = line.startsWith("@@") ? "hunk" : line[0] === "+" ? "add" : line[0] === "-" ? "remove" : "context";
                                    const sign = kind === "add" ? "+" : kind === "remove" ? "−" : "";
                                    return (
                                        <span key={index} className={`chat-agent-run__line chat-agent-run__line--${kind}`} data-sign={sign}>
                                            {kind === "hunk" ? line : line.slice(1)}
                                            {"\n"}
                                        </span>
                                    );
                                })}
                            </Text>
                        ) : null}
                    </li>
                );
            })}
        </ul>
    );
}

export function ChatAgentRun() {
    const [stage, setStage] = useState<Stage>(0);
    const [run, setRun] = useState<RunState>("running");
    const [denied, setDenied] = useState(false);
    const [elapsed, setElapsed] = useState(134);
    const [open, setOpen] = useState<string[]>(["src/invoices/format.ts"]);

    const waitingForPerson = run === "running" && stage === 1;

    // Moves the run along by itself, except at the approval, which waits for the person.
    useEffect(() => {
        if (run !== "running" || stage === 1) return;
        if (stage === 4) {
            setRun("done");
            return;
        }
        const next = { 0: 1, 2: 3, 3: 4 }[stage] as Stage;
        const timer = window.setTimeout(() => setStage(next), stage === 0 ? 2600 : 1400);
        return () => window.clearTimeout(timer);
    }, [stage, run]);

    // The clock runs while the agent is working, not while it waits.
    useEffect(() => {
        if (run !== "running" || waitingForPerson) return;
        const timer = window.setInterval(() => setElapsed((seconds) => seconds + 1), 1000);
        return () => window.clearInterval(timer);
    }, [run, waitingForPerson]);

    const toggleFile = (path: string) => setOpen((paths) => (paths.includes(path) ? paths.filter((other) => other !== path) : [...paths, path]));
    const deny = () => {
        setDenied(true);
        setRun("stopped");
    };
    const restart = () => {
        setStage(0);
        setRun("running");
        setDenied(false);
        setElapsed(134);
    };

    /** The status of a call that runs at these stages; stopping the run cancels the call it was on. */
    const statusFor = (first: Stage, last: Stage = first): ChatToolStatus => {
        if (stage < first) return "pending";
        if (stage > last) return "success";
        if (run === "stopped") return "cancelled";
        return stage === 1 ? "approval" : "running";
    };
    const retest = statusFor(0);
    const push = statusFor(1, 2);
    const review = statusFor(3);

    const badge: { label: string; tone: BadgeVariant } =
        run === "done"
            ? { label: "Done", tone: "success" }
            : run === "stopped"
              ? { label: "Stopped", tone: "neutral" }
              : waitingForPerson
                ? { label: "Needs approval", tone: "warning" }
                : { label: "Running", tone: "active" };

    const steps: Array<{ id: string; content: ReactNode }> = [
        {
            id: "edit",
            content: (
                <ChatTool
                    title="Format invoice dates in the customer's time zone"
                    name="edit_files"
                    icon={<FilePenLine size={15} />}
                    status="success"
                    summary={<DiffCount added={8} removed={2} />}
                    duration={38_000}
                    defaultExpanded
                    output={<Files files={edits} open={open} onToggle={toggleFile} />}
                />
            ),
        },
        {
            id: "test",
            content: (
                <ChatTool
                    title="Run the tests"
                    name="run_tests"
                    icon={<FlaskConical size={15} />}
                    status="error"
                    summary="1 of 86 failed"
                    duration={24_000}
                    input="npm test -- invoices"
                    error={"pdf › prints the issue date in the customer's time zone\nExpected “15 July 2026”, got “14 July 2026”."}
                />
            ),
        },
        {
            id: "note",
            content: (
                <Text variant="copy" className="chat-agent-run__note">
                    The PDF invoice has its own date formatter {cite(3)}, so the fix didn't reach it. Switching it to <Code>formatInvoiceDate</Code>.
                </Text>
            ),
        },
        {
            id: "pdf",
            content: (
                <ChatTool
                    title="Fix the PDF invoice"
                    name="edit_files"
                    icon={<FilePenLine size={15} />}
                    status="success"
                    summary={<DiffCount added={1} removed={1} />}
                    duration={19_000}
                    output={<Files files={pdfFix} open={open} onToggle={toggleFile} />}
                />
            ),
        },
        {
            id: "retest",
            content: (
                <ChatTool
                    title="Run the tests again"
                    name="run_tests"
                    icon={<FlaskConical size={15} />}
                    status={retest}
                    summary={retest === "success" ? "86 tests passed" : retest === "cancelled" ? "Stopped" : undefined}
                    duration={retest === "success" ? 31_000 : undefined}
                    input="npm test -- invoices"
                />
            ),
        },
        {
            id: "push",
            content: (
                <ChatTool
                    title="Push the branch and open a pull request"
                    name="create_pull_request"
                    icon={<GitPullRequest size={15} />}
                    status={push}
                    summary={
                        push === "success" ? "Opened pull request #482" : push === "cancelled" ? (denied ? "Denied, nothing was pushed" : "Stopped") : undefined
                    }
                    duration={push === "success" ? 4_000 : undefined}
                    approvalMessage={
                        <>
                            Wants to push <Code>fix/invoice-dates</Code> to GitHub and open a pull request against <Code>main</Code>. Nothing reaches main until
                            someone merges it.
                        </>
                    }
                    approveLabel="Approve and push"
                    denyLabel="Don't push"
                    onApprove={() => setStage(2)}
                    onDeny={deny}
                />
            ),
        },
        {
            id: "review",
            content: (
                <ChatTool
                    title="Ask Tomás Reyes to review"
                    name="request_review"
                    icon={<UserRoundCheck size={15} />}
                    status={review}
                    summary={review === "success" ? "Requested" : review === "cancelled" ? "Stopped" : undefined}
                    duration={review === "success" ? 1_200 : undefined}
                />
            ),
        },
    ];

    return (
        <section className="chat-agent-run" aria-labelledby="chat-agent-run-title">
            <div className="chat-agent-run__panel">
                <header className="chat-agent-run__header">
                    <ChatAgentAvatar size="lg" />
                    <div className="chat-agent-run__heading">
                        <Text variant="card-title" as="h2" id="chat-agent-run-title">
                            Fix invoice dates in the EU
                        </Text>
                        <Text variant="caption" as="p" className="chat-agent-run__meta">
                            <span>billing-api</span>
                            <span className="chat-agent-run__meta-sep" aria-hidden="true">
                                /
                            </span>
                            <Code>fix/invoice-dates</Code>
                            <span className="chat-agent-run__meta-sep chat-agent-run__meta-sep--dot" aria-hidden="true">
                                ·
                            </span>
                            <span>Started by Maya Chen</span>
                        </Text>
                    </div>
                    <div className="chat-agent-run__controls">
                        <Badge size="sm" variant={badge.tone} role="status">
                            {badge.label}
                        </Badge>
                        <Text variant="caption" className="chat-agent-run__elapsed">
                            <VisuallyHidden>Time taken: </VisuallyHidden>
                            {formatElapsed(elapsed)}
                        </Text>
                        {run === "running" ? (
                            <Button size="sm" startIcon={<CircleStop size={16} />} onClick={() => setRun("stopped")}>
                                Stop
                            </Button>
                        ) : (
                            <Button size="sm" startIcon={<RotateCcw size={16} />} onClick={restart}>
                                Run again
                            </Button>
                        )}
                    </div>
                </header>

                <div className="chat-agent-run__body">
                    <ChainOfThought
                        duration={17_400}
                        defaultExpanded
                        steps={[
                            {
                                id: "ticket",
                                title: "Read support ticket 1093",
                                status: "success",
                                detail: <>Halcyon's July invoice is dated 14 July; they were billed at 00:30 on 15 July, Dublin time {cite(1)}.</>,
                            },
                            {
                                id: "find",
                                title: "Find where invoice dates are formatted",
                                status: "success",
                                detail: (
                                    <>
                                        <Code>formatInvoiceDate</Code> in src/invoices/format.ts, in UTC {cite(2)}.
                                    </>
                                ),
                            },
                            {
                                id: "plan",
                                title: "Plan the fix",
                                status: "success",
                                detail: "Format invoice dates in the customer's time zone, not the server's, and cover it with tests.",
                            },
                        ]}
                    >
                        An invoice dated the day before, only for customers east of UTC, points at a time zone: the date is probably formatted on the server, in
                        UTC.
                    </ChainOfThought>

                    <ChatSources sources={sources} />

                    <ol className="chat-agent-run__steps" aria-label="Steps">
                        {steps.map((step) => (
                            <li key={step.id}>{step.content}</li>
                        ))}
                    </ol>

                    {run === "done" ? (
                        <Prose size="sm" className="chat-agent-run__summary">
                            <Text variant="copy" tone="default">
                                Opened <Link href="#">#482 Fix invoice dates in the EU</Link> and asked Tomás Reyes to review it. Invoices are now dated in the
                                customer's time zone, on the web {cite(2)} and in the PDF {cite(3)}, and all 86 tests pass.
                            </Text>
                        </Prose>
                    ) : run === "stopped" ? (
                        <Text variant="copy" className="chat-agent-run__summary">
                            Nothing was pushed. The changes stay with this run if you want to come back to them.
                        </Text>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
