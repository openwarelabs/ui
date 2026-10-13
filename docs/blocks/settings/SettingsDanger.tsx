import { useId, useState } from "react";

import { Button, Card, Code, ConfirmDialog, EmptyState, Field, Input, Select, SettingsRow, Text, toast } from "@openwarelabs/ui";
import { Archive, ArchiveRestore, ArrowLeftRight, Trash2 } from "lucide-react";

import "./SettingsDanger.css";

const project = "billing-api";

// What goes with the project, said in the confirmation so nobody is surprised.
const contents = [
    { count: "214", what: "deploys, with their logs and preview URLs" },
    { count: "38", what: "agent runs, with their transcripts" },
    { count: "6", what: "environment variables, including 2 secrets" },
    { count: "11", what: "open reviews" },
];

const admins = [
    { value: "Tomás Reyes", label: "Tomás Reyes", description: "Admin · tomas@example.com" },
    { value: "Clara Novak", label: "Clara Novak", description: "Admin · clara@example.com" },
    { value: "Jonas Berg", label: "Jonas Berg", description: "Admin · jonas@example.com" },
];

export function SettingsDanger() {
    const titleId = useId();
    const [owner, setOwner] = useState("Maya Chen");
    const [archived, setArchived] = useState(false);
    const [deleted, setDeleted] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [newOwner, setNewOwner] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [typed, setTyped] = useState("");

    function toggleArchive() {
        const next = !archived;
        setArchived(next);
        // Archiving can be undone, so it happens straight away with Undo in the toast, rather than asking first.
        toast(next ? `${project} archived` : `${project} restored`, {
            description: next ? "Deploys and agent runs are paused." : "Deploys and agent runs pick up where they left off.",
            action: { label: "Undo", onClick: () => setArchived(!next) },
        });
    }

    return (
        <section className="settings-danger" aria-labelledby={titleId}>
            <div className="settings-danger__inner">
                <div className="settings-danger__header">
                    <Text variant="dialog-title" as="h2" id={titleId}>
                        Danger zone
                    </Text>
                    <Text variant="copy" className="settings-danger__text">
                        These change <Code>{project}</Code> for everyone in Acme. Only its owner can use them.
                    </Text>
                </div>

                {deleted ? (
                    <Card className="settings-danger__gone">
                        <EmptyState
                            icon={<Trash2 size={20} />}
                            title={`${project} was deleted`}
                            description="Its deploys, agent runs and settings are gone. The repository on GitHub wasn't touched."
                            actions={
                                // In an app this goes to the project list; here it brings the demo back.
                                <Button
                                    onClick={() => {
                                        setDeleted(false);
                                        setArchived(false);
                                    }}
                                >
                                    Back to projects
                                </Button>
                            }
                        />
                    </Card>
                ) : (
                    <Card padding="none" className="settings-danger__card">
                        <SettingsRow
                            label="Transfer ownership"
                            description={
                                owner === "Maya Chen"
                                    ? "You own it now. Hand it to another admin and stay on as a member."
                                    : `${owner} owns it now. They can hand it back at any time.`
                            }
                        >
                            <Button
                                size="sm"
                                startIcon={<ArrowLeftRight size={16} />}
                                onClick={() => {
                                    setNewOwner("");
                                    setTransferring(true);
                                }}
                            >
                                Transfer
                            </Button>
                        </SettingsRow>
                        <SettingsRow
                            label={archived ? "Restore project" : "Archive project"}
                            description={
                                archived
                                    ? "It's archived: deploys and agent runs are paused, and it's hidden from the sidebar."
                                    : "Pauses deploys and agent runs and hides it from the sidebar. You can restore it at any time."
                            }
                        >
                            <Button size="sm" startIcon={archived ? <ArchiveRestore size={16} /> : <Archive size={16} />} onClick={toggleArchive}>
                                {archived ? "Restore" : "Archive"}
                            </Button>
                        </SettingsRow>
                        <SettingsRow label="Delete project" description="Deletes it for good, with its deploys, agent runs and settings. This can't be undone.">
                            <Button
                                size="sm"
                                variant="danger"
                                startIcon={<Trash2 size={16} />}
                                onClick={() => {
                                    setTyped("");
                                    setDeleting(true);
                                }}
                            >
                                Delete project
                            </Button>
                        </SettingsRow>
                    </Card>
                )}
            </div>

            <ConfirmDialog
                open={transferring}
                onClose={() => setTransferring(false)}
                title={`Transfer ${project}?`}
                description="The new owner can rename, transfer or delete it. You'll stay on as a member."
                confirmLabel="Transfer ownership"
                confirmDisabled={!newOwner}
                onConfirm={async () => {
                    await new Promise((resolve) => window.setTimeout(resolve, 700));
                    setOwner(newOwner);
                    toast.success(`${newOwner} owns ${project} now`, { description: "We've emailed them to say so." });
                }}
            >
                <Field label="New owner">
                    <Select value={newOwner} onChange={setNewOwner} options={admins} placeholder="Choose an admin" />
                </Field>
            </ConfirmDialog>

            <ConfirmDialog
                open={deleting}
                onClose={() => setDeleting(false)}
                destructive
                title={`Delete ${project}?`}
                description="This deletes the project for everyone in Acme. Along with it go:"
                confirmLabel="Delete project"
                confirmDisabled={typed.trim() !== project}
                onConfirm={async () => {
                    await new Promise((resolve) => window.setTimeout(resolve, 900));
                    setDeleted(true);
                    toast(`${project} deleted`);
                }}
            >
                <ul className="settings-danger__contents">
                    {contents.map((item) => (
                        <Text as="li" tone="soft" key={item.what}>
                            <Text as="strong" variant="label" tone="default" className="settings-danger__count">
                                {item.count}
                            </Text>{" "}
                            {item.what}
                        </Text>
                    ))}
                </ul>
                <Field
                    label={
                        <>
                            Type <Code>{project}</Code> to confirm
                        </>
                    }
                >
                    <Input
                        value={typed}
                        onChange={(event) => setTyped(event.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        className="settings-danger__confirm"
                    />
                </Field>
            </ConfirmDialog>
        </section>
    );
}
