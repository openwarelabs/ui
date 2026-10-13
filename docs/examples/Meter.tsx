import { useId, useState } from "react";

import {
    Button,
    Field,
    Input,
    Meter,
    Stack,
    Table,
    Text,
    type TableColumn,
} from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Meter",
    category: "Feedback",
    description:
        "An amount within a known range: storage used, runs against a plan's limit, a password's strength. Unlike ProgressBar, it doesn't mean something will finish.",
    source: "components/Meter/Meter.tsx",
    notes: [
        "It's a meter to screen readers, named by its label, with the value label read out as its value.",
        "low, high and optimum work as on the meter element: the range the optimum is in shows success, the range next to it warning, and the far one danger.",
        "Colour isn't enough on its own: when a meter turns warning or danger, say why in words beside it.",
        "Use ProgressBar for work that will finish, like an upload or an install.",
    ],
    related: ["ProgressBar", "Stat", "Slider"],
    since: "0.4.0",
};

const gigabytes: Intl.NumberFormatOptions = {
    style: "unit",
    unit: "gigabyte",
    maximumFractionDigits: 1,
};

/**
 * Storage used, in md, with its parts in sm below. formatOptions writes the numbers in gigabytes, and valueLabel puts
 * them into words.
 */
export function Storage() {
    return (
        <Stack gap="2xl" style={{ width: 400, maxWidth: "100%" }}>
            <Meter
                label="Storage"
                value={8.2}
                max={10}
                size="md"
                formatOptions={gigabytes}
                valueLabel={({ value, max }) => `${value} of ${max}`}
            />
            <Stack gap="lg">
                <Meter label="Repositories" value={5.1} max={10} formatOptions={gigabytes} />
                <Meter label="Agent logs" value={2.4} max={10} formatOptions={gigabytes} />
                <Meter label="Build artefacts" value={0.7} max={10} formatOptions={gigabytes} />
            </Stack>
        </Stack>
    );
}

/**
 * Agent runs against the plan's limit. With optimum={0}, it's success below low, warning from low to high and danger
 * past high, and the line under it says why.
 */
export function UsageLimit() {
    const limit = 500;
    const noteId = useId();
    const [runs, setRuns] = useState(412);
    const left = limit - runs;
    const note =
        runs < 400
            ? `${left} runs left this month.`
            : runs <= 475
              ? `Almost at your plan's limit: ${left} runs left until 1 November.`
              : left > 0
                ? `Only ${left} runs left. Agents pause at the limit until 1 November.`
                : "You've used every run this month. Agents pause until 1 November.";
    return (
        <Stack gap="md" style={{ width: 400, maxWidth: "100%" }}>
            <Meter
                label="Agent runs this month"
                value={runs}
                max={limit}
                low={400}
                high={475}
                optimum={0}
                size="md"
                formatOptions={{ style: "decimal" }}
                valueLabel={({ value, max }) => `${value} of ${max}`}
                aria-describedby={noteId}
            />
            <Text variant="caption" id={noteId}>
                {note}
            </Text>
            <Stack direction="row" gap="sm">
                <Button
                    size="sm"
                    onClick={() => setRuns((count) => Math.min(limit, count + 25))}
                    disabled={runs >= limit}
                >
                    Run 25 tasks
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRuns(120)}>
                    Start a new month
                </Button>
            </Stack>
        </Stack>
    );
}

const strength = [
    { label: "Too short", tone: "danger" },
    { label: "Weak", tone: "danger" },
    { label: "Fair", tone: "warning" },
    { label: "Good", tone: "success" },
    { label: "Strong", tone: "success" },
] as const;

function scorePassword(password: string) {
    if (password.length < 8) return 0;
    let score = 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password) && /[^A-Za-z\d]/.test(password)) score += 1;
    if (password.length >= 14) score += 1;
    return score;
}

/** segments={4} draws a password's strength as blocks, with the level as valueLabel and a tone for each level. */
export function PasswordStrength() {
    const [password, setPassword] = useState("acme-ships");
    const score = scorePassword(password);
    const level = strength[score]!;
    return (
        <Stack gap="lg" style={{ width: 320, maxWidth: "100%" }}>
            <Field
                label="New password"
                hint="At least 8 characters. Mix cases, digits and symbols, or make it longer."
            >
                <Input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </Field>
            <Meter
                label="Strength"
                value={score}
                max={4}
                segments={4}
                valueLabel={level.label}
                tone={level.tone}
            />
        </Stack>
    );
}
PasswordStrength.layout = { align: "start" as const };

interface Workspace {
    id: string;
    name: string;
    plan: string;
    runs: number;
    limit: number;
}

const workspaces: Workspace[] = [
    { id: "w1", name: "Checkout", plan: "Team", runs: 182, limit: 500 },
    { id: "w2", name: "Mobile app", plan: "Team", runs: 431, limit: 500 },
    { id: "w3", name: "Platform", plan: "Business", runs: 1960, limit: 2000 },
    { id: "w4", name: "Docs site", plan: "Starter", runs: 12, limit: 100 },
];

const count = new Intl.NumberFormat("en-GB");

const columns: Array<TableColumn<Workspace>> = [
    {
        key: "name",
        header: "Workspace",
        render: (workspace) => <strong style={{ fontWeight: 500 }}>{workspace.name}</strong>,
    },
    { key: "plan", header: "Plan" },
    {
        key: "runs",
        header: "Agent runs this month",
        width: "45%",
        render: (workspace) => (
            <Stack direction="row" gap="lg" align="center">
                <div style={{ flex: 1, minWidth: 64 }}>
                    <Meter
                        aria-label={`Agent runs in ${workspace.name}`}
                        value={workspace.runs}
                        max={workspace.limit}
                        low={workspace.limit * 0.8}
                        high={workspace.limit * 0.95}
                        optimum={0}
                        showValue={false}
                        valueLabel={`${count.format(workspace.runs)} of ${count.format(workspace.limit)}`}
                    />
                </div>
                <span
                    style={{
                        minWidth: 96,
                        color: "var(--ow-text-muted)",
                        fontSize: 13,
                        fontVariantNumeric: "tabular-nums",
                        textAlign: "end",
                    }}
                >
                    {count.format(workspace.runs)} of {count.format(workspace.limit)}
                </span>
            </Stack>
        ),
    },
];

/** A compact meter in a table row: no label above it, an aria-label naming the row, and the numbers beside it. */
export function InATable() {
    return (
        <Table
            caption="Agent runs by workspace"
            hideCaption
            columns={columns}
            rows={workspaces}
            density="compact"
        />
    );
}
InATable.layout = { fill: true };
