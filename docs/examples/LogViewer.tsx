import { useEffect, useMemo, useRef, useState } from "react";

import { Button, LogViewer, Stack, type LogViewerEntry, type LogViewerHandle } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "LogViewer",
    category: "AI",
    description:
        "Terminal output as it streams: a build, a test run, an agent's tool call. It follows the newest line, colours ANSI escape codes, and renders only the lines in view, so 10,000 lines are fine.",
    source: "components/LogViewer/LogViewer.tsx",
    imports: ["LogViewer"],
    props: ["LogViewerProps", "LogViewerEntry", "LogViewerLabels", "LogViewerHandle"],
    keyboard: [
        ["Tab", "Moves to the toolbar's controls, then to the log, which scrolls with the arrow keys, Page Up, Page Down, Home and End."],
        ["End", "Scrolls to the newest line and follows new lines again."],
        ["Enter, Shift+Enter", "In the search box, move to the next or the previous match."],
        ["Escape", "In the search box, clears the search."],
    ],
    notes: [
        "Pass the log as `lines` (strings, or `{ time, text }` entries) or as one `text` split on newlines. `maxLines` keeps only the last so many; line numbers carry on from the lines dropped.",
        "The log is a `role=\"log\"` region named by `label`, and a tab stop so it scrolls from the keyboard. New lines are read out politely while the view follows the end; scrolling up to read stops both, and `announce={false}` turns the reading off for good, for a log that writes many lines a second.",
        "With `follow` (the default) the view sticks to the end as lines arrive. Scrolling up unsticks it and shows Jump to latest, with a count of the lines that arrived since; scrolling back to the end sticks it again.",
        "ANSI SGR codes become colour and weight: the 16 named colours map to a palette that reads on the light and the dark ground, with 256-colour and 24-bit codes as given. Other escape sequences (cursor moves, hyperlinks) are removed, and copying or downloading gives the plain text.",
        "`levels` tints the gutter of lines that start with ERROR, WARN, INFO or DEBUG (FATAL and TRACE count too). The word stays in the line, so the colour never carries the meaning alone.",
        "Lines are a fixed 20px tall and scroll sideways, so only the ones in view render. With `wrap`, rows are measured as they render, so the scrollbar settles as you scroll through them.",
    ],
    related: ["CodeBlock", "VirtualList", "ChatConversation", "ChainOfThought"],
    since: "0.18.0",
};

const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;
const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
const dim = (text: string) => `\x1b[2m${text}\x1b[0m`;
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;

const modules = [
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/components/Header.tsx",
    "src/components/Hero.tsx",
    "src/components/Pricing.tsx",
    "src/lib/billing.ts",
    "src/lib/analytics.ts",
    "src/styles/tokens.css",
];

function buildLine(index: number) {
    const module = modules[index % modules.length]!;
    const ms = 12 + ((index * 131) % 480);
    if (index % 23 === 7) return `${yellow("warn")}  ${module}: ${dim("'useMemo' is defined but never used")}`;
    if (index % 41 === 19) return `${red("error")} ${module}: ${bold("Property 'plan' does not exist on type 'Customer'")}`;
    if (index % 11 === 0) return `${cyan("info")}  ${blue("tsc")} checked ${module} ${dim(`(${ms}ms)`)}`;
    return `${green("✓")} ${dim("compiled")} ${module} ${dim(`in ${ms}ms`)}`;
}

const prologue = [
    `${bold("$ npm run build")}`,
    `${dim(">")} ${cyan("vite")} ${dim("v5.4.2")} building for production...`,
    `${dim(">")} transforming modules...`,
];

/** A build log that streams in: it follows the newest line until you scroll up, then offers Jump to latest. */
export function StreamingBuild() {
    const [lines, setLines] = useState<string[]>(prologue);
    const [running, setRunning] = useState(true);

    useEffect(() => {
        if (!running) return undefined;
        const timer = setInterval(() => {
            setLines((previous) => [...previous, buildLine(previous.length)]);
        }, 350);
        return () => clearInterval(timer);
    }, [running]);

    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Stack direction="row" gap="sm" wrap>
                <Button size="sm" variant="secondary" onClick={() => setRunning((value) => !value)}>
                    {running ? "Stop" : "Start"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setLines(prologue)}>
                    Clear
                </Button>
            </Stack>
            <LogViewer label="Build output" lines={lines} maxLines={2000} streaming={running} height={280} copyable />
        </Stack>
    );
}
StreamingBuild.layout = { fill: true, align: "start" as const };

