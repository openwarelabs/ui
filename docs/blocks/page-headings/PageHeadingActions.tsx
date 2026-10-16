import { useEffect, useRef, useState } from "react";

import { PageHeading01 } from "@openwarelabs/blocks";
import { Avatar, Badge, Text, copyText, toast, type BadgeVariant } from "@openwarelabs/ui";
import { Archive, Copy, Pause, Play, Receipt, RotateCcw, Rocket } from "lucide-react";

import "./PageHeadingActions.css";

type Status = "Live" | "Building" | "Paused" | "Archived";
type DeployStatus = "Live" | "Building" | "Ready" | "Failed";

const tone: Record<Status, BadgeVariant> = { Live: "success", Building: "active", Paused: "neutral", Archived: "neutral" };
const deployTone: Record<DeployStatus, BadgeVariant> = { Live: "success", Building: "active", Ready: "neutral", Failed: "danger" };

const projectId = "prj_8Kq2mXv4";

interface Deploy {
    id: number;
    commit: string;
    message: string;
    who: string;
    when: string;
    status: DeployStatus;
}

// The page goes on with the project's latest deploys; the heading's actions change them.
const history: Deploy[] = [
    { id: 3, commit: "4be71d0", message: "Fix invoice dates in the EU", who: "Ciarán Kelly", when: "26 min ago", status: "Live" },
    { id: 2, commit: "e44f1a7", message: "Retry failed card payments once", who: "Cillian Ryan", when: "5 h ago", status: "Ready" },
    { id: 1, commit: "3a9f0b6", message: "Round VAT per line, not per invoice", who: "Róisín O'Brien", when: "Yesterday", status: "Failed" },
];

export function PageHeadingActions() {
    const [status, setStatus] = useState<Status>("Live");
    const [queued, setQueued] = useState(false);
    const [deploys, setDeploys] = useState(history);
    const timers = useRef<number[]>([]);

    useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
    const later = (ms: number, run: () => void) => timers.current.push(window.setTimeout(run, ms));

    /** Puts a deploy at the top; once it's live, the one that was live steps down to ready. */
    const add = (deploy: Omit<Deploy, "id">) => {
        const id = Date.now();
        setDeploys((current) => [
            { ...deploy, id },
            ...current.map((entry) => (deploy.status === "Live" && entry.status === "Live" ? { ...entry, status: "Ready" as const } : entry)),
        ]);
        return id;
    };
    const goLive = (id: number) =>
        setDeploys((current) =>
            current.map((entry) => (entry.id === id ? { ...entry, status: "Live" } : entry.status === "Live" ? { ...entry, status: "Ready" } : entry)),
        );

    // A deploy is queued for a moment, builds for a few seconds, then goes live.
    const deploy = () => {
        setQueued(true);
        later(900, () => {
            setQueued(false);
            setStatus("Building");
            const id = add({ commit: "9f3c2a1", message: "Send receipts in the customer's language", who: "Siobhan Murphy", when: "Just now", status: "Building" });
            toast("Deploying main to production", { description: "9f3c2a1 · Send receipts in the customer's language" });
            later(3500, () => {
                setStatus("Live");
                goLive(id);
                toast.success("billing-api is live", { description: "Built in 2 min 31 s. The previous deploy stays ready for a rollback." });
            });
        });
    };

    const live = deploys.find((entry) => entry.status === "Live");
    const previous = deploys.find((entry) => entry.status === "Ready");

    const rollBack = () => {
        if (!previous) return;
        add({ commit: previous.commit, message: `Roll back to ${previous.commit}`, who: "Siobhan Murphy", when: "Just now", status: "Live" });
        toast.success(`Rolled back to ${previous.commit}`, { description: `Production runs “${previous.message}” again.` });
    };

    const archive = () => {
        const before = status;
        setStatus("Archived");
        toast("billing-api is archived", {
            description: "It stops deploying and leaves the sidebar. Its data stays.",
            action: { label: "Undo", onClick: () => setStatus(before) },
        });
    };

    const busy = queued || status === "Building";
    const paused = status === "Paused" || status === "Archived";

    return (
        <PageHeading01
            icon={<Receipt size={20} />}
            title="billing-api"
            status={{ label: status, tone: tone[status] }}
            description="Invoices, payments and the EU tax rules behind them."
            labels={{ menu: "Project actions" }}
            menu={[
                {
                    label: "Copy project ID",
                    icon: <Copy size={15} />,
                    onSelect: async () => {
                        const copied = await copyText(projectId);
                        toast(copied ? `Copied ${projectId}` : "Couldn't copy the project ID");
                    },
                },
                { label: "Roll back to the previous deploy", icon: <RotateCcw size={15} />, disabled: paused || busy || !previous, onSelect: rollBack },
                status === "Paused"
                    ? { label: "Resume deploys", icon: <Play size={15} />, onSelect: () => setStatus("Live") }
                    : { label: "Pause deploys", icon: <Pause size={15} />, disabled: status === "Archived" || busy, onSelect: () => setStatus("Paused") },
                {
                    label: "Archive project",
                    icon: <Archive size={15} />,
                    destructive: true,
                    disabled: status === "Archived",
                    onSelect: archive,
                    separatorBefore: true,
                },
            ]}
            primaryAction={{
                label: status === "Building" ? "Deploying" : "Deploy",
                icon: <Rocket size={16} />,
                loading: busy,
                disabled: paused,
                onClick: deploy,
            }}
            facts={[
                {
                    label: "Production",
                    value: (
                        <>
                            <span className="page-heading-actions__live-dot" data-state={paused ? "paused" : "live"} aria-hidden="true" />
                            <span>billing.example.com</span>
                        </>
                    ),
                },
                {
                    label: "Branch",
                    value: (
                        <Text as="span" variant="code">
                            main
                        </Text>
                    ),
                },
                { label: "Region", value: <span>Frankfurt, eu-central-1</span> },
                {
                    label: "Live deploy",
                    value: live ? (
                        <>
                            <Avatar name={live.who} size="sm" label={`By ${live.who}`} />
                            <span>
                                <Text as="span" variant="code">
                                    {live.commit}
                                </Text>{" "}
                                · {live.when}
                            </span>
                        </>
                    ) : (
                        <span>None</span>
                    ),
                },
            ]}
        >
            {/* The page goes on under the heading. */}
            <section className="page-heading-actions__recent" aria-labelledby="page-heading-actions-recent">
                <Text as="h2" variant="card-title" id="page-heading-actions-recent" className="page-heading-actions__recent-title">
                    Recent deploys
                </Text>
                <ul className="page-heading-actions__deploys">
                    {deploys.slice(0, 3).map((entry) => (
                        <li key={entry.id} className="page-heading-actions__deploy">
                            <span className="page-heading-actions__deploy-text">
                                <Text as="span" truncate>
                                    {entry.message}
                                </Text>
                                <Text variant="caption" truncate>
                                    <Text as="span" variant="code" className="page-heading-actions__commit">
                                        {entry.commit}
                                    </Text>{" "}
                                    · {entry.who} · {entry.when}
                                </Text>
                            </span>
                            <Badge size="sm" variant={deployTone[entry.status]}>
                                {entry.status}
                            </Badge>
                        </li>
                    ))}
                </ul>
            </section>
        </PageHeading01>
    );
}
