import type { FormEvent, HTMLAttributes, ReactNode } from "react";

import type { BlockLink } from "@blocks/shared/shared.types";

export interface Form01Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onSubmit"> {
    /** The page's heading: "New project". It also names the form. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** A link back above the heading, with an arrow: the page this one came from. */
    backLink?: BlockLink;
    /** The fields, stacked on the card in order: Field, RadioGroup, Checkbox and the like. Their values and errors are yours to keep. */
    children: ReactNode;
    /** The button in the card's footer: "Create project". */
    submitLabel: ReactNode;
    /** Runs when the form is sent, by the button or Enter. The default (a page load) is already prevented. */
    onSubmit?(event: FormEvent<HTMLFormElement>): void;
    /** Shows a spinner on the button while the form is saving. */
    submitting?: boolean;
    /** Small print beside the button. */
    note?: ReactNode;
}
