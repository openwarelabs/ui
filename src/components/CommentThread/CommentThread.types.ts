import type { Key, ReactNode } from "react";

export interface CommentAuthor {
    /** Shown in the header, and matched against `currentUser` to decide whose comments have Edit and Delete. */
    name: string;
    /** A photo URL; the initials show without one. */
    avatar?: string;
    /** Makes the name a link, to a profile say. */
    href?: string;
}

export interface CommentReaction {
    /** The emoji itself: "👍". */
    emoji: string;
    /** How many people reacted with it. */
    count: number;
    /** Whether the current user is one of them; the pill shows pressed.
     * @default false */
    reacted?: boolean;
}

export interface Comment {
    /** Unique. */
    id: Key;
    author: CommentAuthor;
    /** The comment. A string is Markdown, rendered by the Markdown component; anything else is shown as given. */
    body: ReactNode;
    /** When it was posted, as a Date or an ISO string. */
    createdAt: Date | string;
    /** When it was last changed; the header then says "edited". */
    editedAt?: Date | string;
    /** The comment it replies to. Without one it's at the top level. */
    parentId?: Key;
    /** Its reactions, in the order to show them. */
    reactions?: CommentReaction[];
    /** It's on its way to the server: shown faded, with "Posting…" and no actions.
     * @default false */
    pending?: boolean;
    /** It was removed: the body says so and the actions go, but its replies stay in place.
     * @default false */
    deleted?: boolean;
}

export interface CommentThreadLabels {
    /** @default "Reply" */
    reply?: string;
    /** @default "Edit" */
    edit?: string;
    /** @default "Delete" */
    delete?: string;
    /** The button that opens the emoji picker.
     * @default "React" */
    react?: string;
    /** Names the emoji picker for screen readers.
     * @default "Pick a reaction" */
    reactions?: string;
    /** A reaction pill's name for screen readers.
     * @default (emoji, count) => `${emoji}, ${count}` */
    reaction?(emoji: string, count: number): string;
    /** The button that opens Edit and Delete.
     * @default "More actions" */
    more?: string;
    /** @default "Cancel" */
    cancel?: string;
    /** The reply composer's submit button.
     * @default "Reply" */
    submitReply?: string;
    /** The edit composer's submit button.
     * @default "Save" */
    submitEdit?: string;
    /** The reply box's placeholder, and its name for screen readers.
     * @default "Write a reply" */
    replyPlaceholder?: string;
    /** The edit box's name for screen readers.
     * @default "Edit your comment" */
    editPlaceholder?: string;
    /** Above a reply that sits at `maxDepth` rather than under its parent, naming who it answers.
     * @default (name) => `Replying to @${name}` */
    replyingTo?(name: string): string;
    /** After the time of a changed comment.
     * @default "edited" */
    edited?: string;
    /** In place of a deleted comment's body.
     * @default "This comment was deleted" */
    deleted?: string;
    /** After the time of a comment still being posted.
     * @default "Posting…" */
    pending?: string;
    /** The button that opens a closed chain of replies.
     * @default (count) => count === 1 ? "1 reply" : `${count} replies` */
    showReplies?(count: number): string;
    /** The button that closes it again.
     * @default "Hide replies" */
    hideReplies?: string;
    /** Shown when there are no comments.
     * @default "No comments yet" */
    empty?: string;
    /** Read out after a reply goes through.
     * @default "Reply posted" */
    replyPosted?: string;
    /** Read out after an edit goes through.
     * @default "Comment updated" */
    commentUpdated?: string;
    /** Read out after a comment is deleted.
     * @default "Comment deleted" */
    commentDeleted?: string;
    /** Names a comment for screen readers.
     * @default (name) => `Comment by ${name}` */
    commentBy?(name: string): string;
    /** Names a list of replies for screen readers.
     * @default (name) => `Replies to ${name}` */
    repliesTo?(name: string): string;
}

