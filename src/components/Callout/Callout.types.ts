import type { HTMLAttributes, ReactNode } from "react";

/** note is neutral; tip is brass; info, success, warning and danger take Alert's colours. */
export type CalloutTone = "note" | "tip" | "info" | "warning" | "danger" | "success";

/** soft is a tinted panel, outline a bordered one, bar a 3px rule down the start edge. */
export type CalloutVariant = "soft" | "outline" | "bar";

export interface CalloutProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    /** The colour and the default title and icon. note is neutral, for an aside; tip for advice; info for context; warning
     * for something to watch; danger for something that breaks or loses data; success for what works.
     * @default "note" */
    tone?: CalloutTone;
    /** The bold first line. Defaults to the tone's word: Note, Tip, Info, Warning, Danger, Success. null hides it, unless
     * the callout is collapsible, which always has one. */
    title?: ReactNode | null;
    /** Replaces the tone's icon; null hides it. */
    icon?: ReactNode | null;
    /** soft is a tinted panel; outline keeps the page's surface with a 1px border; bar is a 3px rule down the start edge,
     * like GitHub's and Obsidian's callouts.
     * @default "soft" */
    variant?: CalloutVariant;
    /** Makes the title a disclosure button that opens and closes the content.
     * @default false */
    collapsible?: boolean;
    /** Whether a collapsible callout starts open.
     * @default false */
    defaultOpen?: boolean;
    /** The element: aside for a note beside the text, div inside a component, section for a part of the page.
     * @default "aside" */
    as?: "aside" | "div" | "section" | "figure";
    /** The note's content: paragraphs, a list, a code block. */
    children?: ReactNode;
}
