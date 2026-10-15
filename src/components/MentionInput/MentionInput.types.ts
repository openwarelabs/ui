import type { KeyboardEvent, ReactNode, RefCallback } from "react";

export interface MentionOption {
    /** Identifies what was picked, in `mentions`: a user id, a command name. */
    id: string;
    /** The text shown in the list, matched as people type, and put in the text after the trigger: "@Ada Lovelace". */
    label: string;
    /** A muted line under the label in the list; matched too when it's a string. */
    description?: ReactNode;
    /** A small icon or avatar before the label. */
    icon?: ReactNode;
    disabled?: boolean;
}

export interface MentionTrigger {
    /** What opens the list when it's typed at the start of a word: "@", "/", "#". */
    char: string;
    /**
     * What to suggest. A list is filtered by what's typed after the trigger. A function gets that text and returns
     * the options to show, itself or in a promise (to search a server); the list shows a spinner while it waits.
     */
    options: MentionOption[] | ((query: string) => MentionOption[] | Promise<MentionOption[]>);
    /** Called after an option is put in the text. */
    onSelect?(option: MentionOption): void;
    /** Draws an option's row in the list in place of its icon, label and description. */
    render?(option: MentionOption): ReactNode;
    /** Names the list for screen readers while this trigger has it open, such as "People".
     * @default labels.suggestions */
    label?: string;
}

/** A mention in the text, found from the options picked (and every option of a trigger with a list). */
export interface Mention {
    /** The option's id. */
    id: string;
    label: string;
    /** The trigger it was typed with: "@". */
    trigger: string;
    /** Where it starts in the text, at the trigger. */
    start: number;
    /** Where it ends, after the label. */
    end: number;
}

/** The words it uses, for other languages. */
export interface MentionLabels {
    /** Names the list when its trigger has no `label`. @default "Suggestions" */
    suggestions?: string;
    /** Shown and read out while options load. @default "Loading…" */
    loading?: string;
    /** Shown and read out when nothing matches. @default "No matches" */
    empty?: string;
    /** Read out with the number of options. @default (count) => `${count} results` */
    results?(count: number): string;
}

export interface UseMentionsOptions {
    triggers: MentionTrigger[];
    /** The text, when you control it, so `mentions` follows changes made from outside (clearing it after a send).
     * Without it, the hook reads the text box as people type. */
    value?: string;
    /** Called with the mentions in the text when they change. */
    onMentionsChange?(mentions: Mention[]): void;
    /** Turns the suggestions off.
     * @default false */
    disabled?: boolean;
    /** The list's rows: md 36px, sm 32px.
     * @default "md" */
    size?: "sm" | "md";
    labels?: MentionLabels;
}

export interface UseMentionsResult {
    /** Put on the text box: a <textarea> or <input>, a Textarea, an Input, or PromptInput (its ref is the textarea). */
    ref: RefCallback<HTMLTextAreaElement | HTMLInputElement>;
    /** Render it anywhere, such as right after the text box: the floating list and its live region. */
    list: ReactNode;
    /** The mentions in the text, in order. */
    mentions: Mention[];
    /** Whether the list is open. */
    isOpen: boolean;
}

export interface MentionInputProps {
    /** The characters that open suggestions, with their options. */
    triggers: MentionTrigger[];
    /** The text, when you control it. */
    value?: string;
    /** The text at first, when it controls it itself.
     * @default "" */
    defaultValue?: string;
    /** Called with the text on every change. */
    onChange?(value: string): void;
    /** Called with the mentions in the text when they change: each one's id, label, trigger and place. */
    onMentionsChange?(mentions: Mention[]): void;
    /** A Textarea that grows with its text, in place of a one-line Input.
     * @default false */
    multiline?: boolean;
    /** The rows a multiline box shows when it's empty.
     * @default 3 */
    rows?: number;
    /** The tallest a multiline box grows before it scrolls. A number is pixels.
     * @default 180 */
    maxHeight?: number | string;
    placeholder?: string;
    /** The text box and the list: sm 32px for toolbars, md 40px in forms. A multiline box keeps its own size.
     * @default "md" */
    size?: "sm" | "md";
    /** Shows the field as wrong. Field sets it when there's an error.
     * @default false */
    isInvalid?: boolean;
    /** @default false */
    disabled?: boolean;
    /** Submits the text under this name, so a Form or a plain form sends it. */
    name?: string;
    /** The text box's id, which a Field's label points at. */
    id?: string;
    autoFocus?: boolean;
    /** Called for each key the open list doesn't take, such as Enter to send while it's closed. */
    onKeyDown?(event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>): void;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    labels?: MentionLabels;
    className?: string;
}

/** The trigger being typed: which one, where it starts, and the text after it. Internal. */
export interface MentionMatch {
    trigger: MentionTrigger;
    start: number;
    query: string;
}
