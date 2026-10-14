import { useId, useState } from "react";

import { Button, Card, Code, ConfirmDialog, cx, EmptyState, Field, Input, Select, SettingsRow, Text } from "@openwarelabs/ui";

import { ArchiveIcon, ArchiveRestoreIcon, ArrowLeftRightIcon, Trash2Icon } from "@blocks/shared/icons";
import type { Settings05Props } from "./Settings05.types";

/** A project's danger zone on a card edged in red: transfer it, archive it, or delete it after typing its name. */
export function Settings05({
    title,
    description,
    project,
    owner: initialOwner,
    currentUserName,
    admins,
    contents = [],
    defaultArchived = false,
    onTransfer,
    onArchiveChange,
    onDelete,
    onBack,
    labels = {},
    className,
    ...props
}: Settings05Props) {
    const titleId = useId();
    const [owner, setOwner] = useState(initialOwner);
    const [archived, setArchived] = useState(defaultArchived);
    const [deleted, setDeleted] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [newOwner, setNewOwner] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [typed, setTyped] = useState("");

    function toggleArchive() {
        const next = !archived;
        setArchived(next);
        // Archiving can be undone, so it happens straight away rather than asking first.
        onArchiveChange?.(next, () => setArchived(!next));
    }

    const deleteTitle = labels.deleteTitle ?? "Delete project";

    return (
        <section className={cx("ow-settings05", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-settings05__inner">
                <div className="ow-settings05__header">
                    <Text variant="dialog-title" as="h2" id={titleId}>
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-settings05__text">
                            {description}
                        </Text>
                    ) : null}
                </div>

                {deleted ? (
                    <Card className="ow-settings05__gone">
                        <EmptyState
                            icon={<Trash2Icon size={20} />}
                            title={labels.deletedTitle?.(project) ?? `${project} was deleted`}
                            description={labels.deletedDescription ?? "Its data and settings are gone."}
                            actions={
                                <Button
                                    onClick={() => {
                                        if (onBack) {
                                            onBack();
                                            return;
                                        }
                                        setDeleted(false);
                                        setArchived(false);
                                    }}
                                >
                                    {labels.back ?? "Back to projects"}
                                </Button>
                            }
                        />
                    </Card>
                ) : (
                    <Card padding="none" className="ow-settings05__card">
                        <SettingsRow
                            label={labels.transferTitle ?? "Transfer ownership"}
                            description={
                                owner === currentUserName
                                    ? (labels.transferYou ?? "You own it now. Hand it to another admin and stay on as a member.")
                                    : (labels.transferOther?.(owner) ?? `${owner} owns it now. They can hand it back at any time.`)
                            }
                        >
                            <Button
                                size="sm"
                                startIcon={<ArrowLeftRightIcon size={16} />}
                                onClick={() => {
                                    setNewOwner("");
                                    setTransferring(true);
                                }}
                            >
                                {labels.transfer ?? "Transfer"}
                            </Button>
                        </SettingsRow>
                        <SettingsRow
                            label={archived ? (labels.restoreTitle ?? "Restore project") : (labels.archiveTitle ?? "Archive project")}
                            description={
                                archived
                                    ? (labels.archivedDescription ?? "It's archived: it's paused and hidden from the sidebar.")
                                    : (labels.archiveDescription ?? "Pauses the project and hides it from the sidebar. You can restore it at any time.")
                            }
                        >
                            <Button size="sm" startIcon={archived ? <ArchiveRestoreIcon size={16} /> : <ArchiveIcon size={16} />} onClick={toggleArchive}>
                                {archived ? (labels.restore ?? "Restore") : (labels.archive ?? "Archive")}
                            </Button>
                        </SettingsRow>
                        <SettingsRow
                            label={deleteTitle}
                            description={labels.deleteDescription ?? "Deletes it for good, with everything in it. This can't be undone."}
                        >
                            <Button
                                size="sm"
                                variant="danger"
                                startIcon={<Trash2Icon size={16} />}
                                onClick={() => {
                                    setTyped("");
                                    setDeleting(true);
                                }}
                            >
                                {deleteTitle}
                            </Button>
                        </SettingsRow>
                    </Card>
                )}
            </div>

            <ConfirmDialog
                open={transferring}
                onClose={() => setTransferring(false)}
                title={labels.transferConfirmTitle?.(project) ?? `Transfer ${project}?`}
                description={labels.transferConfirmDescription ?? "The new owner can rename, transfer or delete it. You'll stay on as a member."}
                confirmLabel={labels.transferConfirm ?? "Transfer ownership"}
                confirmDisabled={!newOwner}
                onConfirm={async () => {
                    await onTransfer?.(newOwner);
                    setOwner(newOwner);
                }}
            >
                <Field label={labels.newOwner ?? "New owner"}>
                    <Select value={newOwner} onChange={setNewOwner} options={admins} placeholder={labels.newOwnerPlaceholder ?? "Choose an admin"} />
                </Field>
            </ConfirmDialog>

            <ConfirmDialog
                open={deleting}
                onClose={() => setDeleting(false)}
                destructive
                title={labels.deleteConfirmTitle?.(project) ?? `Delete ${project}?`}
                description={labels.deleteConfirmDescription ?? "This deletes the project for everyone. Along with it go:"}
                confirmLabel={labels.deleteConfirm ?? "Delete project"}
                confirmDisabled={typed.trim() !== project}
                onConfirm={async () => {
                    await onDelete?.();
                    setDeleted(true);
                }}
            >
                {contents.length ? (
                    <ul className="ow-settings05__contents">
                        {contents.map((item, index) => (
                            <Text as="li" tone="soft" key={index}>
                                <Text as="strong" variant="label" tone="default" className="ow-settings05__count">
                                    {item.count}
                                </Text>{" "}
                                {item.what}
                            </Text>
                        ))}
                    </ul>
                ) : null}
                <Field
                    label={
                        labels.typeToConfirm ? (
                            labels.typeToConfirm(<Code>{project}</Code>)
                        ) : (
                            <>
                                Type <Code>{project}</Code> to confirm
                            </>
                        )
                    }
                >
                    <Input
                        value={typed}
                        onChange={(event) => setTyped(event.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        className="ow-settings05__confirm"
                    />
                </Field>
            </ConfirmDialog>
        </section>
    );
}
