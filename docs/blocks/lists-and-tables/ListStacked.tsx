import { useState } from "react";

import { List03 } from "@openwarelabs/blocks";
import { copyText, toast, type BadgeVariant } from "@openwarelabs/ui";
import { Copy, KeyRound, Plus, RefreshCw, Trash2 } from "lucide-react";

type Status = "Active" | "Expires soon" | "Expired" | "Revoked";

interface ApiKey {
    id: string;
    name: string;
    key: string;
    detail: string;
    status: Status;
}

const tone: Record<Status, BadgeVariant> = { Active: "success", "Expires soon": "warning", Expired: "neutral", Revoked: "danger" };

const keys: ApiKey[] = [
    { id: "k1", name: "Production deploys", key: "acme_live_…3f9a", detail: "Made by Siobhan Murphy on 2 September · Last used 4 min ago", status: "Active" },
    { id: "k2", name: "GitHub Actions", key: "acme_live_…a81c", detail: "Made by Ciarán Kelly on 14 August · Last used 26 min ago", status: "Active" },
    { id: "k3", name: "Staging webhooks", key: "acme_test_…77d0", detail: "Made by Aoife O'Sullivan on 20 April · Expires in 6 days", status: "Expires soon" },
    { id: "k4", name: "Status page", key: "acme_live_…e204", detail: "Made by Declan Walsh on 3 January · Last used 3 weeks ago", status: "Active" },
    { id: "k5", name: "Old CI runner", key: "acme_live_…19b6", detail: "Made by Cillian Ryan on 11 November 2025 · Expired on 9 February", status: "Expired" },
    { id: "k6", name: "Agent sandbox", key: "acme_test_…c5e8", detail: "Made by Niamh Byrne on 1 October · Revoked by Siobhan Murphy yesterday", status: "Revoked" },
];

const ending = () => Math.random().toString(16).slice(2, 6);

export function ListStacked() {
    const [list, setList] = useState(keys);

    const update = (id: string, change: Partial<ApiKey>) => setList((current) => current.map((entry) => (entry.id === id ? { ...entry, ...change } : entry)));

    const create = () => {
        const id = `k${Date.now()}`;
        setList((current) => [
            { id, name: "New key", key: `acme_live_…${ending()}`, detail: "Made by you just now · Not used yet", status: "Active" },
            ...current,
        ]);
        toast.success("Key created", { description: "Copy it now and keep it in your CI's secrets. It won't be shown again." });
    };

    const revoke = (entry: ApiKey) => {
        update(entry.id, { status: "Revoked", detail: `${entry.detail.split(" · ")[0]} · Revoked by you just now` });
        toast(`${entry.name} is revoked`, {
            description: "Anything using it gets a 401 from now on.",
            action: { label: "Undo", onClick: () => update(entry.id, { status: entry.status, detail: entry.detail }) },
        });
    };

    const roll = (entry: ApiKey) => {
        update(entry.id, { key: `${entry.key.split("…")[0]}…${ending()}`, status: "Active", detail: `${entry.detail.split(" · ")[0]} · Rolled just now` });
        toast.success(`${entry.name} has a new secret`, { description: "The old one keeps working for 24 hours, so you can swap it in." });
    };

    const live = list.filter((entry) => entry.status === "Active" || entry.status === "Expires soon").length;

    return (
        <List03
            title="API keys"
            description={
                <>{live === 1 ? "One key" : `${live} keys`} can reach the Acme API. Each one acts for the whole workspace, so keep them out of your code.</>
            }
            primaryAction={{ label: "Create key", icon: <Plus size={16} />, onClick: create }}
            items={list.map((entry) => {
                const inactive = entry.status === "Expired" || entry.status === "Revoked";
                return {
                    id: entry.id,
                    title: entry.name,
                    code: entry.key,
                    detail: entry.detail,
                    status: { label: entry.status, tone: tone[entry.status] },
                    inactive,
                    icon: <KeyRound size={16} />,
                    menu: [
                        {
                            label: "Copy key ID",
                            icon: <Copy size={15} />,
                            onSelect: async () => {
                                const copied = await copyText(entry.id);
                                toast(copied ? `Copied the ID of ${entry.name}` : "Couldn't copy the key ID");
                            },
                        },
                        { label: "Roll the secret", icon: <RefreshCw size={15} />, disabled: entry.status === "Revoked", onSelect: () => roll(entry) },
                        {
                            label: "Revoke key",
                            icon: <Trash2 size={15} />,
                            destructive: true,
                            disabled: inactive,
                            onSelect: () => revoke(entry),
                            separatorBefore: true,
                        },
                    ],
                };
            })}
            footnote="A key's secret is shown once, when it's made. Keys nobody uses for 90 days expire on their own."
        />
    );
}
