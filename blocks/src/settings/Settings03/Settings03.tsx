import { useId, useState } from "react";

import {
    Button,
    Code,
    ConfirmDialog,
    CopyButton,
    cx,
    Dialog,
    EmptyState,
    Field,
    Input,
    Select,
    Snippet,
    Table,
    Text,
    VisuallyHidden,
    type TableColumn,
} from "@openwarelabs/ui";

import { KeyRoundIcon, PlusIcon } from "@blocks/shared/icons";
import type { Settings03CreatedKey, Settings03Key, Settings03NewKey, Settings03Props } from "./Settings03.types";

/** Random letters and digits, for a sample key when there's no server to make one. */
function randomText(length: number, alphabet: string) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

/** API keys in a table, each with its public part to copy, when it was last used and a way to revoke it; and a dialog that makes one and shows it once. */
export function Settings03({
    title,
    description,
    keys: initialKeys,
    accessOptions,
    defaultAccess,
    expiryOptions,
    defaultExpiry,
    onCreateKey,
    onRevokeKey,
    note,
    labels = {},
    className,
    ...props
}: Settings03Props) {
    const titleId = useId();
    const nameId = useId();
    const firstAccess = defaultAccess ?? accessOptions?.[0]?.value ?? "";
    const firstExpiry = defaultExpiry ?? expiryOptions?.[0]?.value ?? "";
    const [keys, setKeys] = useState(initialKeys);
    const [creating, setCreating] = useState(false);
    const [name, setName] = useState("");
    const [access, setAccess] = useState(firstAccess);
    const [expiry, setExpiry] = useState(firstExpiry);
    const [nameError, setNameError] = useState("");
    const [working, setWorking] = useState(false);
    const [created, setCreated] = useState<{ name: string; full: string } | null>(null);
    const [revoking, setRevoking] = useState<Settings03Key | null>(null);

    const columnLabels = labels.columns ?? {};
    const never = labels.never ?? "Never";

    function openCreate() {
        setName("");
        setAccess(firstAccess);
        setExpiry(firstExpiry);
        setNameError("");
        setCreated(null);
        setCreating(true);
    }

    /** A key made here, when there's no server to make one. */
    function sampleKey(values: Settings03NewKey): Settings03CreatedKey {
        const prefix = `key_${randomText(8, "0123456789abcdef")}`;
        const secret = randomText(32, "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789");
        const option = accessOptions?.find((entry) => entry.value === values.access);
        return {
            key: { id: prefix, name: values.name, prefix, access: option?.label, createdBy: labels.you ?? "You", created: labels.today ?? "Today" },
            secret: `${prefix}_${secret}`,
        };
    }

    async function create() {
        // The same form shows the new key afterwards; there, Enter just closes it.
        if (created) {
            setCreating(false);
            return;
        }
        if (working) return;
        const trimmed = name.trim();
        const error = !trimmed
            ? (labels.nameEmpty ?? "Name the key after where it's used, like the service or script.")
            : keys.some((key) => key.name.toLowerCase() === trimmed.toLowerCase())
              ? (labels.nameTaken?.(trimmed) ?? `There's already a key called ${trimmed}.`)
              : "";
        setNameError(error);
        if (error) {
            document.getElementById(nameId)?.focus();
            return;
        }
        const values: Settings03NewKey = { name: trimmed, access: accessOptions ? access : undefined, expiry: expiryOptions ? expiry : undefined };
        setWorking(true);
        try {
            const made = onCreateKey ? await onCreateKey(values) : sampleKey(values);
            setKeys((current) => [made.key, ...current]);
            setCreated({ name: made.key.name, full: made.secret });
        } catch (failure) {
            setNameError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
            document.getElementById(nameId)?.focus();
        } finally {
            setWorking(false);
        }
    }

    const usedText = (lastUsed: string | undefined) =>
        labels.used ? labels.used(lastUsed) : lastUsed === undefined ? "never used" : `used ${lastUsed.toLowerCase()}`;

    /** The key's public part, its secret masked, and a button that copies the public part. */
    const keyValue = (key: Settings03Key) => (
        <span className="ow-settings03__key">
            <Code className="ow-settings03__secret">
                {key.prefix}
                <span aria-hidden="true">_••••••••</span>
                <VisuallyHidden>{labels.secretHidden ?? ", then the secret, hidden"}</VisuallyHidden>
            </Code>
            <CopyButton iconOnly value={key.prefix} label={labels.copy?.(key.name) ?? `Copy the ID of ${key.name}`} />
        </span>
    );

    const columns: Array<TableColumn<Settings03Key>> = [
        {
            key: "name",
            header: columnLabels.name ?? "Name",
            render: (key) => (
                <span className="ow-settings03__name">
                    <Text variant="label">{key.name}</Text>
                    <Text variant="caption">
                        {key.access ? <>{key.access} · </> : null}
                        <span className="ow-settings03__meta-wide">{key.createdBy}</span>
                        <span className="ow-settings03__meta-phone">{usedText(key.lastUsed)}</span>
                    </Text>
                    {/* On phones the key column folds in here. */}
                    <span className="ow-settings03__key-phone">{keyValue(key)}</span>
                </span>
            ),
        },
        {
            key: "prefix",
            header: columnLabels.key ?? "Key",
            render: (key) => keyValue(key),
        },
        { key: "created", header: columnLabels.created ?? "Created", width: 130 },
        {
            key: "lastUsed",
            header: columnLabels.lastUsed ?? "Last used",
            width: 130,
            render: (key) => (
                <Text as="span" tone={key.lastUsed === undefined ? "muted" : undefined}>
                    {key.lastUsed ?? never}
                </Text>
            ),
        },
        {
            key: "actions",
            header: <VisuallyHidden>{columnLabels.actions ?? "Actions"}</VisuallyHidden>,
            align: "end",
            width: 96,
            render: (key) => (
                <Button size="sm" variant="ghost" onClick={() => setRevoking(key)} aria-label={labels.revokeKey?.(key.name) ?? `Revoke ${key.name}`}>
                    {labels.revoke ?? "Revoke"}
                </Button>
            ),
        },
    ];

    const accessHint = accessOptions?.find((option) => option.value === access)?.description;
    const expiryHint = expiryOptions?.find((option) => option.value === expiry)?.description;

    return (
        <section className={cx("ow-settings03", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-settings03__inner">
                <div className="ow-settings03__header">
                    <div>
                        <Text variant="dialog-title" as="h2" id={titleId}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-settings03__text">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    <Button variant="primary" startIcon={<PlusIcon size={16} />} onClick={openCreate}>
                        {labels.create ?? "Create key"}
                    </Button>
                </div>

                <Table
                    className="ow-settings03__table"
                    caption={labels.table ?? "API keys"}
                    hideCaption
                    columns={columns}
                    rows={keys}
                    emptyContent={
                        <EmptyState
                            icon={<KeyRoundIcon size={20} />}
                            title={labels.emptyTitle ?? "No API keys"}
                            description={labels.emptyDescription ?? "Create one to use the API from a script or your CI."}
                        />
                    }
                />

                {note ? (
                    <Text variant="caption" as="p" className="ow-settings03__note">
                        {note}
                    </Text>
                ) : null}
            </div>

            <Dialog
                open={creating}
                onClose={() => setCreating(false)}
                width={460}
                dismissible={!working}
                title={created ? (labels.createdTitle ?? "Copy your new key") : (labels.createTitle ?? "Create an API key")}
                description={
                    created
                        ? (labels.createdDescription ??
                          "This is the only time you'll see it. Put it somewhere safe, like your CI's secrets, before you close this.")
                        : (labels.createDescription ?? "You'll see the key once, straight after you create it.")
                }
                onSubmit={() => void create()}
                actions={
                    created ? (
                        <Button type="submit" variant="primary">
                            {labels.done ?? "Done"}
                        </Button>
                    ) : (
                        <>
                            <Button type="button" disabled={working} onClick={() => setCreating(false)}>
                                {labels.cancel ?? "Cancel"}
                            </Button>
                            <Button type="submit" variant="primary" loading={working}>
                                {labels.create ?? "Create key"}
                            </Button>
                        </>
                    )
                }
            >
                {created ? (
                    <div className="ow-settings03__created">
                        <Text variant="label">{created.name}</Text>
                        <Snippet value={created.full} prompt={null} />
                    </div>
                ) : (
                    <div className="ow-settings03__form">
                        <Field label={labels.name ?? "Name"} hint={labels.nameHint ?? "Where it's used, so you know which one to revoke."} error={nameError}>
                            <Input
                                id={nameId}
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameError("");
                                }}
                                placeholder={labels.namePlaceholder ?? "Nightly backups"}
                                autoComplete="off"
                                autoFocus
                            />
                        </Field>
                        {accessOptions ? (
                            <Field label={labels.access ?? "Access"} hint={accessHint}>
                                <Select value={access} onChange={setAccess} options={accessOptions.map(({ value, label }) => ({ value, label }))} />
                            </Field>
                        ) : null}
                        {expiryOptions ? (
                            <Field label={labels.expiry ?? "Expires"} hint={expiryHint}>
                                <Select value={expiry} onChange={setExpiry} options={expiryOptions.map(({ value, label }) => ({ value, label }))} />
                            </Field>
                        ) : null}
                    </div>
                )}
            </Dialog>

            <ConfirmDialog
                open={revoking !== null}
                onClose={() => setRevoking(null)}
                destructive
                title={labels.revokeTitle?.(revoking?.name ?? "") ?? `Revoke ${revoking?.name ?? "this key"}?`}
                description={
                    labels.revokeDescription ? (
                        labels.revokeDescription(<Code>{revoking?.prefix}</Code>)
                    ) : (
                        <>
                            Anything still using <Code>{revoking?.prefix}</Code> stops working straight away. You can't undo this.
                        </>
                    )
                }
                confirmLabel={labels.revokeConfirm ?? "Revoke key"}
                onConfirm={async () => {
                    const key = revoking;
                    if (!key) return;
                    await onRevokeKey?.(key);
                    setKeys((current) => current.filter((entry) => entry.id !== key.id));
                }}
            />
        </section>
    );
}
