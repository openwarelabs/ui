import { Settings05 } from "@openwarelabs/blocks";
import { Code, toast } from "@openwarelabs/ui";

const project = "billing-api";

// What goes with the project, said in the confirmation so nobody is surprised.
const contents = [
    { count: "214", what: "deploys, with their logs and preview URLs" },
    { count: "38", what: "agent runs, with their transcripts" },
    { count: "6", what: "environment variables, including 2 secrets" },
    { count: "11", what: "open reviews" },
];

const admins = [
    { value: "Ciarán Kelly", label: "Ciarán Kelly", description: "Admin · ciaran@example.com" },
    { value: "Aoife O'Sullivan", label: "Aoife O'Sullivan", description: "Admin · aoife@example.com" },
    { value: "Declan Walsh", label: "Declan Walsh", description: "Admin · declan@example.com" },
];

// Stands in for the requests to your server.
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function SettingsDanger() {
    return (
        <Settings05
            title="Danger zone"
            description={
                <>
                    These change <Code>{project}</Code> for everyone in Acme. Only its owner can use them.
                </>
            }
            project={project}
            owner="Siobhan Murphy"
            currentUserName="Siobhan Murphy"
            admins={admins}
            contents={contents}
            onTransfer={async (owner) => {
                await wait(700);
                toast.success(`${owner} owns ${project} now`, { description: "We've emailed them to say so." });
            }}
            // Archiving can be undone, so it happens straight away with Undo in the toast, rather than asking first.
            onArchiveChange={(archived, undo) =>
                toast(archived ? `${project} archived` : `${project} restored`, {
                    description: archived ? "Deploys and agent runs are paused." : "Deploys and agent runs pick up where they left off.",
                    action: { label: "Undo", onClick: undo },
                })
            }
            onDelete={async () => {
                await wait(900);
                toast(`${project} deleted`);
            }}
            // In an app "Back to projects" goes to the project list; without onBack it brings the sample back.
            labels={{
                archiveDescription: "Pauses deploys and agent runs and hides it from the sidebar. You can restore it at any time.",
                archivedDescription: "It's archived: deploys and agent runs are paused, and it's hidden from the sidebar.",
                deleteDescription: "Deletes it for good, with its deploys, agent runs and settings. This can't be undone.",
                deleteConfirmDescription: "This deletes the project for everyone in Acme. Along with it go:",
                deletedDescription: "Its deploys, agent runs and settings are gone. The repository on GitHub wasn't touched.",
            }}
        />
    );
}
