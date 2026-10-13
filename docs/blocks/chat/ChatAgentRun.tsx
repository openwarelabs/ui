import { useEffect, useRef, useState, type ReactNode } from "react";

import { Badge, Button, Code, Link, Spinner, VisuallyHidden, type BadgeVariant } from "@openwarelabs/ui";
import { Bot, Check, ChevronRight, CircleStop, Hand, RotateCcw, ShieldCheck, Square, X } from "lucide-react";

import "./ChatAgentRun.css";

type Status = "done" | "running" | "failed" | "waiting" | "approval" | "stopped";
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

/**
 * How far the run has got after the steps that are already done:
 * 0 the tests are running again, 1 it waits for approval to push, 2 it pushes, 3 it asks for a review, 4 it's finished.
 */
type Stage = 0 | 1 | 2 | 3 | 4;

const formatElapsed = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

function Marker({ status }: { status: Status }) {
    return (
        <span className={`chat-agent-run__marker chat-agent-run__marker--${status}`} aria-hidden="true">
            {status === "done" ? <Check size={13} strokeWidth={3} /> : null}
            {status === "failed" ? <X size={13} strokeWidth={3} /> : null}
            {status === "approval" ? <Hand size={12} strokeWidth={2.5} /> : null}
            {status === "stopped" ? <Square size={9} fill="currentColor" strokeWidth={0} /> : null}
            {status === "running" ? <Spinner size="sm" label="" /> : null}
        </span>
    );
}

