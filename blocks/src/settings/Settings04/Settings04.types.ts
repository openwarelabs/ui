import type { HTMLAttributes, ReactNode } from "react";

/** A role someone can have. */
export interface Settings04Role {
    /** Kept on members and invites: "admin". */
    value: string;
    /** Its name: "Admin". */
    label: string;
    /** What it can do, under its name in the menus. */
    description?: string;
}

/** Someone in the workspace. */
export interface Settings04Member {
    name: string;
    /** Their address. It also tells members apart, so it must be unique. */
    email: string;
    /** One of the roles' values. Ignored for the owner. */
    role: string;
    /** The owner's role can't be changed and they can't be removed, so their row has neither. */
    owner?: boolean;
}

/** An invite that hasn't been accepted yet. */
export interface Settings04Invite {
    email: string;
    /** The role they'll join with: one of the roles' values. */
    role: string;
    /** When it was sent: "2 days ago". */
    sent: string;
    /** Who sent it. */
    invitedBy?: string;
}

export interface Settings04Labels {
    /** @default "Invite by email" */
    inviteEmail?: string;
    /** @default "The link in the invite works for 7 days." */
    inviteHint?: string;
    /** @default "name@example.com" */
    invitePlaceholder?: string;
    /** The invite's role menu, for screen readers. @default "Role for the invite" */
    inviteRole?: string;
    /** @default "Send invite" */
    send?: string;
    /** @default "Enter the email address to send the invite to." */
    emailEmpty?: string;
    /** @default "That doesn't look like an email address." */
    emailInvalid?: string;
    /** When the address belongs to a member. @default `${name} is already a member.` */
    alreadyMember?(name: string): string;
    /** When they're already invited. @default "They're already invited. Resend it from the list below." */
    alreadyInvited?: string;
    /** Shown when `onInvite` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
    /** @default "Members" */
    members?: string;
    /** @default "Pending invites" */
    invites?: string;
    /** The badge beside your own name. @default "You" */
    you?: string;
    /** In place of the owner's role menu. @default "Owner" */
    owner?: string;
    /** A member's role menu, for screen readers. @default `Role for ${name}` */
    roleFor?(name: string): string;
    /** A row's menu button, for screen readers. @default `More for ${name}` */
    moreFor?(name: string): string;
    /** A member's menu, for screen readers. @default `Actions for ${name}` */
    actionsFor?(name: string): string;
    /** An invite's menu, for screen readers. @default `Actions for the invite to ${email}` */
    inviteActionsFor?(email: string): string;
    /** @default "Copy email address" */
    copyEmail?: string;
    /** @default "Remove" */
    remove?: string;
    /** @default "Resend invite" */
    resend?: string;
    /** @default "Revoke invite" */
    revokeInvite?: string;
    /** The badge on an invite, given its role's name. @default `${role} · pending` */
    pending?(role: string): ReactNode;
    /** The line under an invite's address. @default `Invited ${sent.toLowerCase()} by ${invitedBy}` */
    invited?(invite: Settings04Invite): ReactNode;
    /** When an invite sent here was sent. @default "Just now" */
    justNow?: string;
    /** The removal's title. @default `Remove ${name}?` */
    removeTitle?(name: string): string;
    /** The removal's line. @default "They lose access straight away." */
    removeDescription?: string;
    /** The removal's button. @default "Remove member" */
    removeConfirm?: string;
}

export interface Settings04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading: "Members". */
    title: ReactNode;
    /** A line under it, given how many members and invites there are now. */
    description?: ReactNode | ((counts: { members: number; invites: number }) => ReactNode);
    /** The people in it, in order. The block keeps its own list from here, changing it as people do. */
    members: Settings04Member[];
    /** The invites still waiting. */
    invites?: Settings04Invite[];
    /** The roles, for the menus. */
    roles: Settings04Role[];
    /** The role an invite starts with. @default the first role */
    defaultInviteRole?: string;
    /** The address of the person looking, so their row says "You" and their invites say who sent them. */
    currentUserEmail?: string;
    /** Sends an invite, once the address is valid and new. While its promise is pending the button shows a spinner; if it throws, its message shows under the field. */
    onInvite?(invite: { email: string; role: string }): void | Promise<void>;
    /** Saves a member's new role. */
    onRoleChange?(member: Settings04Member, role: string): void;
    /** Removes a member, once it's confirmed. The confirmation waits for its promise and shows its error if it throws. */
    onRemove?(member: Settings04Member): void | Promise<void>;
    /** Sends an invite again. */
    onResendInvite?(invite: Settings04Invite): void;
    /** Revokes an invite. It goes from the list straight away, as it can be undone: call `undo` (from a toast's Undo, say) to put it back. */
    onRevokeInvite?(invite: Settings04Invite, undo: () => void): void;
    /** Called once a member's address is on the clipboard, to say so. */
    onCopyEmail?(member: Settings04Member): void;
    /** Words that aren't content (labels, buttons, menus, messages), in English unless you pass your own. */
    labels?: Settings04Labels;
}
