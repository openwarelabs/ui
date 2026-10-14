import type { FormEvent, HTMLAttributes, ReactNode } from "react";

export interface Form02Labels {
    /** Beside the buttons while there are changes. @default "You have unsaved changes." */
    unsaved?: string;
    /** Beside them when there aren't. @default "Everything is saved." */
    saved?: string;
    /** The button that puts the saved values back. @default "Discard" */
    discard?: string;
    /** The button that saves. @default "Save changes" */
    save?: string;
}

/** One section of the form: its title and purpose on the left, its fields on a card on the right. */
export interface Form02Section {
    /** The section's heading. */
    title: ReactNode;
    /** What it's for, under the heading. */
    description?: ReactNode;
    /** Its fields, stacked on the card: Field, RadioGroup, Checkbox and the like. Their values and errors are yours to keep. */
    content: ReactNode;
}

export interface Form02Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children" | "onSubmit"> {
    /** The page's heading: "Workspace". It also names the form. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The sections, down the page. */
    sections: Form02Section[];
    /** Whether the values differ from what's saved: it turns the buttons on and says so beside them. */
    dirty: boolean;
    /** Runs when the form is sent, by the button or Enter. The default (a page load) is already prevented. */
    onSubmit?(event: FormEvent<HTMLFormElement>): void;
    /** Puts the saved values back. */
    onDiscard?(): void;
    /** Shows a spinner on the save button while saving. */
    submitting?: boolean;
    /** Words that aren't content (the buttons, the status), in English unless you pass your own. */
    labels?: Form02Labels;
}
