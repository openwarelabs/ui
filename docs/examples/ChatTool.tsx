import { useEffect, useState } from "react";

import { Button, ChatTool, Code, Stack, Text, type ChatToolStatus } from "@openwarelabs/ui";
import {
    FilePenLine,
    FileText,
    FlaskConical,
    GitPullRequest,
    Package,
    Search,
    Terminal,
} from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ChatTool",
    category: "AI",
    description:
        "One tool call an agent makes: what it's doing, the tool, its status and result on one row, opening to the input and output. It asks the person when a call needs approval.",
    source: "components/ChatTool/ChatTool.tsx",
    props: ["ChatToolProps"],
    keyboard: [
        ["Enter or Space", "Opens or closes the input and output."],
        ["Tab", "Reaches Approve and Deny while a call waits for approval."],
    ],
    notes: [
        "The header is a disclosure button with aria-expanded and aria-controls. Its status is read out as a word before the title: “Failed: Check types”.",
        "A running call is aria-busy. A call that waits for approval is announced politely, and after Approve or Deny the keyboard stays on the call.",
        "It's presentational: pass the status, summary, duration and output as they change, many times a second if they stream.",
        "It starts closed, and opens itself for an error or an approval unless you control expanded or the person has toggled it.",
        "A call the person denied, or one cut short when they stopped the run, is cancelled: a slashed ring, read out as “Cancelled”, rather than a failure.",
        "A one-line string input, such as a command, shows in a Snippet; a longer one in a CodeBlock, and an object as formatted JSON. A string output shows in a CodeBlock.",
    ],
    related: ["ChainOfThought", "ChatSource", "CodeBlock", "Disclosure"],
    since: "0.5.0",
};

/** Running: a spinner and a shimmering title, with a summary and time that change as it goes. */
export function Running() {
    const total = 212;
    const [passed, setPassed] = useState(0);
    const done = passed === total;

    useEffect(() => {
        if (done) return;
        const timer = window.setTimeout(
            () => setPassed((count) => Math.min(total, count + 6)),
            110,
        );
        return () => window.clearTimeout(timer);
    }, [passed, done]);

    return (
        <Stack gap="md" style={{ width: 560, maxWidth: "100%" }}>
            <ChatTool
                title="Run the test suite"
                name="run_tests"
                icon={<FlaskConical size={15} />}
                status={done ? "success" : "running"}
                summary={done ? `${total} tests passed` : `${passed} of ${total} tests…`}
                duration={passed * 20}
                input={{ path: "test/", reporter: "dot" }}
                output={
                    done
                        ? "Test files  18 passed (18)\n     Tests  212 passed (212)\n  Duration  4.24 s"
                        : undefined
                }
            />
            <Stack direction="row">
                <Button size="sm" disabled={!done} onClick={() => setPassed(0)}>
                    Run again
                </Button>
            </Stack>
        </Stack>
    );
}

/** Done: a check, the result in one line and the time. It opens to what the tool was given and what it returned. */
export function ReadFiles() {
    const files = [
        ["src/billing/invoice.ts", "148 lines"],
        ["src/billing/pdf.ts", "96 lines"],
        ["src/customers/types.ts", "41 lines"],
    ];
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <ChatTool
                defaultExpanded
                title="Read the invoice code"
                name="read_files"
                icon={<FileText size={15} />}
                status="success"
                summary="Read 3 files"
                duration={380}
                input={{ paths: files.map(([path]) => path) }}
                output={
                    <Stack gap="2xs">
                        {files.map(([path, lines]) => (
                            <Text key={path} variant="copy">
                                <Code>{path}</Code> · {lines}
                            </Text>
                        ))}
                    </Stack>
                }
            />
        </div>
    );
}