export interface CommentThreadProps {
    /** Every comment as one flat list, in the order to show them; a reply is nested under its `parentId`. */
    comments: Comment[];
    /** Who's reading. Their name decides whose comments have Edit and Delete, unless `canEdit` or `canDelete` say otherwise. */
    currentUser?: CommentAuthor;
    /** How deep replies nest. Deeper ones sit at this level, with "Replying to @name" above them.
     * @default 3 */
    maxDepth?: number;
    /** Starts each chain of replies closed, under a "3 replies" button.
     * @default false */
    collapsible?: boolean;
    /** Draws a comment's body yourself. Without it, a string is Markdown and anything else is shown as given. */
    renderBody?(comment: Comment): ReactNode;
    /** Formats a comment's time. Without it, "2 hr ago" with the full date on hover. */
    formatTime?(date: Date): ReactNode;
    /** The locale for the times, such as "en-GB". Defaults to the browser's. */
    locale?: string;
    /** Shows Reply on each comment and takes the reply. Return a promise and the button shows loading until it settles. */
    onReply?(parentId: Key, body: string): void | Promise<void>;
    /** Shows Edit, on comments `canEdit` allows, and takes the new body. A promise shows loading until it settles. */
    onEdit?(id: Key, body: string): void | Promise<void>;
    /** Shows Delete, on comments `canDelete` allows. */
    onDelete?(id: Key): void | Promise<void>;
    /** Shows the reaction picker and makes the pills toggle. Called with the emoji pressed. */
    onReact?(id: Key, emoji: string): void | Promise<void>;
    /** The emoji in the picker.
     * @default ["👍", "❤️", "🎉", "🤔"] */
    reactionOptions?: string[];
    /** Whether a comment may be edited.
     * @default (comment) => comment.author.name === currentUser?.name */
    canEdit?(comment: Comment): boolean;
    /** Whether a comment may be deleted.
     * @default (comment) => comment.author.name === currentUser?.name */
    canDelete?(comment: Comment): boolean;
    /** comfortable for a discussion; compact for a sidebar or a review, with smaller avatars and less space.
     * @default "comfortable" */
    density?: "comfortable" | "compact";
    /** Names the thread for screen readers.
     * @default "Comments" */
    label?: string;
    /** The words it uses, for other languages. */
    labels?: CommentThreadLabels;
    className?: string;
}

/** A comment with its replies, as the thread nests them. Internal. */
export interface CommentNode {
    comment: Comment;
    replies: CommentNode[];
    /** The author of the comment it answers, when it sits at `maxDepth` rather than under its parent. */
    replyingTo?: string;
}

/** What every comment in the thread reads. Internal. */
export interface CommentThreadContextValue {
    labels: Required<CommentThreadLabels>;
    collapsible: boolean;
    density: "comfortable" | "compact";
    reactionOptions: string[];
    now: number;
    locale?: string;
    renderBody?(comment: Comment): ReactNode;
    formatTime?(date: Date): ReactNode;
    onReply?(parentId: Key, body: string): void | Promise<void>;
    onEdit?(id: Key, body: string): void | Promise<void>;
    onDelete?(id: Key): void | Promise<void>;
    onReact?(id: Key, emoji: string): void | Promise<void>;
    canEdit(comment: Comment): boolean;
    canDelete(comment: Comment): boolean;
    announce(message: string): void;
}

/** The small box for a reply or an edit. Internal. */
export interface CommentComposerProps {
    /** The text to start with: a comment's body when editing it. */
    initialValue?: string;
    /** Names the box for screen readers and is its placeholder. */
    placeholder: string;
    submitLabel: string;
    cancelLabel: string;
    onSubmit(body: string): void | Promise<void>;
    onCancel(): void;
}

/** A part of a comment that reads the comment itself: its reactions, its picker. Internal. */
export interface CommentPartProps {
    comment: Comment;
}

/** The comment's time. Internal. */
export interface CommentTimeProps {
    time: Date | string;
}

/** One comment and the list of its replies. Internal. */
export interface CommentItemProps {
    node: CommentNode;
    depth: number;
}
