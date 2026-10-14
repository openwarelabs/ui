import type { HTMLAttributes, ReactNode } from "react";

export interface Form03Labels {
    /** The progress strip's name for screen readers. @default "Progress" */
    progress?: string;
    /** Over the step's heading. @default (step, total) => <>Step {step} of {total}</> */
    stepOf?(step: number, total: number): ReactNode;
    /** @default "Back" */
    back?: string;
    /** The button on every step but the last. @default "Continue" */
    continue?: string;
    /** The button on a review row. @default "Edit" */
    edit?: string;
    /** Its name for screen readers, given the row's label. @default `Edit ${label.toLowerCase()}` */
    editLabel?(label: string): string;
}

/** A line on the review step, with a button back to the step it came from. */
export interface Form03ReviewRow {
    /** What it is: "Team". */
    label: string;
    /** What was chosen. */
    value: ReactNode;
    /** The index of the step that changes it. */
    step: number;
}

/** One step of the form. */
export interface Form03Step {
    /** Its name in the progress strip: "Team". */
    title: ReactNode;
    /** A line under the name there: "Name and lead". */
    description?: ReactNode;
    /** The heading over its fields: "Name the team". */
    heading: ReactNode;
    /** Its fields: Field, RadioGroup, CheckboxGroup and the like. Their values and errors are yours to keep. */
    content?: ReactNode;
    /** For a last step that checks everything: rows of what was chosen, each with an Edit button. */
    review?: Form03ReviewRow[];
    /** Checks the step's fields before moving on: return false to stay (after showing what's wrong and focusing the field). */
    validate?(): boolean;
}

export interface Form03Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children" | "onSubmit"> {
    /** The form's heading: "Create a team". It also names the form. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The steps, in order. */
    steps: Form03Step[];
    /** The last step's button: "Create team and invite 3". */
    submitLabel: ReactNode;
    /** Runs on the last step, once it validates. While its promise is pending the button shows a spinner; when it resolves the form goes back to the first step. */
    onSubmit?(): void | Promise<void>;
    /** Called when the step changes, with its index: by Continue, Back or a review row's Edit. */
    onStepChange?(step: number): void;
    /** Words that aren't content (the buttons, the step count), in English unless you pass your own. */
    labels?: Form03Labels;
}
