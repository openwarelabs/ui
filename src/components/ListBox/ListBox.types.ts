import type { ReactNode } from "react";
import type { SelectOption } from "@/components/Select/Select";

/** An option, shaped like Select's, with an optional icon. */
export interface ListBoxOption extends SelectOption {
    /** A 16px icon between the checkmark and the label. */
    icon?: ReactNode;
    /** Plain text for type-to-find, when `label` isn't a string. */
    textValue?: string;
}

/** Options under a heading, like a Select's groups. */
export interface ListBoxGroup {
    /** The heading, shown in uppercase above the options and read out as the group's name. */
    label: string;
    options: ListBoxOption[];
}

export type ListBoxItem = ListBoxOption | ListBoxGroup;

export type ListBoxSelectionMode = "single" | "multiple";

/** ListBox's props for one selection mode: `value` is a string in single mode and an array in multiple mode. */
export interface ListBoxModeProps<Mode extends ListBoxSelectionMode> {
    /** The options, and groups of options under a heading. */
    options: ListBoxItem[];
    /** `single` chooses one option; `multiple` any number.
     * @default "single" */
    selectionMode?: Mode;
    /** The selected option's value in single mode ("" for none), or the selected values in multiple mode. */
    value?: Mode extends "multiple" ? string[] : string;
    /** The starting value when uncontrolled.
     * @default "" or [] */
    defaultValue?: Mode extends "multiple" ? string[] : string;
    /** Called with the new value: a string in single mode, the selected values in the options' order in multiple mode. */
    onChange?(value: Mode extends "multiple" ? string[] : string): void;
    /** Keeps at least one option selected: choosing the selected option again doesn't clear it.
     * @default false */
    disallowEmptySelection?: boolean;
    /** Shown in the list when there are no options.
     * @default "No options" */
    emptyMessage?: ReactNode;
    /** Scrolls the options past this height, e.g. 240 or "40vh". */
    maxHeight?: number | string;
    /** md rows are 36px; sm rows are 32px with 12px text, like a small Select's list.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows the list as wrong: a red border, and a red halo when focused. Also sets aria-invalid. Field passes it.
     * @default false */
    isInvalid?: boolean;
    /** The options can be moved through and read, but the selection can't change.
     * @default false */
    isReadOnly?: boolean;
    /** Fades the list and takes it out of the tab order.
     * @default false */
    disabled?: boolean;
    id?: string;
    /** Names the list for screen readers when it isn't in a Field. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    className?: string;
}

/** ListBox's props. `value`, `defaultValue` and `onChange` take a string in single mode and an array in multiple mode. */
export interface ListBoxProps extends ListBoxModeProps<ListBoxSelectionMode> {}
