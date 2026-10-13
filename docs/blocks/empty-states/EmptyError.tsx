import { useEffect, useRef, useState } from "react";

import { Badge, Button, Code, EmptyState, SegmentedControl, Spinner, Text, toast } from "@openwarelabs/ui";
import { Activity, Bot, CloudOff, RotateCw } from "lucide-react";

import "./EmptyError.css";

type Load = "failed" | "loading" | "loaded";

const runs = [
    { task: "Fix invoice dates in the EU", project: "billing-api", for: "Tomás Reyes", status: "Running", time: "4 min" },
    { task: "Add alt text to the pricing page images", project: "marketing-site", for: "Maya Chen", status: "Needs review", time: "12 min" },
    { task: "Write tests for webhook retries", project: "billing-api", for: "Omar Haddad", status: "Done", time: "18 min" },
    { task: "Upgrade the date library", project: "mobile-app", for: "Aiko Tanaka", status: "Done", time: "31 min" },
    { task: "Fix broken links in the API guide", project: "docs", for: "Sam Okafor", status: "Done", time: "9 min" },
] as const;

const tone = { Running: "active", "Needs review": "warning", Done: "success" } as const;

const views = [
    { value: "all", label: "All" },
    { value: "running", label: "Running" },
    { value: "finished", label: "Finished" },
];

export function EmptyError() {
    const [load, setLoad] = useState<Load>("failed");
    const [view, setView] = useState("all");
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Stands in for fetching the runs again; this time the request gets through.
    const retry = () => {
        setLoad("loading");
        timer.current = window.setTimeout(() => setLoad("loaded"), 1500);
    };

    const shown = runs.filter((run) => view === "all" || (view === "running" ? run.status === "Running" : run.status !== "Running"));

    return (
        <div className="empty-error">
            <main className="empty-error__panel">
                <div className="empty-error__header">
                    <div>
                        <Text variant="heading" as="h2">
                            Agent runs
                        </Text>
                        <Text variant="copy" className="empty-error__subtitle">
                            What your agents are working on, and what they've finished today.
                        </Text>
                    </div>
                </div>

                <section className="empty-error__card" aria-labelledby="empty-error-recent" aria-busy={load === "loading"}>
                    <div className="empty-error__card-head">
                        <Text variant="card-title" as="h3" id="empty-error-recent">
                            Today
                        </Text>
                        <SegmentedControl size="sm" aria-label="Show runs" options={views} value={view} onChange={setView} disabled={load !== "loaded"} />
                    </div>

                    <div className={`empty-error__body${load === "loaded" ? "" : " empty-error__body--waiting"}`}>
                        {load === "failed" ? (
                            <EmptyState
                                icon={<CloudOff size={20} />}
                                title="Couldn't load agent runs"
                                description={
                                    <>
                                        The request timed out after 30 seconds. Your agents are still working; only this list didn't load.
                                        <br />
                                        <Code className="empty-error__detail">504 · req_8f2c41d9</Code>
                                    </>
                                }
                                actions={
                                    <>
                                        <Button variant="primary" startIcon={<RotateCw size={16} />} onClick={retry}>
                                            Try again
                                        </Button>
                                        <Button
                                            startIcon={<Activity size={16} />}
                                            onClick={() =>
                                                toast.info("The activity service is slow", {
                                                    description: "We're on it. Agent runs themselves aren't affected.",
                                                })
                                            }
                                        >
                                            Check status
                                        </Button>
                                    </>
                                }
                            />
                        ) : null}

                        {load === "loading" ? (
                            <div className="empty-error__loading" role="status">
                                <Spinner size="lg" label="" />
                                <Text variant="copy">Loading agent runs…</Text>
                            </div>
                        ) : null}

                        {load === "loaded" ? (
                            <ul className="empty-error__runs" aria-label="Agent runs today">
                                {shown.map((run) => (
                                    <li key={run.task} className="empty-error__run">
                                        <span className="empty-error__agent" aria-hidden="true">
                                            <Bot size={15} />
                                        </span>
                                        <span className="empty-error__run-text">
                                            <Text variant="label" truncate>
                                                {run.task}
                                            </Text>
                                            <Text variant="caption" truncate>
                                                {run.project} · for {run.for}
                                            </Text>
                                        </span>
                                        <Text variant="caption" className="empty-error__run-time">
                                            {run.time}
                                        </Text>
                                        <Badge size="sm" variant={tone[run.status]}>
                                            {run.status}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}
