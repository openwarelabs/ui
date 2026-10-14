import type { HTMLAttributes, ReactNode } from "react";

/** Another way to make the first one, shown as a ChoiceCard under the main button. */
export interface Empty01Way {
    /** Tells the ways apart; it comes back on the item made this way. */
    id: string;
    /** The card's title, and the dialog's when this way is picked: "Connect a repository". */
    title: string;
    /** A line under it: "Its code, branches and history." */
    description: string;
    /** A 20px icon on the card, usually from lucide-react. */
    icon?: ReactNode;
    /** Marks the card as the recommended way. */
    recommended?: boolean;
    /** What an item made this way says under its name: "Connected repository". */
    source?: ReactNode;
    /** The dialog's title when this way is picked. Defaults to the card's title. */
    dialogTitle?: ReactNode;
    /** A sentence under the dialog's title: "Name the project; you'll pick the repository next." */
    dialogDescription?: ReactNode;
}

/** Something made from the empty page, listed once there's one. */
export interface Empty01Item {
    /** The name it was given. */
    name: string;
    /** How it was made, shown under its name. */
    source?: ReactNode;
    /** The id of the way it was made, or undefined for the main button. */
    way?: string;
}

/** The words that aren't content, in English unless you pass your own. */
export interface Empty01Labels {
    /** The button in the header once there's something. @default "New project" */
    newItem?: string;
    /** The main button, and the dialog's button for it. @default "Create project" */
    create?: string;
    /** The dialog's button for the other ways. @default "Continue" */
    continue?: string;
    /** @default "Cancel" */
    cancel?: string;
    /** The line above the other ways. @default "or start another way" */
    otherWays?: string;
    /** The dialog's title for the main button. @default "Create a project" */
    dialogTitle?: ReactNode;
    /** @default "An empty project. Connect a repository to it whenever you're ready." */
    dialogDescription?: ReactNode;
    /** The name field's label. @default "Project name" */
    name?: string;
    /** @default "Lowercase letters, numbers and dashes." */
    nameHint?: string;
    /** @default "billing-api" */
    placeholder?: string;
    /** @default "Give the project a name." */
    nameRequired?: string;
    /** Shown when the name doesn't match `namePattern`. @default "Use only lowercase letters, numbers and dashes." */
    nameInvalid?: string;
    /** @default (name) => `There's already a project called ${name}.` */
    nameTaken?(name: string): string;
    /** The list's name for screen readers. @default "Projects" */
    list?: string;
    /** What an item made with the main button says under its name. @default "Blank project" */
    blankSource?: string;
    /** @default "Created just now" */
    createdJustNow?: string;
    /** The badge on a new item. @default "New" */
    newBadge?: string;
    /** The toast once it's made. @default (name) => `Created ${name}` */
    created?(name: string): string;
    /** The toast's button that takes it away again. @default "Undo" */
    undo?: string;
}

export interface Empty01Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The page's heading: "Projects". */
    title: ReactNode;
    /** A sentence under it. */
    description?: ReactNode;
    /** The empty state's 20px icon. */
    icon?: ReactNode;
    /** What's missing, as a plain statement: "No projects yet". */
    emptyTitle: ReactNode;
    /** What will be here, and why to make the first one. */
    emptyDescription?: ReactNode;
    /** Other ways to start, as cards under the main button. */
    ways?: Empty01Way[];
    /** What's there to begin with: leave it empty for the empty state. */
    defaultItems?: Empty01Item[];
    /** Runs when something is made: create it in your app. */
    onCreate?(item: Empty01Item): void;
    /** Runs when the toast's Undo takes it away again. */
    onRemove?(item: Empty01Item): void;
    /** What a name must look like.
     * @default /^[a-z0-9]+(-[a-z0-9]+)*$/ */
    namePattern?: RegExp;
    labels?: Empty01Labels;
}
