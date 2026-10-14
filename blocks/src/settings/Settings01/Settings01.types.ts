import type { HTMLAttributes, ReactNode } from "react";

export interface Settings01Labels {
    /** The dialog's title. @default "Settings" */
    title?: string;
    /** The close button's name. @default "Close settings" */
    close?: string;
    /** The list of sections' name for screen readers. @default "Settings sections" */
    sections?: string;
    /** The line under the sections. @default "Changes save as you go." */
    saved?: string;
}

/** One section of settings, with its place in the list down the left. */
export interface Settings01Section {
    /** Names the section for `section` and `onSectionChange`. */
    id: string;
    /** Its name, in the list and as its heading. */
    label: string;
    /** A 15px icon before the name in the list. */
    icon?: ReactNode;
    /** A line under the heading. */
    description?: ReactNode;
    /** Its rows: SettingsRow components with the controls in them. Save each change as it happens. */
    content: ReactNode;
}

export interface Settings01Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The sections, in the order they're listed. */
    sections: Settings01Section[];
    /** Whether the dialog is open, to control it from outside (from a Settings button, say). */
    open?: boolean;
    /** Whether it starts open, when `open` isn't given.
     * @default false */
    defaultOpen?: boolean;
    /** Called when it opens (with ⌘, or Ctrl+,) or closes (with Escape, the backdrop or the close button). */
    onOpenChange?(open: boolean): void;
    /** ⌘, on a Mac and Ctrl+, elsewhere open it, as in most desktop apps.
     * @default true */
    shortcut?: boolean;
    /** The id of the section that's showing, to control it from outside. */
    section?: string;
    /** The section it starts on, when `section` isn't given. @default the first */
    defaultSection?: string;
    /** Called when someone picks another section. */
    onSectionChange?(id: string): void;
    /** Words that aren't content (the title, names for screen readers), in English unless you pass your own. */
    labels?: Settings01Labels;
}
