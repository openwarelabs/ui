import type { HTMLAttributes, ReactNode } from "react";

/** An API key, as the table lists it. The secret itself is never kept: only the public part that identifies it. */
export interface Settings03Key {
    /** Names it for `onRevokeKey`. */
    id: string;
    /** Where it's used: "CI deploys". */
    name: string;
    /** The public part at the front of the key, shown with the secret masked after it, and copied by its button. */
    prefix: string;
    /** What it can do: "Read only". */
    access?: string;
    /** Who made it. */
    createdBy?: string;
    /** When it was made: "12 Mar 2026". */
    created: string;
    /** When it was last used: "2 hours ago". Leave it out for a key that's never been used. */
    lastUsed?: string;
}

/** A choice in the create dialog's menus. */
export interface Settings03Option {
    value: string;
    label: string;
    /** Under the menu while it's chosen. */
    description?: string;
}

/** What the create dialog asks for. */
export interface Settings03NewKey {
    /** The name, trimmed. */
    name: string;
    /** The chosen access option's value. */
    access?: string;
    /** The chosen expiry option's value. */
    expiry?: string;
}

/** A key just made: its row, and the whole key to show once. */
export interface Settings03CreatedKey {
    key: Settings03Key;
    /** The full key, secret and all. It's shown in the dialog to copy, then never again. */
    secret: string;
}

export interface Settings03Labels {
    /** The button in the header and the create dialog's. @default "Create key" */
    create?: string;
    /** The create dialog's title. @default "Create an API key" */
    createTitle?: string;
    /** The line under it. @default "You'll see the key once, straight after you create it." */
    createDescription?: string;
    /** @default "Name" */
    name?: string;
    /** @default "Where it's used, so you know which one to revoke." */
    nameHint?: string;
    /** @default "Nightly backups" */
    namePlaceholder?: string;
    /** @default "Name the key after where it's used, like the service or script." */
    nameEmpty?: string;
    /** When another key has the name. @default `There's already a key called ${name}.` */
    nameTaken?(name: string): string;
    /** Shown when `onCreateKey` fails without a message of its own. @default "That didn't go through. Try again in a moment." */
    failed?: string;
    /** @default "Access" */
    access?: string;
    /** @default "Expires" */
    expiry?: string;
    /** @default "Cancel" */
    cancel?: string;
    /** The dialog's title once the key is made. @default "Copy your new key" */
    createdTitle?: string;
    /** The line under it. @default "This is the only time you'll see it. Put it somewhere safe, like your CI's secrets, before you close this." */
    createdDescription?: string;
    /** @default "Done" */
    done?: string;
    /** The table's caption, for screen readers. @default "API keys" */
    table?: string;
    /** Column headings. @default "Name", "Key", "Created", "Last used", "Actions" */
    columns?: { name?: string; key?: string; created?: string; lastUsed?: string; actions?: string };
    /** Read out after the key's public part. @default ", then the secret, hidden" */
    secretHidden?: string;
    /** The copy button's name. @default `Copy the ID of ${name}` */
    copy?(name: string): string;
    /** For a key that's never been used. @default "Never" */
    never?: string;
    /** Under the name on phones. @default `used ${lastUsed.toLowerCase()}`, or "never used" */
    used?(lastUsed: string | undefined): string;
    /** @default "Revoke" */
    revoke?: string;
    /** The revoke button's name. @default `Revoke ${name}` */
    revokeKey?(name: string): string;
    /** The confirmation's title. @default `Revoke ${name}?` */
    revokeTitle?(name: string): string;
    /** The confirmation's line, given the key's public part in code. @default (prefix) => <>Anything still using {prefix} stops working straight away. You can't undo this.</> */
    revokeDescription?(prefix: ReactNode): ReactNode;
    /** The confirmation's button. @default "Revoke key" */
    revokeConfirm?: string;
    /** With no keys. @default "No API keys" */
    emptyTitle?: string;
    /** @default "Create one to use the API from a script or your CI." */
    emptyDescription?: string;
    /** Who made a key made here, when `onCreateKey` doesn't say. @default "You" */
    you?: string;
    /** When a key made here was made, when `onCreateKey` doesn't say. @default "Today" */
    today?: string;
}

export interface Settings03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading: "API keys". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The keys there are, newest first. The block keeps its own list from here, adding and removing keys as people do. */
    keys: Settings03Key[];
    /** The create dialog's access menu. Leave it out to not ask. */
    accessOptions?: Settings03Option[];
    /** The access chosen to start with. @default the first option */
    defaultAccess?: string;
    /** The create dialog's expiry menu. Leave it out to not ask. */
    expiryOptions?: Settings03Option[];
    /** The expiry chosen to start with. @default the first option */
    defaultExpiry?: string;
    /** Makes the key on your server and returns it, with the full secret to show once. If it throws, its message shows under the name. Without it a sample key is made here. */
    onCreateKey?(values: Settings03NewKey): Settings03CreatedKey | Promise<Settings03CreatedKey>;
    /** Revokes the key on your server, once it's confirmed. The confirmation waits for its promise and shows its error if it throws. */
    onRevokeKey?(key: Settings03Key): void | Promise<void>;
    /** Small print under the table, such as a link to the API guide. */
    note?: ReactNode;
    /** Words that aren't content (buttons, headings, messages), in English unless you pass your own. */
    labels?: Settings03Labels;
}
