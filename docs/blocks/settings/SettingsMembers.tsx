import { useId, useState, type FormEvent } from "react";

import { Avatar, Badge, Button, Card, ConfirmDialog, copyText, Field, Input, Menu, MenuItem, MenuSeparator, Select, Text, toast } from "@openwarelabs/ui";
import { Copy, Ellipsis, Mail, RotateCw, Send, UserMinus, X } from "lucide-react";

import "./SettingsMembers.css";

type Role = "admin" | "member" | "guest";

interface Member {
    name: string;
    email: string;
    role: Role | "owner";
}

interface Invite {
    email: string;
    role: Role;
    sent: string;
}

const roleOptions = [
    { value: "admin", label: "Admin", description: "Billing, members and every project." },
    { value: "member", label: "Member", description: "Every project, but not billing or members." },
    { value: "guest", label: "Guest", description: "Only the projects they're added to." },
];

const roleName = (role: Role | "owner") => (role === "owner" ? "Owner" : roleOptions.find((option) => option.value === role)!.label);

/** "admin" → "an admin", "guest" → "a guest" */
const asRole = (role: Role) => (role === "admin" ? "an admin" : `a ${role}`);

const initialMembers: Member[] = [
    { name: "Maya Chen", email: "maya@example.com", role: "owner" },
    { name: "Tomás Reyes", email: "tomas@example.com", role: "admin" },
    { name: "Clara Novak", email: "clara@example.com", role: "member" },
    { name: "Jonas Berg", email: "jonas@example.com", role: "member" },
    { name: "Aiko Tanaka", email: "aiko@example.com", role: "member" },
    { name: "Sam Okafor", email: "sam@example.com", role: "guest" },
];

const initialInvites: Invite[] = [
    { email: "lena@example.com", role: "member", sent: "2 days ago" },
    { email: "omar@example.com", role: "guest", sent: "5 days ago" },
];

// The person looking at the page.
const you = "maya@example.com";

/** How many are in a list, beside its title. */
function CountText({ children }: { children: number }) {
    return (
        <Text as="span" tone="muted" className="settings-members__count">
            {children}
        </Text>
    );
}