/** Failed: a cross, and the error in the danger colour. A failed call starts open. */
export function Failed() {
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <ChatTool
                title="Check types"
                name="typecheck"
                icon={<Terminal size={15} />}
                status="error"
                summary="2 errors in src/billing/pdf.ts"
                duration={8100}
                input="npx tsc --noEmit -p tsconfig.json"
                error={
                    "src/billing/pdf.ts:31:43 - error TS2554: Expected 2 arguments, but got 1.\n" +
                    "src/billing/pdf.ts:58:12 - error TS2339: Property 'timeZone' does not exist on type 'Customer'."
                }
            />
        </div>
    );
}

/** Waiting for approval: it says what the agent wants to do, with Approve and Deny. Approve here, and it runs; deny it, and it's cancelled. */
export function Approval() {
    const [status, setStatus] = useState<ChatToolStatus>("approval");

    useEffect(() => {
        if (status !== "running") return;
        const timer = window.setTimeout(() => setStatus("success"), 1800);
        return () => window.clearTimeout(timer);
    }, [status]);

    const summary =
        status === "success"
            ? "Published 2.4.0"
            : status === "cancelled"
              ? "Denied, nothing was published"
              : undefined;

    return (
        <Stack gap="md" style={{ width: 560, maxWidth: "100%" }}>
            <ChatTool
                title="Publish the billing SDK"
                name="run_command"
                icon={<Package size={15} />}
                status={status}
                summary={summary}
                input={{ command: "npm publish --access public", cwd: "packages/billing-sdk" }}
                approvalMessage={
                    <>
                        Wants to run <Code>npm publish</Code> for @acme/billing-sdk 2.4.0
                    </>
                }
                onApprove={() => setStatus("running")}
                onDeny={() => setStatus("cancelled")}
            />
            {status === "success" || status === "cancelled" ? (
                <Stack direction="row">
                    <Button size="sm" onClick={() => setStatus("approval")}>
                        Ask again
                    </Button>
                </Stack>
            ) : null}
        </Stack>
    );
}

const run = [
    {
        title: "Find where invoice dates are formatted",
        name: "search_code",
        icon: <Search size={15} />,
        summary: "4 matches in 2 files",
        duration: 640,
        input: { query: "formatInvoiceDate", path: "src/" },
    },
    {
        title: "Edit 2 files",
        name: "edit_files",
        icon: <FilePenLine size={15} />,
        summary: "+9 −3",
        duration: 2100,
        input: { paths: ["src/billing/invoice.ts", "src/billing/pdf.ts"] },
    },
    {
        title: "Run the test suite",
        name: "run_tests",
        icon: <FlaskConical size={15} />,
        summary: "86 tests passed",
        duration: 31400,
        input: { path: "test/billing/" },
    },
    {
        title: "Open a pull request",
        name: "create_pull_request",
        icon: <GitPullRequest size={15} />,
        summary: "Opened pull request #482",
        duration: 3800,
        input: { base: "main", head: "fix/invoice-dates", title: "Fix invoice dates in the EU" },
    },
];

/** A run of several tools in sequence: each waits with a hollow ring, runs, then shows its result. */
export function Sequence() {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        if (stage >= run.length) return;
        const timer = window.setTimeout(() => setStage(stage + 1), 1500);
        return () => window.clearTimeout(timer);
    }, [stage]);

    return (
        <Stack gap="md" style={{ width: 560, maxWidth: "100%" }}>
            <Stack gap="xs">
                {run.map((call, index) => {
                    const status =
                        index < stage ? "success" : index === stage ? "running" : "pending";
                    return (
                        <ChatTool
                            key={call.name}
                            title={call.title}
                            name={call.name}
                            icon={call.icon}
                            status={status}
                            summary={status === "success" ? call.summary : undefined}
                            duration={status === "success" ? call.duration : undefined}
                            input={status === "pending" ? undefined : call.input}
                        />
                    );
                })}
            </Stack>
            <Stack direction="row">
                <Button size="sm" disabled={stage < run.length} onClick={() => setStage(0)}>
                    Run again
                </Button>
            </Stack>
        </Stack>
    );
}
