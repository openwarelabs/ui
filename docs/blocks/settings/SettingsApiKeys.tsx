import { useId, useState } from "react";

import {
    Button,
    ConfirmDialog,
    CopyButton,
    Dialog,
    EmptyState,
    Field,
    Input,
    Link,
    Select,
    Snippet,
    Table,
    toast,
    VisuallyHidden,
    type TableColumn,
} from "@openwarelabs/ui";
import { KeyRound, Plus } from "lucide-react";

import "./SettingsApiKeys.css";

interface ApiKey {
    id: string;
    name: string;
    /** The public part of the key, which identifies it. The secret after it is only ever shown once. */
    prefix: string;
    access: string;
    by: string;
    created: string;
    lastUsed: string;
}

const initialKeys: ApiKey[] = [
    { id: "k1", name: "CI deploys", prefix: "acme_3f9a2c7d", access: "Read and write", by: "Maya Chen", created: "12 Mar 2026", lastUsed: "2 hours ago" },
    { id: "k2", name: "Status page", prefix: "acme_81be04c2", access: "Read only", by: "Jonas Berg", created: "3 Jun 2026", lastUsed: "Yesterday" },
    { id: "k3", name: "Release bot", prefix: "acme_c47d19ea", access: "Read and write", by: "Priya Nair", created: "28 Aug 2026", lastUsed: "Never" },
    { id: "k4", name: "Quarterly export", prefix: "acme_0b6e55f1", access: "Read only", by: "Lena Fischer", created: "2 Jan 2026", lastUsed: "3 months ago" },
];

const accessOptions = [
    { value: "Read only", label: "Read only", description: "See projects, deploys and runs." },
    { value: "Read and write", label: "Read and write", description: "Also start deploys and agent runs." },
];

const expiryOptions = [
    { value: "30", label: "In 30 days" },
    { value: "90", label: "In 90 days" },
    { value: "365", label: "In a year" },
    { value: "never", label: "Never" },
];

/** Random letters and digits, for the sample key. A real key comes from your server. */
function randomText(length: number, alphabet: string) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function newKey() {
    const prefix = `acme_${randomText(8, "0123456789abcdef")}`;
    const secret = randomText(32, "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789");
    return { prefix, full: `${prefix}_${secret}` };
}

/** The key's public part, its secret masked, and a button that copies the public part. */
function KeyValue({ apiKey }: { apiKey: ApiKey }) {
    return (
        <span className="settings-api-keys__key">
            <code className="settings-api-keys__secret">
                {apiKey.prefix}
                <span aria-hidden="true">_••••••••</span>
                <VisuallyHidden>, then the secret, hidden</VisuallyHidden>
            </code>
            <CopyButton iconOnly value={apiKey.prefix} label={`Copy the ID of ${apiKey.name}`} />
        </span>
    );
}

function usedText(lastUsed: string) {
    return lastUsed === "Never" ? "never used" : `used ${lastUsed.toLowerCase()}`;
}

