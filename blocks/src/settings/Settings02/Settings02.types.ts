import type { HTMLAttributes, ReactNode } from "react";

export interface Settings02Labels {
    /** The list of sections' name for screen readers. @default "Settings sections" */
    sections?: string;
    /** Beside the section's heading for a moment after `savedAt` changes. @default "Saved" */
    saved?: string;
}

/** A card of rows within a section, under an optional heading. */
export interface Settings02Group {
    /** A small heading over the card: "Starting up". */
    title?: ReactNode;
    /** Its rows: SettingsRow components with the controls in them. */
    content: ReactNode;
}

/** One section of settings, with its place in the list down the left. */
export interface Settings02Section {
    /** Names the section for `section` and `onSectionChange`. */
    id: string;
    /** Its name, in the list and as its heading. */
    label: string;
    /** A 15px icon before the name in the list. */
    icon?: ReactNode;
    /** A line under the heading. */
    description?: ReactNode;
    /** Its cards of rows. */
    groups: Settings02Group[];
}

export interface Settings02Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The page's heading: "Settings". */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The sections, in the order they're listed. */
    sections: Settings02Section[];
    /** The id of the section that's showing, to control it from outside. */
    section?: string;
    /** The section it starts on, when `section` isn't given. @default the first */
    defaultSection?: string;
    /** Called when someone picks another section. */
    onSectionChange?(id: string): void;
    /** When a change was last saved, such as Date.now(). Each new value shows "Saved" beside the heading for two seconds. */
    savedAt?: number;
    /** Words that aren't content (names for screen readers, "Saved"), in English unless you pass your own. */
    labels?: Settings02Labels;
}
