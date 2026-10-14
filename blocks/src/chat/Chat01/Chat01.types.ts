import type { HTMLAttributes, ReactNode } from "react";

import type { ChatRating } from "@openwarelabs/ui";

import type { BlockMenuItem } from "@blocks/shared/shared.types";

/** One message in the thread. */
export interface Chat01Message {
    /** Unique in the thread. */
    id: string;
    /** The person's own message, or the agent's reply. */
    from: "user" | "assistant";
    /** When it was sent, shown beside the name. */
    time: Date | string;
    /** The words as plain text: what Copy copies, what Edit puts back in the box, and what a reply shows while it streams in. */
    text: string;
    /** How a reply shows, when that's more than its text: code in blocks, a pull request. */
    body?: ReactNode;
    /** `streaming` while a reply is still arriving: the box shows Stop until it's done. */
    status?: "streaming" | "done";
}

/** An idea to start from in an empty thread: choosing it puts its words in the box. */
export interface Chat01Suggestion {
    /** The words it puts in the box. */
    label: string;
    /** A 16px icon before them, usually from lucide-react. */
    icon?: ReactNode;
}

/** What an empty thread shows: a title, a line, and ideas to start from. */
export interface Chat01Empty {
    /** A 20px icon over the title, usually from lucide-react. */
    icon?: ReactNode;
    /** "Ask the Acme agent". */
    title: ReactNode;
    /** What the agent can do. */
    description?: ReactNode;
    /** Ideas to start from. */
    suggestions?: Chat01Suggestion[];
}

export interface Chat01Labels {
    /** The new chat button's name. @default "New chat" */
    newChat?: string;
    /** The menu button's name. @default "More" */
    more?: string;
    /** The menu's name for screen readers. @default "Chat" */
    menu?: string;
    /** The box's placeholder. @default "Reply to the agent…" */
    placeholder?: string;
    /** Names the box for screen readers. @default "Reply to the agent" */
    input?: string;
    /** A muted line under the box. @default how to send and start a new line */
    hint?: ReactNode;
    /** What the agent is doing while the reply hasn't started. @default "Thinking…" */
    thinking?: string;
    /** Names the ideas for screen readers. @default "Ideas to start from" */
    suggestions?: string;
}

export interface Chat01Props extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
    /** The chat's name, as the page's h1. */
    title: ReactNode;
    /** A caption under it, after a green dot: the agent and what it's working in. */
    context?: ReactNode;
    /** The messages, oldest first. */
    messages: Chat01Message[];
    /** The person, beside their messages. */
    user: { name: string; avatar?: string };
    /** The agent's name, beside its replies and while it thinks. @default "Agent" */
    agentName?: string;
    /** A line above the first message, such as the day. */
    day?: ReactNode;
    /** Shows the agent thinking, before its reply starts. */
    thinking?: boolean;
    /** Called with the text when the person sends a message. The box clears itself. */
    onSend?(text: string): void;
    /** Called by Stop while the agent is thinking or replying. */
    onStop?(): void;
    /** Shows a new chat button in the header; called when it's pressed. The box clears and takes focus. */
    onNewChat?(): void;
    /** Called when the person rates a reply. */
    onRate?(message: Chat01Message, rating: ChatRating | null): void;
    /** More actions in a menu in the header: earlier chats, a link to what the chat made. */
    menu?: BlockMenuItem[];
    /** A small heading at the top of the menu: "Earlier chats". */
    menuHeading?: ReactNode;
    /** What an empty thread shows. */
    empty?: Chat01Empty;
    /** The text in the box, when you keep it yourself. */
    draft?: string;
    /** Called with the text in the box on every change. */
    onDraftChange?(draft: string): void;
    /** The locale for the messages' times, such as "en-GB". Defaults to the browser's. */
    locale?: string;
    /** Words that aren't content (names for screen readers, the box's placeholder), in English unless you pass your own. */
    labels?: Chat01Labels;
}