export function SettingsMembers() {
    const titleId = useId();
    const emailId = useId();
    const [members, setMembers] = useState(initialMembers);
    const [invites, setInvites] = useState(initialInvites);
    const [email, setEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<Role>("member");
    const [emailError, setEmailError] = useState("");
    const [sending, setSending] = useState(false);
    const [removing, setRemoving] = useState<Member | null>(null);

    function invite(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = email.trim().toLowerCase();
        const member = members.find((entry) => entry.email === address);
        const error = !address
            ? "Enter the email address to send the invite to."
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
              ? "That doesn't look like an email address."
              : member
                ? `${member.name} is already in Acme.`
                : invites.some((entry) => entry.email === address)
                  ? "They're already invited. Resend it from the list below."
                  : "";
        setEmailError(error);
        if (error) {
            document.getElementById(emailId)?.focus();
            return;
        }
        setSending(true);
        window.setTimeout(() => {
            setSending(false);
            setInvites((current) => [{ email: address, role: inviteRole, sent: "Just now" }, ...current]);
            setEmail("");
            toast.success(`Invite sent to ${address}`, { description: `They'll join as ${asRole(inviteRole)}.` });
        }, 700);
    }

    function changeRole(member: Member, role: Role) {
        setMembers((current) => current.map((entry) => (entry.email === member.email ? { ...entry, role } : entry)));
        toast(`${member.name} is now ${asRole(role)}`);
    }

    function revokeInvite(invite: Invite) {
        setInvites((current) => current.filter((entry) => entry.email !== invite.email));
        // Revoking can be undone, so it isn't confirmed first.
        toast(`Invite for ${invite.email} revoked`, {
            action: { label: "Undo", onClick: () => setInvites((current) => [invite, ...current.filter((entry) => entry.email !== invite.email)]) },
        });
    }

    return (
        <section className="settings-members" aria-labelledby={titleId}>
            <div className="settings-members__inner">
                <div className="settings-members__header">
                    <Text variant="dialog-title" as="h2" id={titleId}>
                        Members
                    </Text>
                    <Text variant="copy" className="settings-members__text">
                        {members.length} people in Acme{invites.length ? `, and ${invites.length} invited` : ""}. Admins can invite people, change roles and
                        remove them.
                    </Text>
                </div>

                <Card padding="none" className="settings-members__card">
                    <form className="settings-members__invite" noValidate onSubmit={invite}>
                        <Field label="Invite by email" hint="The link in the invite works for 7 days." error={emailError}>
                            <Input
                                id={emailId}
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setEmailError("");
                                }}
                                placeholder="name@example.com"
                                startContent={<Mail size={16} />}
                                autoComplete="off"
                            />
                        </Field>
                        <Select
                            aria-label="Role for the invite"
                            className="settings-members__invite-role"
                            value={inviteRole}
                            onChange={(value) => setInviteRole(value as Role)}
                            options={roleOptions}
                        />
                        <Button type="submit" variant="primary" startIcon={<Send size={16} />} loading={sending} className="settings-members__invite-send">
                            Send invite
                        </Button>
                    </form>

                    <Text variant="label" as="h3" tone="muted" className="settings-members__list-title">
                        Members <CountText>{members.length}</CountText>
                    </Text>
                    <ul className="settings-members__list">
                        {members.map((member) => (
                            <li key={member.email} className="settings-members__row">
                                <span className="settings-members__person">
                                    <Avatar name={member.name} />
                                    <span className="settings-members__person-text">
                                        <Text variant="label" className="settings-members__name">
                                            {member.name}
                                            {member.email === you ? (
                                                <Badge size="sm" variant="neutral">
                                                    You
                                                </Badge>
                                            ) : null}
                                        </Text>
                                        <Text variant="caption" truncate>
                                            {member.email}
                                        </Text>
                                    </span>
                                </span>
                                <span className="settings-members__controls">
                                    {member.role === "owner" ? (
                                        <Text as="span" tone="muted" className="settings-members__owner">
                                            Owner
                                        </Text>
                                    ) : (
                                        <Select
                                            aria-label={`Role for ${member.name}`}
                                            size="sm"
                                            className="settings-members__role"
                                            value={member.role}
                                            onChange={(value) => changeRole(member, value as Role)}
                                            options={roleOptions}
                                        />
                                    )}
                                    {member.role === "owner" ? (
                                        <span className="settings-members__menu-spacer" />
                                    ) : (
                                        <Menu
                                            label={`Actions for ${member.name}`}
                                            align="end"
                                            trigger={
                                                <Button size="sm" variant="ghost" iconOnly aria-label={`More for ${member.name}`}>
                                                    <Ellipsis size={16} />
                                                </Button>
                                            }
                                        >
                                            <MenuItem
                                                icon={<Copy size={15} />}
                                                onSelect={async () => {
                                                    if (await copyText(member.email)) toast("Email address copied");
                                                }}
                                            >
                                                Copy email address
                                            </MenuItem>
                                            <MenuSeparator />
                                            <MenuItem icon={<UserMinus size={15} />} destructive onSelect={() => setRemoving(member)}>
                                                Remove from Acme
                                            </MenuItem>
                                        </Menu>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {invites.length ? (
                        <>
                            <Text variant="label" as="h3" tone="muted" className="settings-members__list-title">
                                Pending invites <CountText>{invites.length}</CountText>
                            </Text>
                            <ul className="settings-members__list">
                                {invites.map((entry) => (
                                    <li key={entry.email} className="settings-members__row">
                                        <span className="settings-members__person">
                                            <span className="settings-members__invite-icon" aria-hidden="true">
                                                <Mail size={14} />
                                            </span>
                                            <span className="settings-members__person-text">
                                                <Text variant="label" truncate>
                                                    {entry.email}
                                                </Text>
                                                <Text variant="caption" truncate>
                                                    Invited {entry.sent.toLowerCase()} by Maya Chen
                                                </Text>
                                            </span>
                                        </span>
                                        <span className="settings-members__controls">
                                            <Badge size="sm" variant="warning">
                                                {roleName(entry.role)} · pending
                                            </Badge>
                                            <Menu
                                                label={`Actions for the invite to ${entry.email}`}
                                                align="end"
                                                trigger={
                                                    <Button size="sm" variant="ghost" iconOnly aria-label={`More for ${entry.email}`}>
                                                        <Ellipsis size={16} />
                                                    </Button>
                                                }
                                            >
                                                <MenuItem icon={<RotateCw size={15} />} onSelect={() => toast.success(`Invite sent again to ${entry.email}`)}>
                                                    Resend invite
                                                </MenuItem>
                                                <MenuSeparator />
                                                <MenuItem icon={<X size={15} />} destructive onSelect={() => revokeInvite(entry)}>
                                                    Revoke invite
                                                </MenuItem>
                                            </Menu>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : null}
                </Card>
            </div>

            <ConfirmDialog
                open={removing !== null}
                onClose={() => setRemoving(null)}
                destructive
                title={`Remove ${removing?.name ?? "them"} from Acme?`}
                description="They lose access to every project straight away. Their reviews, comments and agent runs stay, under their name."
                confirmLabel="Remove member"
                onConfirm={async () => {
                    const member = removing;
                    await new Promise((resolve) => window.setTimeout(resolve, 700));
                    if (!member) return;
                    setMembers((current) => current.filter((entry) => entry.email !== member.email));
                    toast(`${member.name} was removed from Acme`);
                }}
            />
        </section>
    );
}
