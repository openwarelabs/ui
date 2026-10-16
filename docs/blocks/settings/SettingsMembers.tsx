import { Settings04, type Settings04Invite, type Settings04Member } from "@openwarelabs/blocks";
import { toast } from "@openwarelabs/ui";

const roles = [
    { value: "admin", label: "Admin", description: "Billing, members and every project." },
    { value: "member", label: "Member", description: "Every project, but not billing or members." },
    { value: "guest", label: "Guest", description: "Only the projects they're added to." },
];

/** "admin" → "an admin", "guest" → "a guest" */
const asRole = (role: string) => (role === "admin" ? "an admin" : `a ${role}`);

const members: Settings04Member[] = [
    { name: "Siobhan Murphy", email: "siobhan@example.com", role: "owner", owner: true },
    { name: "Ciarán Kelly", email: "ciaran@example.com", role: "admin" },
    { name: "Aoife O'Sullivan", email: "aoife@example.com", role: "member" },
    { name: "Declan Walsh", email: "declan@example.com", role: "member" },
    { name: "Niamh Byrne", email: "niamh@example.com", role: "member" },
    { name: "Seán McCarthy", email: "sean@example.com", role: "guest" },
];

const invites: Settings04Invite[] = [
    { email: "roisin@example.com", role: "member", sent: "2 days ago", invitedBy: "Siobhan Murphy" },
    { email: "cillian@example.com", role: "guest", sent: "5 days ago", invitedBy: "Siobhan Murphy" },
];

// Stands in for the requests to your server.
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function SettingsMembers() {
    return (
        <Settings04
            title="Members"
            description={({ members, invites }) => (
                <>
                    {members} people in Acme{invites ? `, and ${invites} invited` : ""}. Admins can invite people, change roles and remove them.
                </>
            )}
            members={members}
            invites={invites}
            roles={roles}
            defaultInviteRole="member"
            currentUserEmail="siobhan@example.com"
            onInvite={async ({ email, role }) => {
                await wait(700);
                toast.success(`Invite sent to ${email}`, { description: `They'll join as ${asRole(role)}.` });
            }}
            onRoleChange={(member, role) => toast(`${member.name} is now ${asRole(role)}`)}
            onRemove={async (member) => {
                await wait(700);
                toast(`${member.name} was removed from Acme`);
            }}
            onResendInvite={(invite) => toast.success(`Invite sent again to ${invite.email}`)}
            onRevokeInvite={(invite, undo) => toast(`Invite for ${invite.email} revoked`, { action: { label: "Undo", onClick: undo } })}
            onCopyEmail={() => toast("Email address copied")}
            labels={{
                alreadyMember: (name) => `${name} is already in Acme.`,
                remove: "Remove from Acme",
                removeTitle: (name) => `Remove ${name} from Acme?`,
                removeDescription: "They lose access to every project straight away. Their reviews, comments and agent runs stay, under their name.",
            }}
        />
    );
}
