import type { ReactNode } from "react";

import type { FormErrors, FormValues } from "@/components/Form/Form";

/** The values of every step so far, by field name: strings, or a string[] where a name repeats. */
export type WizardValues = FormValues;

/** Messages by field name, as a step's `validate` returns them. */
export type WizardErrors = FormErrors;

/** What a step's `render` function (or the Wizard's children function) gets. */
export interface WizardStepContext {
    /** The step being shown. */
    step: WizardStep;
    /** Its position, from 0. */
    index: number;
    /** How many steps there are. */
    count: number;
    /** The values collected so far. Use them as the fields' `defaultValue`s, so a step shows what was typed when someone comes back to it. */
    values: WizardValues;
    /** Changes the collected values from outside a field, such as a value worked out in code. */
    setValues(values: WizardValues | ((previous: WizardValues) => WizardValues)): void;
    /** Submits the step: runs its checks and, when they pass, moves on. The same as pressing Next. */
    next(): void;
    /** Goes to the step before, keeping what was typed. */
    back(): void;
    /** Moves past an `optional` step without its checks. */
    skip(): void;
    /** Goes to a step by index: back to any step, and ahead only when `linear` is off. */
    goTo(index: number): void;
    /** The errors showing in this step, by field name. Pass them to a RadioGroup or CheckboxGroup as `error={errors.name}`. */
    errors: WizardErrors;
    /** True while a step's `validate` or `onComplete` is pending. */
    submitting: boolean;
}

export interface WizardStep {
    /** Unique. */
    id: string;
    /** The step's heading, also shown in the progress strip and read out when the step opens. */
    title: string;
    /** A line under the heading, and under the title in the strip. */
    description?: ReactNode;
    /** The step can be skipped: a Skip button sits beside Next.
     * @default false */
    optional?: boolean;
    /**
     * Checks the values after the browser's own checks, with every step's values so far: return { [name]: message } for
     * what's wrong, or a promise of it for a check on a server. Each message shows under its field.
     */
    validate?(values: WizardValues): WizardErrors | void | Promise<WizardErrors | void>;
    /** The step's fields. Left out, the Wizard's children function renders the step. */
    render?(context: WizardStepContext): ReactNode;
}

export interface WizardLabels {
    /** @default "Back" */
    back?: string;
    /** @default "Next" */
    next?: string;
    /** The last step's Next.
     * @default "Finish" */
    finish?: string;
    /** @default "Skip" */
    skip?: string;
    /** Shown over the step's heading, and read out with its title when a step opens.
     * @default (current, total) => `Step ${current} of ${total}` */
    progress?(current: number, total: number): string;
    /** Marks an optional step in the strip when it has no description.
     * @default "Optional" */
    optional?: string;
}

export interface WizardProps {
    /** The steps, in order. */
    steps: WizardStep[];
    /** The values of every step, when you keep them. */
    value?: WizardValues;
    /** The values at first, when the Wizard keeps them itself.
     * @default {} */
    defaultValue?: WizardValues;
    /** Called with every step's values whenever a step is left or `setValues` is called. */
    onChange?(values: WizardValues): void;
    /** The index of the step shown, when you control it. */
    step?: number;
    /** The step shown at first.
     * @default 0 */
    defaultStep?: number;
    /** Called with the new index when the step changes. */
    onStepChange?(step: number): void;
    /** Called with every step's values when the last step passes its checks. Return a promise to keep Finish loading until it settles; if it rejects, the message shows above the buttons. */
    onComplete(values: WizardValues): unknown;
    /** `horizontal` puts the progress strip over the step; `vertical` puts the list of steps beside it, and above it on narrow screens.
     * @default "horizontal" */
    orientation?: "horizontal" | "vertical";
    /** Steps come in order: the strip only goes back to steps already seen, and Next is the only way ahead. Off, any step in the strip can be opened.
     * @default true */
    linear?: boolean;
    /** A key under which the step and values are saved in sessionStorage, so a reload comes back to the same place. Cleared when the Wizard completes. */
    persist?: string;
    /** The level of each step's heading.
     * @default 2 */
    headingLevel?: 2 | 3 | 4;
    /** Names the Wizard for screen readers: "Create an account".
     * @default "Steps" */
    label?: string;
    /** The words it uses, for other languages. */
    labels?: WizardLabels;
    /** Renders a step that has no `render` of its own: ({ step, values, errors, … }) => its fields. */
    children?: (context: WizardStepContext) => ReactNode;
    className?: string;
}

/** What's saved in sessionStorage under `persist`. */
export interface WizardSaved {
    step?: number;
    values?: WizardValues;
    completed?: string[];
}
