import { useEffect, useRef, useState } from "react";

import {
    Button,
    ChainOfThought,
    Code,
    Stack,
    type ChainOfThoughtStatus,
    type ChainOfThoughtStep,
} from "@openwarelabs/ui";
import { FileText, ListChecks, Search } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ChainOfThought",
    category: "AI",
    description:
        "An agent's reasoning and plan: “Thinking…” while it works, opening to its reasoning and a list of steps with their status, folded to “Thought for 12 s” when it's done.",
    source: "components/ChainOfThought/ChainOfThought.tsx",
    props: ["ChainOfThoughtProps", "ChainOfThoughtStep"],
    keyboard: [["Enter or Space", "Opens or closes the reasoning."]],
    notes: [
        "The header is a disclosure button with aria-expanded and aria-controls; each step's status is read out as a word before its title.",
        "While status is running it's aria-busy, and the reasoning can stream in without anything jumping. Put it in a ChatMessage, so the conversation announces the finished answer rather than each step.",
        "It opens itself while running and folds away when done, unless the person has opened or closed it, collapseWhenDone is false, or you control expanded.",
    ],
    related: ["ChatTool", "TextShimmer", "Steps"],
    since: "0.5.0",
};

const reasoning =
    "Customers in Ireland see invoices dated the day before, which points at a time zone: the date is probably formatted in UTC on the server. I'll find where invoices format their dates, check whether the PDF does the same, and cover the fix with a test.";

const plan = [
    {
        id: "find",
        title: "Find where invoice dates are formatted",
        detail: (
            <>
                <Code>formatInvoiceDate</Code> in src/billing/invoice.ts, in UTC.
            </>
        ),
    },
    { id: "pdf", title: "Check the PDF invoice", detail: "It has its own formatter, also in UTC." },
    { id: "plan", title: "Plan the fix", detail: "Pass the customer's time zone to both." },
    {
        id: "test",
        title: "Choose a test",
        detail: "A customer in Europe/Dublin billed at 23:30 UTC in July.",
    },
];

/** While running: “Thinking…” over the reasoning as it streams in, then each step in turn. Done, it folds itself away. */
export function Running() {
    const words = reasoning.split(" ");
    const [shown, setShown] = useState(0);
    const [finished, setFinished] = useState(0);
    const [duration, setDuration] = useState<number>();
    const startedAt = useRef(Date.now());
    const streaming = shown < words.length;
    const done = finished === plan.length;

    useEffect(() => {
        if (done) return;
        const timer = window.setTimeout(
            () => {
                if (streaming) return setShown(shown + 2);
                setFinished(finished + 1);
                if (finished + 1 === plan.length) setDuration(Date.now() - startedAt.current);
            },
            streaming ? 70 : 1100,
        );
        return () => window.clearTimeout(timer);
    }, [shown, finished, streaming, done]);

    const steps: ChainOfThoughtStep[] = plan.map((step, index) => {
        const status: ChainOfThoughtStatus =
            index < finished ? "success" : index === finished && !streaming ? "running" : "pending";
        return { ...step, status, detail: status === "success" ? step.detail : undefined };
    });

    const restart = () => {
        startedAt.current = Date.now();
        setShown(0);
        setFinished(0);
        setDuration(undefined);
    };

    return (
        <Stack gap="md" style={{ width: 560, maxWidth: "100%" }}>
            <ChainOfThought status={done ? "success" : "running"} duration={duration} steps={steps}>
                {words.slice(0, shown).join(" ")}
            </ChainOfThought>
            <Stack direction="row">
                <Button size="sm" disabled={!done} onClick={restart}>
                    Run again
                </Button>
            </Stack>
        </Stack>
    );
}
Running.layout = { minHeight: 380 };

/** Done: how long it took and how many steps. It starts folded; this one opens with defaultExpanded, and its steps show their own icons. */
export function Done() {
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <ChainOfThought
                defaultExpanded
                duration={12400}
                steps={[
                    {
                        id: "search",
                        title: "Searched the codebase for formatInvoiceDate",
                        status: "success",
                        icon: <Search />,
                        detail: "4 matches in 2 files",
                    },
                    {
                        id: "read",
                        title: "Read the web and PDF invoice code",
                        status: "success",
                        icon: <FileText />,
                    },
                    {
                        id: "plan",
                        title: "Planned the fix",
                        status: "success",
                        icon: <ListChecks />,
                        detail: "Format dates in the customer's time zone on the web and in the PDF.",
                    },
                ]}
            >
                The dates are formatted in UTC on the server, so an invoice issued after 23:00 in
                Dublin in summer lands on the day before.
            </ChainOfThought>
        </div>
    );
}

/** A failed step shows a cross and the header counts it. With collapseWhenDone={false} it stays open. */
export function FailedStep() {
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <ChainOfThought
                status="error"
                duration={31000}
                collapseWhenDone={false}
                steps={[
                    { id: "edit", title: "Edit src/billing/invoice.ts", status: "success" },
                    {
                        id: "test",
                        title: "Run the billing tests",
                        status: "error",
                        detail: "1 of 86 failed: the PDF still prints the issue date in UTC.",
                    },
                    { id: "fix", title: "Fix the PDF invoice", status: "pending" },
                    { id: "retest", title: "Run the tests again", status: "pending" },
                ]}
            />
        </div>
    );
}

/** Just the reasoning, with no steps. Line breaks in streamed text are kept. */
export function ReasoningOnly() {
    return (
        <div style={{ width: 560, maxWidth: "100%" }}>
            <ChainOfThought defaultExpanded duration={4200}>
                {
                    "Tomás asked for a clearer test name, nothing else.\nI'll rename it on fix/invoice-dates so it stays in #482, rather than open a new pull request."
                }
            </ChainOfThought>
        </div>
    );
}
