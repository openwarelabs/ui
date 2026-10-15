import type { TextVariant } from "../Text/Text";

export interface InlineEditLabels {
    /** Names the text's button, given `label`. @default (label) => `Edit ${label.toLowerCase()}` */
    edit?(label: string): string;
    /** The Save button, with `showActions`. @default "Save" */
    save?: string;
    /** The Cancel button, with `showActions`. @default "Cancel" */
    cancel?: string;
    /** Read out while a slow `onSave` runs. @default "Saving" */
    saving?: string;
    /** Shown when a `required` value is left empty. @default "This can't be empty." */
    required?: string;
    /** Shown when `onSave` fails without a message of its own. @default "Couldn't save. Try again." */
    failed?: string;
}

export interface InlineEditProps {
    /** The text, when you control it. Update it in `onSave`. */
    value?: string;
    /** The text at first, when it keeps the text itself.
     * @default "" */
    defaultValue?: string;
    /**
     * Called with the new text when people save a change (not when they save it unchanged). Return a Promise to keep
     * the editor open, showing that it's saving, until it settles; if it rejects or throws, its message is shown and
     * the editor stays open to try again.
     */
    onSave?(value: string): void | Promise<unknown>;
    /** Called when people cancel an edit, with Escape, the Cancel button or, without `saveOnBlur`, by leaving it. */
    onCancel?(): void;
    /** What the text is, such as "Project name": the editor's name, and the button's ("Edit project name"). Required. */
    label: string;
    /** Shown, muted, when the text is empty, and in the empty editor.
     * @default label */
    placeholder?: string;
    /** Edits in a Textarea that grows with the text: Enter adds a line, and Ctrl+Enter or ⌘Enter saves.
     * @default false */
    multiline?: boolean;
    /** Checks the text before it's saved; return a message to show instead of saving, or undefined when it's fine. */
    validate?(value: string): string | undefined;
    /** Refuses to save empty text (or only spaces), with `labels.required`.
     * @default false */
    required?: boolean;
    /** The most characters it takes. */
    maxLength?: number;
    /** A Text style for the text and the editor, so it can be a heading or a caption. Left out, it takes the font around it. */
    textVariant?: TextVariant;
    /** Leaving the editor saves. When false, leaving it cancels.
     * @default true */
    saveOnBlur?: boolean;
    /** Shows Save and Cancel buttons beside the editor.
     * @default false */
    showActions?: boolean;
    /** Whether it's editing, when you control it. */
    editing?: boolean;
    /** Whether it starts out editing, when it controls that itself.
     * @default false */
    defaultEditing?: boolean;
    /** Called when it starts or stops editing. */
    onEditingChange?(editing: boolean): void;
    /** Selects all the text when the editor opens, to type over it. Otherwise the caret goes at the end.
     * @default false */
    selectOnFocus?: boolean;
    /** Shows the text dimmed, and it can't be edited or focused.
     * @default false */
    disabled?: boolean;
    /** Shows the text plainly, as text, with nothing to click.
     * @default false */
    readOnly?: boolean;
    /** The words it uses, for other languages. */
    labels?: InlineEditLabels;
    /** The display button's id. */
    id?: string;
    className?: string;
}
