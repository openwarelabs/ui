import type { ReactNode } from "react";

export interface TagInputOption {
    /** What goes in the value when it's picked. */
    value: string;
    /** The text shown in the list and on the tag, and matched as people type. */
    label: string;
    /** A muted line under the label in the list; also matched. */
    description?: ReactNode;
    disabled?: boolean;
}

/** Why a value wasn't added: `validate` refused it, it's already there, it isn't one of the options, or the field is full. */
/** An item in the suggestions: an option, or the one that adds what's typed. Internal. */
export type TagInputItem = { option: TagInputOption } | { create: string };

export type TagInputRejectReason = "invalid" | "duplicate" | "unknown" | "max";

export interface TagInputProps {
    /** The values, when you control them. */
    value?: string[];
    /** The values at first, when it controls them itself.
     * @default [] */
    defaultValue?: string[];
    /** Called with the new list when a value is added or removed. */
    onChange?(value: string[]): void;
    /** Suggestions shown in a list under the field, filtered by what's typed. Without them, it takes whatever is typed. */
    options?: TagInputOption[];
    /** With `options`, also takes values that aren't among them. Without options, it always does.
     * @default false */
    allowCustom?: boolean;
    /** Checks a typed value before it's added; return false to refuse it. The text stays in the field to fix. */
    validate?(text: string): boolean;
    /** Called when a value isn't added, with the text and why, to show a message. */
    onReject?(text: string, reason: TagInputRejectReason): void;
    /** Keeps a value that's already there (compared ignoring case) instead of refusing it.
     * @default false */
    allowDuplicates?: boolean;
    /** The most values it takes. */
    max?: number;
    /** Keys that add what's typed, besides Enter. A pasted list is split on these and on new lines.
     * @default [","] */
    separators?: string[];
    /** Called as the person types, to load options from a server. */
    onInputChange?(text: string): void;
    /** Shown while there are no values. */
    placeholder?: string;
    /** Shown in the list when nothing matches.
     * @default "No matches" */
    emptyMessage?: ReactNode;
    /** sm 32px for toolbars and settings rows, md 40px in forms; the field grows as tags wrap.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows the field as wrong, like Input. Field sets it when there's an error.
     * @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** Submits each value under this name, in a hidden input, so a Form or a plain form sends them as a list. */
    name?: string;
    /** The text box's id, which a Field's label points at. */
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    /** The words it uses, for other languages. */
    labels?: {
        /** The remove button on a tag, given its text. @default (tag) => `Remove ${tag}` */
        remove?(tag: string): string;
        /** Read out when a value is added. @default (tag) => `Added ${tag}` */
        added?(tag: string): string;
        /** Read out when a value is removed. @default (tag) => `Removed ${tag}` */
        removed?(tag: string): string;
        /** The option that adds what's typed, with `allowCustom` and options. @default (text) => `Add "${text}"` */
        create?(text: string): string;
    };
    className?: string;
}