const deployLog: LogViewerEntry[] = [
    { time: "09:41:02", text: "INFO  Deploying api-gateway to eu-west-1 (commit 4f2a9c1 by Aoife Byrne)" },
    { time: "09:41:02", text: "DEBUG Resolved 3 config files from deploy/eu-west-1" },
    { time: "09:41:03", text: "INFO  Building image api-gateway:4f2a9c1" },
    { time: "09:41:19", text: "DEBUG Layer cache hit for 12 of 14 layers" },
    { time: "09:41:44", text: "INFO  Pushed api-gateway:4f2a9c1 (212 MB)" },
    { time: "09:41:45", text: "INFO  Running 42 migrations on orders-db" },
    { time: "09:41:51", text: "WARN  Migration 0039_add_vat_rate took 5.8s; consider batching the backfill" },
    { time: "09:41:52", text: "INFO  Migrations done" },
    { time: "09:41:52", text: "INFO  Rolling out 6 replicas" },
    { time: "09:42:04", text: "DEBUG Replica api-gateway-7c9d-1 ready" },
    { time: "09:42:05", text: "DEBUG Replica api-gateway-7c9d-2 ready" },
    { time: "09:42:09", text: "ERROR Replica api-gateway-7c9d-3 failed readiness: connection refused to orders-db:5432" },
    { time: "09:42:10", text: "INFO  Retrying replica api-gateway-7c9d-3 (attempt 2 of 3)" },
    { time: "09:42:21", text: "DEBUG Replica api-gateway-7c9d-3 ready" },
    { time: "09:42:22", text: "DEBUG Replica api-gateway-7c9d-4 ready" },
    { time: "09:42:23", text: "DEBUG Replica api-gateway-7c9d-5 ready" },
    { time: "09:42:25", text: "DEBUG Replica api-gateway-7c9d-6 ready" },
    { time: "09:42:26", text: "INFO  Smoke tests: 18 passed, 0 failed" },
    { time: "09:42:27", text: "INFO  Switched traffic to 4f2a9c1; previous release kept for rollback" },
    { time: "09:42:27", text: "INFO  Deploy finished in 85s. Cian Murphy and Niamh Walsh notified." },
];

/** A finished log to read: line numbers, level tints in the gutter, a search box with a match counter, copy and download. */
export function SearchableLog() {
    return (
        <LogViewer
            label="Deploy log"
            lines={deployLog}
            follow={false}
            lineNumbers
            levels
            searchable
            copyable
            downloadable
            downloadName="deploy-4f2a9c1.txt"
            height={300}
        />
    );
}
SearchableLog.layout = { fill: true, align: "start" as const };

const longLines = [
    `${bold("$ npm test -- --reporter=verbose")}`,
    `${green("PASS")} src/lib/billing.test.ts ${dim("(14 tests, 212ms)")}`,
    `${red("FAIL")} src/lib/analytics.test.ts > tracks a checkout > sends the order total, the currency and the items, each with its sku and quantity, to the collector once the payment is confirmed and not before`,
    `  ${red("AssertionError")}: expected { total: 4800, currency: 'EUR', items: [ { sku: 'OW-TEE-M', qty: 2 } ] } to deeply equal { total: 4800, currency: 'EUR', items: [ { sku: 'OW-TEE-M', qty: 2 }, { sku: 'OW-CAP', qty: 1 } ] }`,
    `  ${dim("at")} ${cyan("src/lib/analytics.test.ts:88:31")}`,
    `  ${dim("at")} ${cyan("node_modules/vitest/dist/chunk-runtime.js:1212:14")}`,
    `${green("PASS")} src/components/Pricing.test.tsx ${dim("(6 tests, 340ms)")}`,
    `${yellow("Test Files")}  1 failed | 2 passed ${dim("(3)")}`,
    `${yellow("     Tests")}  1 failed | 21 passed ${dim("(22)")}`,
];

/** `wrap` breaks long lines instead of scrolling sideways. Rows are measured as they render. */
export function WrappedLines() {
    const [wrap, setWrap] = useState(true);
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Button size="sm" variant="secondary" onClick={() => setWrap((value) => !value)}>
                {wrap ? "Scroll sideways" : "Wrap lines"}
            </Button>
            <LogViewer label="Test output" lines={longLines} wrap={wrap} follow={false} height={260} />
        </Stack>
    );
}
WrappedLines.layout = { fill: true, align: "start" as const };

const owners = ["Aoife", "Cian", "Niamh", "Saoirse", "Oisín", "Eoin"];

/** Ten thousand lines as one `text`: only the ones in view render. The ref scrolls to a line or back to the end. */
export function TenThousandLines() {
    const viewer = useRef<LogViewerHandle>(null);
    const text = useMemo(
        () =>
            Array.from({ length: 10000 }, (_, index) => {
                const level = index % 97 === 50 ? "ERROR" : index % 29 === 10 ? "WARN " : index % 3 === 0 ? "DEBUG" : "INFO ";
                return `${level} worker-${(index % 8) + 1} job ${index + 1} for ${owners[index % owners.length]} ${
                    level === "ERROR" ? "failed: timeout after 30s" : `done in ${20 + ((index * 37) % 400)}ms`
                }`;
            }).join("\n"),
        [],
    );
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Stack direction="row" gap="sm" wrap>
                <Button size="sm" variant="secondary" onClick={() => viewer.current?.scrollToLine(0)}>
                    First line
                </Button>
                <Button size="sm" variant="secondary" onClick={() => viewer.current?.scrollToLine(4999)}>
                    Line 5000
                </Button>
                <Button size="sm" variant="secondary" onClick={() => viewer.current?.scrollToEnd()}>
                    Last line
                </Button>
            </Stack>
            <LogViewer ref={viewer} label="Worker log" text={text} lineNumbers levels searchable height={300} />
        </Stack>
    );
}
TenThousandLines.layout = { fill: true, align: "start" as const };
