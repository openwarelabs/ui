import type { HTMLAttributes, ReactNode } from "react";

/** Someone the project can be handed to. */
export interface Settings05Admin {
    /** Passed to `onTransfer`, and shown as the owner afterwards: their name. */
    value: string;
    label: string;
    /** Under the name in the menu: "Admin · tomas@example.com". */
    description?: string;
}

/** Something that's deleted with the project, listed in the confirmation. */
export interface Settings05Content {
    /** How many: "214". */
    count: ReactNode;
    /** Of what: "deploys, with their logs and preview URLs". */
    what: ReactNode;
}

export interface Settings05Labels {
    /** @default "Transfer ownership" */
    transferTitle?: string;
    /** Under it, while you own it. @default "You own it now. Hand it to another admin and stay on as a member." */
    transferYou?: string;
    /** Under it, once someone else does. @default `${owner} owns it now. They can hand it back at any time.` */
    transferOther?(owner: string): string;
    /** @default "Transfer" */
    transfer?: string;
    /** The confirmation's title. @default `Transfer ${project}?` */
    transferConfirmTitle?(project: string): string;
    /** @default "The new owner can rename, transfer or delete it. You'll stay on as a member." */
    transferConfirmDescription?: string;
    /** @default "Transfer ownership" */
    transferConfirm?: string;
    /** @default "New owner" */
    newOwner?: string;
    /** @default "Choose an admin" */
    newOwnerPlaceholder?: string;
    /** @default "Archive project" */
    archiveTitle?: string;
    /** @default "Pauses the project and hides it from the sidebar. You can restore it at any time." */
    archiveDescription?: string;
    /** @default "Archive" */
    archive?: string;
    /** @default "Restore project" */
    restoreTitle?: string;
    /** @default "It's archived: it's paused and hidden from the sidebar." */
    archivedDescription?: string;
    /** @default "Restore" */
    restore?: string;
    /** The last row's title, and its button. @default "Delete project" */
    deleteTitle?: string;
    /** @default "Deletes it for good, with everything in it. This can't be undone." */
    deleteDescription?: string;
    /** The confirmation's title. @default `Delete ${project}?` */
    deleteConfirmTitle?(project: string): string;
    /** The confirmation's line, before the list of what goes. @default "This deletes the project for everyone. Along with it go:" */
    deleteConfirmDescription?: string;
    /** The field's label, given the name to type in code. @default (project) => <>Type {project} to confirm</> */
    typeToConfirm?(project: ReactNode): ReactNode;
    /** The confirmation's button. @default "Delete project" */
    deleteConfirm?: string;
    /** What shows once it's gone. @default `${project} was deleted` */
    deletedTitle?(project: string): string;
    /** @default "Its data and settings are gone." */
    deletedDescription?: string;
    /** The button under it. @default "Back to projects" */
    back?: string;
}

export interface Settings05Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading: "Danger zone". */
    title: ReactNode;
    /** A line under it: what these change, and who can use them. */
    description?: ReactNode;
    /** The project's name: in the confirmations, and what has to be typed to delete it. */
    project: string;
    /** Who owns it now, by name. */
    owner: string;
    /** The name of the person looking, so the transfer row can say "You own it now". */
    currentUserName?: string;
    /** Who it can be handed to. */
    admins: Settings05Admin[];
    /** What goes with it, listed in the delete confirmation. */
    contents?: Settings05Content[];
    /** Whether it starts archived. */
    defaultArchived?: boolean;
    /** Hands it to someone, once it's confirmed. The confirmation waits for its promise and shows its error if it throws. */
    onTransfer?(owner: string): void | Promise<void>;
    /** Archives or restores it. It happens straight away, as it can be undone: call `undo` (from a toast's Undo, say) to switch it back. */
    onArchiveChange?(archived: boolean, undo: () => void): void;
    /** Deletes it, once the name is typed and it's confirmed. The confirmation waits for its promise and shows its error if it throws. */
    onDelete?(): void | Promise<void>;
    /** The button once it's gone, which usually goes to the project list. Without it the button brings the section back. */
    onBack?(): void;
    /** Words that aren't content (row titles, buttons, confirmations), in English unless you pass your own. */
    labels?: Settings05Labels;
}