function Files({ files, open, onToggle }: { files: FileChange[]; open: string[]; onToggle: (path: string) => void }) {
    return (
        <ul className="chat-agent-run__files" aria-label="Files changed">
            {files.map((file) => {
                const expanded = open.includes(file.path);
                return (
                    <li key={file.path} className="chat-agent-run__file">
                        <button type="button" className="chat-agent-run__file-button" aria-expanded={expanded} onClick={() => onToggle(file.path)}>
                            <ChevronRight className="chat-agent-run__chevron" size={14} aria-hidden="true" />
                            <span className="chat-agent-run__path">{file.path}</span>
                            <span className="chat-agent-run__added" aria-label={`${file.added} lines added`}>
                                +{file.added}
                            </span>
                            <span className="chat-agent-run__removed" aria-label={`${file.removed} lines removed`}>
                                −{file.removed}
                            </span>
                        </button>
                        {expanded ? (
                            <pre className="chat-agent-run__diff" aria-label={`Changes to ${file.path}`}>
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
                            </pre>
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
    const [elapsed, setElapsed] = useState(134);
    const [open, setOpen] = useState<string[]>(["src/invoices/format.ts"]);
    const control = useRef<HTMLButtonElement>(null);
    const decided = useRef(false);

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

    // Approving or refusing removes the buttons; keep the keyboard on the run's own Stop or Run again.
    useEffect(() => {
        if (decided.current) control.current?.focus();
        decided.current = false;
    }, [stage, run]);
    const decide = (approve: boolean) => {
        decided.current = true;
        if (approve) setStage(2);
        else setRun("stopped");
    };

    const toggleFile = (path: string) => setOpen((paths) => (paths.includes(path) ? paths.filter((other) => other !== path) : [...paths, path]));
    const restart = () => {
        setStage(0);
        setRun("running");
        setElapsed(134);
    };

    /** The status of a step that runs at these stages; a stopped run stops the step it was on. */
    const statusFor = (first: Stage, last: Stage = first): Status => {
        if (stage < first) return "waiting";
        if (stage > last) return "done";
        if (run === "stopped") return "stopped";
        return stage === 1 ? "approval" : "running";
    };
    const pushStatus = statusFor(1, 2);

    const steps: Array<{ title: string; status: Status; time?: string; content?: ReactNode }> = [
        {
            title: "Read the issue and make a plan",
            status: "done",
            time: "6 s",
            content: <p className="chat-agent-run__note">Format invoice dates in the customer's time zone, not the server's, and cover it with tests.</p>,
        },
        {
            title: "Find where invoice dates are formatted",
            status: "done",
            time: "11 s",
            content: (
                <p className="chat-agent-run__note">
                    <Code>formatInvoiceDate</Code> in src/invoices/format.ts, used by the web invoice and the PDF.
                </p>
            ),
        },
        { title: "Edit 3 files", status: "done", time: "38 s", content: <Files files={edits} open={open} onToggle={toggleFile} /> },
        {
            title: "Run the tests",
            status: "failed",
            time: "Failed after 24 s",
            content: (
                <p className="chat-agent-run__error">
                    1 of 86 failed: pdf › prints the issue date in the customer's time zone. Expected “15 July 2026”, got “14 July 2026”.
                </p>
            ),
        },
        {
            title: "Fix the PDF invoice",
            status: "done",
            time: "19 s",
            content: (
                <>
                    <p className="chat-agent-run__note">
                        The PDF had its own date formatter. It uses <Code>formatInvoiceDate</Code> now.
                    </p>
                    <Files files={pdfFix} open={open} onToggle={toggleFile} />
                </>
            ),
        },
        {
            title: "Run the tests again",
            status: statusFor(0),
            time: stage > 0 ? "86 of 86 passed · 31 s" : undefined,
        },
        {
            title: "Push the branch and open a pull request",
            status: pushStatus,
            time: stage > 2 ? "4 s" : undefined,
            content:
                pushStatus === "approval" ? (
                    <div className="chat-agent-run__approval chat-agent-run__enter">
                        <p className="chat-agent-run__approval-text">
                            The agent wants to push <strong>fix/invoice-dates</strong> to GitHub and open a pull request against <strong>main</strong>. 4 files,{" "}
                            <span className="chat-agent-run__added">+9</span> <span className="chat-agent-run__removed">−3</span>. Nothing reaches main until
                            someone merges it.
                        </p>
                        <div className="chat-agent-run__approval-actions">
                            <Button variant="primary" size="sm" startIcon={<ShieldCheck size={16} />} onClick={() => decide(true)}>
                                Approve and push
                            </Button>
                            <Button size="sm" onClick={() => decide(false)}>
                                Don't push
                            </Button>
                        </div>
                    </div>
                ) : stage > 2 ? (
                    <p className="chat-agent-run__note">
                        Opened <Link href="#">#482 Fix invoice dates in the EU</Link>.
                    </p>
                ) : pushStatus === "stopped" ? (
                    <p className="chat-agent-run__note">Nothing was pushed. The changes stay with this run if you want to come back to them.</p>
                ) : null,
        },
        {
            title: "Ask Tomás Reyes to review",
            status: statusFor(3),
            time: stage > 3 ? "Requested" : undefined,
        },
    ];

    const statusText = (status: Status, time?: string) => {
        if (status === "running") return "Running…";
        if (status === "approval") return "Needs you";
        if (status === "stopped") return "Stopped";
        if (status === "waiting") return run === "running" ? "Waiting" : "Not run";
        return time;
    };

    const badge: { label: string; tone: BadgeVariant } =
        run === "done"
            ? { label: "Done", tone: "success" }
            : run === "stopped"
              ? { label: "Stopped", tone: "neutral" }
              : waitingForPerson
                ? { label: "Needs approval", tone: "warning" }
                : { label: "Running", tone: "active" };

    return (
        <section className="chat-agent-run" aria-labelledby="chat-agent-run-title">
            <div className="chat-agent-run__panel">
                <header className="chat-agent-run__header">
                    <span className="chat-agent-run__bot" aria-hidden="true">
                        <Bot size={18} />
                    </span>
                    <div className="chat-agent-run__heading">
                        <h2 id="chat-agent-run-title" className="chat-agent-run__title">
                            Fix invoice dates in the EU
                        </h2>
                        <p className="chat-agent-run__meta">
                            <span>billing-api</span>
                            <span className="chat-agent-run__meta-sep" aria-hidden="true">
                                /
                            </span>
                            <span className="chat-agent-run__mono">fix/invoice-dates</span>
                            <span className="chat-agent-run__meta-sep chat-agent-run__meta-sep--dot" aria-hidden="true">
                                ·
                            </span>
                            <span>Started by Maya Chen</span>
                        </p>
                    </div>
                    <div className="chat-agent-run__controls">
                        <Badge size="sm" variant={badge.tone} role="status">
                            {badge.label}
                        </Badge>
                        <span className="chat-agent-run__elapsed">
                            <VisuallyHidden>Time taken: </VisuallyHidden>
                            {formatElapsed(elapsed)}
                        </span>
                        {run === "running" ? (
                            <Button ref={control} size="sm" startIcon={<CircleStop size={16} />} onClick={() => setRun("stopped")}>
                                Stop
                            </Button>
                        ) : (
                            <Button ref={control} size="sm" startIcon={<RotateCcw size={16} />} onClick={restart}>
                                Run again
                            </Button>
                        )}
                    </div>
                </header>

                <ol className="chat-agent-run__steps" aria-label="Steps">
                    {steps.map((step) => (
                        <li key={step.title} className="chat-agent-run__step" data-status={step.status}>
                            <Marker status={step.status} />
                            <div className="chat-agent-run__body">
                                <div className="chat-agent-run__row">
                                    <span className="chat-agent-run__step-title">{step.title}</span>
                                    <span className={`chat-agent-run__status chat-agent-run__status--${step.status}`}>
                                        {statusText(step.status, step.time)}
                                    </span>
                                </div>
                                {step.content}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
