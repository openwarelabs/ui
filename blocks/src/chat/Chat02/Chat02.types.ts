import type { HTMLAttributes, ReactNode } from "react";

import type { PromptAttachment } from "@openwarelabs/ui";

/** One choice in a picker. */
export interface Chat02PickerOption {
    /** What the picker's value becomes. */
    value: string;
    /** Its name, in the menu and on the picker's button once chosen. */
    label: string;
    /** A caption under the name in the menu: what it's for. */
    description?: ReactNode;
}

/** A ghost button in the box's toolbar that opens a menu of choices, the chosen one ticked: a project, a model. */
export interface Chat02Picker {
    /** Unique among the pickers; the key of its choice in the sent message's `choices`. */
    id: string;
    /** What's being chosen: the menu's heading and the button's name for screen readers. */
    label: string;
    /** A 14px icon before the chosen value, usually from lucide-react. Hidden on phones. */
    icon?: ReactNode;
    /** Its choices. */
    options: Chat02PickerOption[];
    /** The chosen value, when you keep it yourself. */
    value?: string;
    /** The value chosen to start with. @default the first option's */
    defaultValue?: string;
    /** Called with the new value when it's chosen. */
    onChange?(value: string): void;
}

/** An idea to start from, under the box: choosing it puts its words in the box. */
export interface Chat02Suggestion {
    /** The words it puts in the box. */
    label: string;
    /** A 16px icon before them, usually from lucide-react. */
    icon?: ReactNode;
}

/** What's sent: the words, the files attached and what each picker is set to. */
export interface Chat02Message {
    /** The task, trimmed. */
    text: string;
    /** The files attached to it. */
    attachments: PromptAttachment[];
    /** Each picker's value, by its id. */
    choices: Record<string, string>;
}

export interface Chat02Labels {
    /** The box's placeholder. @default "Describe the task…" */
    placeholder?: string;
    /** Names the box for screen readers. @default "Task for the agent" */
    input?: string;
    /** A muted line under the box. @default how to send, start a new line and attach files */
    hint?: ReactNode;
    /** Names the ideas for screen readers. @default "Ideas to start from" */
    suggestions?: string;
}

export interface Chat02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The question over the box, as the section's heading. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** Pickers in the box's toolbar, after the paperclip. */
    pickers?: Chat02Picker[];
    /** Files attached to start with. The person can attach more with the paperclip, or by dropping or pasting them. */
    defaultAttachments?: PromptAttachment[];
    /** Ideas to start from, under the box. */
    suggestions?: Chat02Suggestion[];
    /** Called with the message when the person sends it. The box then clears, and its attachments with it. */
    onSend?(message: Chat02Message): void;
    /** Words that aren't content (the box's placeholder, names for screen readers), in English unless you pass your own. */
    labels?: Chat02Labels;
}