export function SettingsApiKeys() {
    const titleId = useId();
    const nameId = useId();
    const [keys, setKeys] = useState(initialKeys);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [access, setAccess] = useState("Read only");
    const [expiry, setExpiry] = useState("90");
    const [nameError, setNameError] = useState("");
    const [created, setCreated] = useState<{ name: string; full: string } | null>(null);
    const [revoking, setRevoking] = useState<ApiKey | null>(null);

    function openCreate() {
        setName("");
        setAccess("Read only");
        setExpiry("90");
        setNameError("");
        setCreated(null);
        setCreating(true);
    }

    function create() {
        // The same form shows the new key afterwards; there, Enter just closes it.
        if (created) {
            setCreating(false);
            return;
        }
        const trimmed = name.trim();
        const error = !trimmed
            ? "Name the key after where it's used, like the service or script."
            : keys.some((key) => key.name.toLowerCase() === trimmed.toLowerCase())
              ? `There's already a key called ${trimmed}.`
              : "";
        setNameError(error);
        if (error) {
            document.getElementById(nameId)?.focus();
            return;
        }
        const key = newKey();
        setKeys((current) => [{ id: key.prefix, name: trimmed, prefix: key.prefix, access, by: "Maya Chen", created: "Today", lastUsed: "Never" }, ...current]);
        setCreated({ name: trimmed, full: key.full });
    }

    const columns: Array<TableColumn<ApiKey>> = [
        {
            key: "name",
            header: "Name",
            render: (key) => (
                <span className="settings-api-keys__name">
                    <span className="settings-api-keys__name-text">{key.name}</span>
                    <span className="settings-api-keys__meta">
                        {key.access} · <span className="settings-api-keys__meta-wide">{key.by}</span>
                        <span className="settings-api-keys__meta-phone">{usedText(key.lastUsed)}</span>
                    </span>
                    {/* On phones the key column folds in here. */}
                    <span className="settings-api-keys__key-phone">
                        <KeyValue apiKey={key} />
                    </span>
                </span>
            ),
        },
        {
            key: "prefix",
            header: "Key",
            render: (key) => <KeyValue apiKey={key} />,
        },
        { key: "created", header: "Created", width: 130 },
        {
            key: "lastUsed",
            header: "Last used",
            width: 130,
            render: (key) => <span className={key.lastUsed === "Never" ? "settings-api-keys__never" : undefined}>{key.lastUsed}</span>,
        },
        {
            key: "actions",
            header: <VisuallyHidden>Actions</VisuallyHidden>,
            align: "end",
            width: 96,
            render: (key) => (
                <Button size="sm" variant="ghost" onClick={() => setRevoking(key)} aria-label={`Revoke ${key.name}`}>
                    Revoke
                </Button>
            ),
        },
    ];

    return (
        <section className="settings-api-keys" aria-labelledby={titleId}>
            <div className="settings-api-keys__inner">
                <div className="settings-api-keys__header">
                    <div>
                        <h2 id={titleId} className="settings-api-keys__title">
                            API keys
                        </h2>
                        <p className="settings-api-keys__text">
                            Keys let scripts and CI use the Acme API on behalf of this workspace. Treat them like passwords.
                        </p>
                    </div>
                    <Button variant="primary" startIcon={<Plus size={16} />} onClick={openCreate}>
                        Create key
                    </Button>
                </div>

                <Table
                    className="settings-api-keys__table"
                    caption="API keys"
                    hideCaption
                    columns={columns}
                    rows={keys}
                    emptyContent={
                        <EmptyState icon={<KeyRound size={20} />} title="No API keys" description="Create one to use the Acme API from a script or your CI." />
                    }
                />

                <p className="settings-api-keys__note">
                    Use a separate key for each place you use one, so you can revoke it without breaking the rest. <Link href="#">Read the API guide</Link>
                </p>
            </div>

            <Dialog
                open={creating}
                onClose={() => setCreating(false)}
                width={460}
                title={created ? "Copy your new key" : "Create an API key"}
                description={
                    created
                        ? "This is the only time you'll see it. Put it somewhere safe, like your CI's secrets, before you close this."
                        : "The key works for every project in Acme. You'll see it once, straight after you create it."
                }
                onSubmit={create}
                actions={
                    created ? (
                        <Button type="submit" variant="primary">
                            Done
                        </Button>
                    ) : (
                        <>
                            <Button type="button" onClick={() => setCreating(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Create key
                            </Button>
                        </>
                    )
                }
            >
                {created ? (
                    <div className="settings-api-keys__created">
                        <span className="settings-api-keys__created-label">{created.name}</span>
                        <Snippet value={created.full} prompt={null} />
                    </div>
                ) : (
                    <div className="settings-api-keys__form">
                        <Field label="Name" hint="Where it's used, so you know which one to revoke." error={nameError}>
                            <Input
                                id={nameId}
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameError("");
                                }}
                                placeholder="Nightly backups"
                                autoComplete="off"
                                autoFocus
                            />
                        </Field>
                        <Field label="Access" hint={accessOptions.find((option) => option.value === access)?.description}>
                            <Select value={access} onChange={setAccess} options={accessOptions.map(({ value, label }) => ({ value, label }))} />
                        </Field>
                        <Field label="Expires">
                            <Select value={expiry} onChange={setExpiry} options={expiryOptions} />
                        </Field>
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                open={revoking !== null}
                onClose={() => setRevoking(null)}
                destructive
                title={`Revoke ${revoking?.name ?? "this key"}?`}
                description={
                    <>
                        Anything still using <code className="settings-api-keys__inline-code">{revoking?.prefix}</code> stops working straight away. You can't
                        undo this.
                    </>
                }
                confirmLabel="Revoke key"
                onConfirm={async () => {
                    const key = revoking;
                    await new Promise((resolve) => window.setTimeout(resolve, 700));
                    if (!key) return;
                    setKeys((current) => current.filter((entry) => entry.id !== key.id));
                    toast(`Revoked ${key.name}`, { description: "Requests with it now get a 401." });
                }}
            />
        </section>
    );
}
