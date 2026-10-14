import { Empty03, type Empty03Item } from "@openwarelabs/blocks";
import { toast } from "@openwarelabs/ui";
import { Activity, Bot } from "lucide-react";

const runs = [
    { task: "Fix invoice dates in the EU", project: "billing-api", for: "Tomás Reyes", status: "Running", time: "4 min" },
    { task: "Add alt text to the pricing page images", project: "marketing-site", for: "Maya Chen", status: "Needs review", time: "12 min" },
    { task: "Write tests for webhook retries", project: "billing-api", for: "Omar Haddad", status: "Done", time: "18 min" },
    { task: "Upgrade the date library", project: "mobile-app", for: "Aiko Tanaka", status: "Done", time: "31 min" },
    { task: "Fix broken links in the API guide", project: "docs", for: "Sam Okafor", status: "Done", time: "9 min" },
] as const;

const tone = { Running: "active", "Needs review": "warning", Done: "success" } as const;

const items: Empty03Item[] = runs.map((run) => ({
    id: run.task,
    icon: <Bot size={15} />,
    title: run.task,
    meta: `${run.project} · for ${run.for}`,
    time: run.time,
    status: { label: run.status, tone: tone[run.status] },
}));

const isRunning = (item: Empty03Item) => item.status?.label === "Running";

export function EmptyError() {
    return (
        <Empty03
            title="Agent runs"
            description="What your agents are working on, and what they've finished today."
            cardTitle="Today"
            views={[
                { value: "all", label: "All" },
                { value: "running", label: "Running", match: isRunning },
                { value: "finished", label: "Finished", match: (item) => !isRunning(item) },
            ]}
            items={items}
            // Stands in for fetching the runs again; this time the request gets through.
            onRetry={() => new Promise((resolve) => window.setTimeout(resolve, 1500))}
            errorTitle="Couldn't load agent runs"
            errorDescription="The request timed out after 30 seconds. Your agents are still working; only this list didn't load."
            errorDetail="504 · req_8f2c41d9"
            secondaryAction={{
                label: "Check status",
                startIcon: <Activity size={16} />,
                onClick: () => toast.info("The activity service is slow", { description: "We're on it. Agent runs themselves aren't affected." }),
            }}
            labels={{ loading: "Loading agent runs…", list: "Agent runs today" }}
        />
    );
}
