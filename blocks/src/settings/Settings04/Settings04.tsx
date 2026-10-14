import { useId, useState, type FormEvent, type ReactNode } from "react";

import { Avatar, Badge, Button, Card, ConfirmDialog, copyText, cx, Field, Input, Menu, MenuItem, MenuSeparator, Select, Text } from "@openwarelabs/ui";

import { CopyIcon, EllipsisIcon, MailIcon, RotateCwIcon, SendIcon, UserMinusIcon, XIcon } from "@blocks/shared/icons";
import type { Settings04Invite, Settings04Member, Settings04Props } from "./Settings04.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How many are in a list, beside its title. */
function CountText({ children }: { children: ReactNode }) {
    return (
        <Text as="span" tone="muted" className="ow-settings04__count">
            {children}
        </Text>
    );
}

/** People with their role and a menu to change it or remove them, an invite at the top, and the invites still waiting. */
export function Settings04({
    title,
    description,
    members: initialMembers,
    invites: initialInvites = [],
    roles,
    defaultInviteRole,
    currentUserEmail,
    onInvite,
    onRoleChange,
    onRemove,
    onResendInvite,
    onRevokeInvite,
    onCopyEmail,
    labels = {},
    className,
    ...props
}: Settings04Props) {
    const titleId = useId();
    const emailId = useId();
    const [members, setMembers] = useState(initialMembers);
    const [invites, setInvites] = useState(initialInvites);
    const [email, setEmail] = useState("");
    const [inviteRole, setInviteRole] = useState(defaultInviteRole ?? roles[0]?.value ?? "");
    const [emailError, setEmailError] = useState("");
    const [sending, setSending] = useState(false);
    const [removing, setRemoving] = useState<Settings04Member | null>(null);

    const roleName = (role: string) => roles.find((option) => option.value === role)?.label ?? role;
    const you = members.find((member) => member.email === currentUserEmail);

    async function invite(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = email.trim().toLowerCase();
        const member = members.find((entry) => entry.email.toLowerCase() === address);
        const error = !address
            ? (labels.emailEmpty ?? "Enter the email address to send the invite to.")
            : !emailPattern.test(address)
              ? (labels.emailInvalid ?? "That doesn't look like an email address.")
              : member
                ? (labels.alreadyMember?.(member.name) ?? `${member.name} is already a member.`)
                : invites.some((entry) => entry.email.toLowerCase() === address)
                  ? (labels.alreadyInvited ?? "They're already invited. Resend it from the list below.")
                  : "";
        setEmailError(error);
        if (error) {
            document.getElementById(emailId)?.focus();
            return;
        }
        setSending(true);
        try {
            await onInvite?.({ email: address, role: inviteRole });
        } catch (failure) {
            setEmailError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
            document.getElementById(emailId)?.focus();
            return;
        } finally {
            setSending(false);
        }
        setInvites((current) => [{ email: address, role: inviteRole, sent: labels.justNow ?? "Just now", invitedBy: you?.name }, ...current]);
        setEmail("");
    }

    function changeRole(member: Settings04Member, role: string) {
        setMembers((current) => current.map((entry) => (entry.email === member.email ? { ...entry, role } : entry)));
        onRoleChange?.(member, role);
    }

    function revokeInvite(entry: Settings04Invite) {
        setInvites((current) => current.filter((item) => item.email !== entry.email));
        // Revoking can be undone, so it isn't confirmed first.
        onRevokeInvite?.(entry, () => setInvites((current) => [entry, ...current.filter((item) => item.email !== entry.email)]));
    }

    const invitedText = (entry: Settings04Invite) =>
        labels.invited ? (
            labels.invited(entry)
        ) : (
            <>
                Invited {entry.sent.toLowerCase()}
                {entry.invitedBy ? ` by ${entry.invitedBy}` : null}
            </>
        );

    return (
        <section className={cx("ow-settings04", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-settings04__inner">
                <div className="ow-settings04__header">
                    <Text variant="dialog-title" as="h2" id={titleId}>
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-settings04__text">
                            {typeof description === "function" ? description({ members: members.length, invites: invites.length }) : description}
                        </Text>
                    ) : null}
                </div>

                <Card padding="none" className="ow-settings04__card">
                    <form className="ow-settings04__invite" noValidate onSubmit={invite}>
                        <Field
                            label={labels.inviteEmail ?? "Invite by email"}
                            hint={labels.inviteHint ?? "The link in the invite works for 7 days."}
                            error={emailError}
                        >
                            <Input
                                id={emailId}
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setEmailError("");
                                }}
                                placeholder={labels.invitePlaceholder ?? "name@example.com"}
                                startContent={<MailIcon size={16} />}
                                autoComplete="off"
                            />
                        </Field>
                        <Select
                            aria-label={labels.inviteRole ?? "Role for the invite"}
                            className="ow-settings04__invite-role"
                            value={inviteRole}
                            onChange={setInviteRole}
                            options={roles}
                        />
                        <Button type="submit" variant="primary" startIcon={<SendIcon size={16} />} loading={sending} className="ow-settings04__invite-send">
                            {labels.send ?? "Send invite"}
                        </Button>
                    </form>

                    <Text variant="label" as="h3" tone="muted" className="ow-settings04__list-title">
                        {`${labels.members ?? "Members"} `}
                        <CountText>{members.length}</CountText>
                    </Text>
                    <ul className="ow-settings04__list">
                        {members.map((member) => (
                            <li key={member.email} className="ow-settings04__row">
                                <span className="ow-settings04__person">
                                    <Avatar name={member.name} />
                                    <span className="ow-settings04__person-text">
                                        <Text variant="label" className="ow-settings04__name">
                                            {member.name}
                                            {member.email === currentUserEmail ? (
                                                <Badge size="sm" variant="neutral">
                                                    {labels.you ?? "You"}
                                                </Badge>
                                            ) : null}
                                        </Text>
                                        <Text variant="caption" truncate>
                                            {member.email}
                                        </Text>
                                    </span>
                                </span>
                                <span className="ow-settings04__controls">
                                    {member.owner ? (
                                        <Text as="span" tone="muted" className="ow-settings04__owner">
                                            {labels.owner ?? "Owner"}
                                        </Text>
                                    ) : (
                                        <Select
                                            aria-label={labels.roleFor?.(member.name) ?? `Role for ${member.name}`}
                                            size="sm"
                                            className="ow-settings04__role"
                                            value={member.role}
                                            onChange={(value) => changeRole(member, value)}
                                            options={roles}
                                        />
                                    )}
                                    {member.owner ? (
                                        <span className="ow-settings04__menu-spacer" />
                                    ) : (
                                        <Menu
                                            label={labels.actionsFor?.(member.name) ?? `Actions for ${member.name}`}
                                            align="end"
                                            trigger={
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    iconOnly
                                                    aria-label={labels.moreFor?.(member.name) ?? `More for ${member.name}`}
                                                >
                                                    <EllipsisIcon size={16} />
                                                </Button>
                                            }
                                        >
                                            <MenuItem
                                                icon={<CopyIcon size={15} />}
                                                onSelect={async () => {
                                                    if (await copyText(member.email)) onCopyEmail?.(member);
                                                }}
                                            >
                                                {labels.copyEmail ?? "Copy email address"}
                                            </MenuItem>
                                            <MenuSeparator />
                                            <MenuItem icon={<UserMinusIcon size={15} />} destructive onSelect={() => setRemoving(member)}>
                                                {labels.remove ?? "Remove"}
                                            </MenuItem>
                                        </Menu>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {invites.length ? (
                        <>
                            <Text variant="label" as="h3" tone="muted" className="ow-settings04__list-title">
                                {`${labels.invites ?? "Pending invites"} `}
                                <CountText>{invites.length}</CountText>
                            </Text>
                            <ul className="ow-settings04__list">
                                {invites.map((entry) => (
                                    <li key={entry.email} className="ow-settings04__row">
                                        <span className="ow-settings04__person">
                                            <span className="ow-settings04__invite-icon" aria-hidden="true">
                                                <MailIcon size={14} />
                                            </span>
                                            <span className="ow-settings04__person-text">
                                                <Text variant="label" truncate>
                                                    {entry.email}
                                                </Text>
                                                <Text variant="caption" truncate>
                                                    {invitedText(entry)}
                                                </Text>
                                            </span>
                                        </span>
                                        <span className="ow-settings04__controls">
                                            <Badge size="sm" variant="warning">
                                                {labels.pending ? labels.pending(roleName(entry.role)) : <>{roleName(entry.role)} · pending</>}
                                            </Badge>
                                            <Menu
                                                label={labels.inviteActionsFor?.(entry.email) ?? `Actions for the invite to ${entry.email}`}
                                                align="end"
                                                trigger={
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        iconOnly
                                                        aria-label={labels.moreFor?.(entry.email) ?? `More for ${entry.email}`}
                                                    >
                                                        <EllipsisIcon size={16} />
                                                    </Button>
                                                }
                                            >
                                                <MenuItem icon={<RotateCwIcon size={15} />} onSelect={() => onResendInvite?.(entry)}>
                                                    {labels.resend ?? "Resend invite"}
                                                </MenuItem>
                                                <MenuSeparator />
                                                <MenuItem icon={<XIcon size={15} />} destructive onSelect={() => revokeInvite(entry)}>
                                                    {labels.revokeInvite ?? "Revoke invite"}
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
                title={labels.removeTitle?.(removing?.name ?? "") ?? `Remove ${removing?.name ?? "them"}?`}
                description={labels.removeDescription ?? "They lose access straight away."}
                confirmLabel={labels.removeConfirm ?? "Remove member"}
                onConfirm={async () => {
                    const member = removing;
                    if (!member) return;
                    await onRemove?.(member);
                    setMembers((current) => current.filter((entry) => entry.email !== member.email));
                }}
            />
        </section>
    );
}
