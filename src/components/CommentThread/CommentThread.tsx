import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type Key, type KeyboardEvent } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { Markdown } from "@/components/Markdown/Markdown";
import { Menu, MenuItem } from "@/components/Menu/Menu";
import { Popover } from "@/components/Popover/Popover";
import { Textarea } from "@/components/Textarea/Textarea";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import { EllipsisIcon, PencilIcon, ReplyIcon, SmilePlusIcon, TrashIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type {
    Comment,
    CommentComposerProps,
    CommentItemProps,
    CommentNode,
    CommentPartProps,
    CommentThreadContextValue,
    CommentThreadLabels,
    CommentThreadProps,
    CommentTimeProps,
} from "./CommentThread.types";

export type { Comment, CommentAuthor, CommentReaction, CommentThreadLabels, CommentThreadProps } from "./CommentThread.types";

const defaultLabels: Required<CommentThreadLabels> = {
    reply: "Reply",
    edit: "Edit",
    delete: "Delete",
    react: "React",
    reactions: "Pick a reaction",
    reaction: (emoji, count) => `${emoji}, ${count}`,
    more: "More actions",
    cancel: "Cancel",
    submitReply: "Reply",
    submitEdit: "Save",
    replyPlaceholder: "Write a reply",
    editPlaceholder: "Edit your comment",
    replyingTo: (name) => `Replying to @${name}`,
    edited: "edited",
    deleted: "This comment was deleted",
    pending: "Posting…",
    showReplies: (count) => (count === 1 ? "1 reply" : `${count} replies`),
    hideReplies: "Hide replies",
    empty: "No comments yet",
    replyPosted: "Reply posted",
    commentUpdated: "Comment updated",
    commentDeleted: "Comment deleted",
    commentBy: (name) => `Comment by ${name}`,
    repliesTo: (name) => `Replies to ${name}`,
};

const defaultReactions = ["👍", "❤️", "🎉", "🤔"];

const CommentThreadContext = createContext<CommentThreadContextValue | null>(null);

const root = "\u0000root";

/**
 * Nests a flat list by `parentId`. Replies nest down to `maxDepth`; anything deeper sits at that level, after the
 * comment it answers, marked with who that was. A comment whose parent isn't in the list is treated as top level.
 */
function nest(comments: Comment[], maxDepth: number): CommentNode[] {
    const ids = new Set(comments.map((comment) => String(comment.id)));
    const children = new Map<string, Comment[]>();
    for (const comment of comments) {
        const key = comment.parentId !== undefined && ids.has(String(comment.parentId)) ? String(comment.parentId) : root;
        const list = children.get(key);
        if (list) list.push(comment);
        else children.set(key, [comment]);
    }
    const flatten = (parent: Comment, list: CommentNode[]) => {
        for (const comment of children.get(String(parent.id)) ?? []) {
            list.push({ comment, replies: [], replyingTo: parent.author.name });
            flatten(comment, list);
        }
    };
    const place = (key: string, list: CommentNode[], depth: number) => {
        for (const comment of children.get(key) ?? []) {
            const node: CommentNode = { comment, replies: [] };
            list.push(node);
            if (depth < maxDepth) place(String(comment.id), node.replies, depth + 1);
            else flatten(comment, list);
        }
    };
    const nodes: CommentNode[] = [];
    place(root, nodes, 0);
    return nodes;
}

/** How many comments a node's replies hold, nested ones included. */
function countReplies(node: CommentNode): number {
    return node.replies.reduce((total, reply) => total + 1 + countReplies(reply), 0);
}

/** The time now, again every minute, so "5m ago" keeps up while the thread is on screen. */
function useNow() {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => window.clearInterval(timer);
    }, []);
    return now;
}

const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
];

const formatters = new Map<string, { relative: Intl.RelativeTimeFormat; full: Intl.DateTimeFormat }>();

function formattersFor(locale: string | undefined) {
    const key = locale ?? "";
    let entry = formatters.get(key);
    if (!entry) {
        entry = {
            relative: new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" }),
            full: new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }),
        };
        formatters.set(key, entry);
    }
    return entry;
}

/** "2h ago", "yesterday", "3w ago"; under a minute, "now". */
function relativeTime(date: Date, now: number, relative: Intl.RelativeTimeFormat): string {
    const seconds = Math.round((date.getTime() - now) / 1000);
    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit);
    }
    return relative.format(0, "second");
}

function CommentTime({ time }: CommentTimeProps) {
    const { now, locale, formatTime } = useContext(CommentThreadContext)!;
    const date = typeof time === "string" ? new Date(time) : time;
    if (Number.isNaN(date.getTime())) return <span className="ow-comment__time">{String(time)}</span>;
    if (formatTime) {
        return (
            <time className="ow-comment__time" dateTime={date.toISOString()}>
                {formatTime(date)}
            </time>
        );
    }
    const { relative, full } = formattersFor(locale);
    return (
        <time className="ow-comment__time" dateTime={date.toISOString()} title={full.format(date)}>
            {relativeTime(date, now, relative)}
        </time>
    );
}

/** The box for a reply or an edit: Ctrl or Cmd+Enter sends it, Escape cancels, and the button waits on a promise. */
function CommentComposer({ initialValue = "", placeholder, submitLabel, cancelLabel, onSubmit, onCancel }: CommentComposerProps) {
    const [value, setValue] = useState(initialValue);
    const [busy, setBusy] = useState(false);
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    const submit = async () => {
        const body = value.trim();
        if (!body || busy) return;
        setBusy(true);
        try {
            await onSubmit(body);
        } finally {
            if (alive.current) setBusy(false);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void submit();
        } else if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
        }
    };

    return (
        <form
            className="ow-comment__composer"
            onSubmit={(event) => {
                event.preventDefault();
                void submit();
            }}
        >
            <Textarea
                autoGrow
                autoFocus
                rows={2}
                value={value}
                placeholder={placeholder}
                aria-label={placeholder}
                disabled={busy}
                className="ow-comment__textarea"
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={onKeyDown}
            />
            <div className="ow-comment__composer-actions">
                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
                    {cancelLabel}
                </Button>
                <Button type="submit" variant="primary" size="sm" loading={busy} disabled={!value.trim()}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}

function CommentReactions({ comment }: CommentPartProps) {
    const { labels, onReact } = useContext(CommentThreadContext)!;
    const reactions = comment.reactions?.filter((reaction) => reaction.count > 0) ?? [];
    if (!reactions.length) return null;
    return (
        <div className="ow-comment__reactions">
            {reactions.map((reaction) =>
                onReact ? (
                    <button
                        key={reaction.emoji}
                        type="button"
                        className={cx("ow-comment__reaction", reaction.reacted && "ow-comment__reaction--pressed")}
                        aria-pressed={Boolean(reaction.reacted)}
                        aria-label={labels.reaction(reaction.emoji, reaction.count)}
                        onClick={() => void onReact(comment.id, reaction.emoji)}
                    >
                        <span aria-hidden="true">{reaction.emoji}</span>
                        <span aria-hidden="true">{reaction.count}</span>
                    </button>
                ) : (
                    <span
                        key={reaction.emoji}
                        className={cx("ow-comment__reaction", reaction.reacted && "ow-comment__reaction--pressed")}
                        aria-label={labels.reaction(reaction.emoji, reaction.count)}
                        role="img"
                    >
                        <span aria-hidden="true">{reaction.emoji}</span>
                        <span aria-hidden="true">{reaction.count}</span>
                    </span>
                ),
            )}
        </div>
    );
}

function ReactionPicker({ comment }: CommentPartProps) {
    const { labels, reactionOptions, onReact } = useContext(CommentThreadContext)!;
    const [open, setOpen] = useState(false);
    const reacted = new Set(comment.reactions?.filter((reaction) => reaction.reacted).map((reaction) => reaction.emoji));
    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            aria-label={labels.reactions}
            width="auto"
            className="ow-comment__picker"
            trigger={
                <Button variant="ghost" size="sm" iconOnly aria-label={labels.react} className="ow-comment__action">
                    <SmilePlusIcon size={16} />
                </Button>
            }
        >
            <div className="ow-comment__picker-row">
                {reactionOptions.map((emoji) => (
                    <button
                        key={emoji}
                        type="button"
                        className="ow-comment__emoji"
                        aria-pressed={reacted.has(emoji)}
                        onClick={() => {
                            setOpen(false);
                            void onReact?.(comment.id, emoji);
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </Popover>
    );
}

function CommentItem({ node, depth }: CommentItemProps) {
    const { comment, replies, replyingTo } = node;
    const { labels, collapsible, density, renderBody, onReply, onEdit, onDelete, onReact, canEdit, canDelete, announce } =
        useContext(CommentThreadContext)!;
    const id = useId();
    const [mode, setMode] = useState<"idle" | "reply" | "edit">("idle");
    const [open, setOpen] = useState(!collapsible);
    const [deleting, setDeleting] = useState(false);
    const replyButton = useRef<HTMLButtonElement>(null);
    const moreButton = useRef<HTMLButtonElement>(null);
    // A deleted comment may be gone from the list before its promise settles.
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    const { author, deleted = false, pending = false } = comment;
    const editable = Boolean(onEdit) && canEdit(comment);
    const deletable = Boolean(onDelete) && canDelete(comment);
    const showActions = !deleted && !pending && mode !== "edit" && (onReply || onReact || editable || deletable);
    const total = countReplies(node);

    const close = (focus: HTMLElement | null) => {
        setMode("idle");
        focus?.focus();
    };

    const body = deleted ? (
        <p className="ow-comment__deleted">{labels.deleted}</p>
    ) : mode === "edit" ? (
        <CommentComposer
            initialValue={typeof comment.body === "string" ? comment.body : ""}
            placeholder={labels.editPlaceholder}
            submitLabel={labels.submitEdit}
            cancelLabel={labels.cancel}
            onCancel={() => close(moreButton.current)}
            onSubmit={async (text) => {
                await onEdit?.(comment.id, text);
                close(moreButton.current);
                announce(labels.commentUpdated);
            }}
        />
    ) : (
        <div className="ow-comment__body">{renderBody ? renderBody(comment) : typeof comment.body === "string" ? <Markdown size="chat">{comment.body}</Markdown> : comment.body}</div>
    );

    return (
        <li className="ow-comment-thread__item" data-depth={depth}>
            <article
                id={id}
                className={cx("ow-comment", pending && "ow-comment--pending", deleted && "ow-comment--deleted")}
                aria-label={labels.commentBy(author.name)}
                aria-busy={pending || deleting || undefined}
            >
                <div className="ow-comment__avatar">
                    <Avatar name={author.name} src={author.avatar} size={density === "compact" ? "sm" : "md"} />
                </div>
                <div className="ow-comment__main">
                    {replyingTo ? <div className="ow-comment__context">{labels.replyingTo(replyingTo)}</div> : null}
                    <div className="ow-comment__header">
                        <span className="ow-comment__name">
                            {author.href ? (
                                <a className="ow-comment__link" href={author.href}>
                                    {author.name}
                                </a>
                            ) : (
                                author.name
                            )}
                        </span>
                        <CommentTime time={comment.createdAt} />
                        {comment.editedAt && !deleted ? <span className="ow-comment__meta">{labels.edited}</span> : null}
                        {pending ? <span className="ow-comment__meta">{labels.pending}</span> : null}
                    </div>
                    {body}
                    {!deleted ? <CommentReactions comment={comment} /> : null}
                    {showActions ? (
                        <div className="ow-comment__actions">
                            {onReply ? (
                                <Button
                                    ref={replyButton}
                                    variant="ghost"
                                    size="sm"
                                    className="ow-comment__action"
                                    startIcon={<ReplyIcon size={16} />}
                                    aria-expanded={mode === "reply"}
                                    onClick={() => setMode(mode === "reply" ? "idle" : "reply")}
                                >
                                    {labels.reply}
                                </Button>
                            ) : null}
                            {onReact ? (
                                <Tooltip label={labels.react}>
                                    <ReactionPicker comment={comment} />
                                </Tooltip>
                            ) : null}
                            {editable || deletable ? (
                                <Tooltip label={labels.more}>
                                    <Menu
                                        label={labels.more}
                                        align="end"
                                        trigger={
                                            <Button ref={moreButton} variant="ghost" size="sm" iconOnly aria-label={labels.more} className="ow-comment__action">
                                                <EllipsisIcon size={16} />
                                            </Button>
                                        }
                                    >
                                        {editable ? (
                                            <MenuItem icon={<PencilIcon size={15} />} onSelect={() => setMode("edit")}>
                                                {labels.edit}
                                            </MenuItem>
                                        ) : null}
                                        {deletable ? (
                                            <MenuItem
                                                destructive
                                                icon={<TrashIcon size={15} />}
                                                onSelect={async () => {
                                                    setDeleting(true);
                                                    try {
                                                        await onDelete?.(comment.id);
                                                        announce(labels.commentDeleted);
                                                    } finally {
                                                        if (alive.current) setDeleting(false);
                                                    }
                                                }}
                                            >
                                                {labels.delete}
                                            </MenuItem>
                                        ) : null}
                                    </Menu>
                                </Tooltip>
                            ) : null}
                        </div>
                    ) : null}
                    {mode === "reply" ? (
                        <CommentComposer
                            placeholder={labels.replyPlaceholder}
                            submitLabel={labels.submitReply}
                            cancelLabel={labels.cancel}
                            onCancel={() => close(replyButton.current)}
                            onSubmit={async (text) => {
                                await onReply?.(comment.id, text);
                                close(replyButton.current);
                                setOpen(true);
                                announce(labels.replyPosted);
                            }}
                        />
                    ) : null}
                </div>
            </article>
            {replies.length ? (
                <div className="ow-comment-thread__replies-wrap">
                    {collapsible ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="ow-comment-thread__toggle"
                            aria-expanded={open}
                            aria-controls={`${id}-replies`}
                            onClick={() => setOpen(!open)}
                        >
                            {open ? labels.hideReplies : labels.showReplies(total)}
                        </Button>
                    ) : null}
                    {open ? (
                        <ul id={`${id}-replies`} className="ow-comment-thread__replies" aria-label={labels.repliesTo(author.name)}>
                            {replies.map((reply) => (
                                <CommentItem key={reply.comment.id} node={reply} depth={depth + 1} />
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </li>
    );
}

/**
 * A discussion: comments with their replies nested under them, each with its author, time and reactions, and Reply,
 * React, Edit and Delete for the callbacks you give. Comments come as one flat list and nest by `parentId`.
 */
export function CommentThread({
    comments,
    currentUser,
    maxDepth = 3,
    collapsible = false,
    renderBody,
    formatTime,
    locale,
    onReply,
    onEdit,
    onDelete,
    onReact,
    reactionOptions = defaultReactions,
    canEdit,
    canDelete,
    density = "comfortable",
    label = "Comments",
    labels: labelsProp,
    className,
}: CommentThreadProps) {
    const labels = useMemo(() => ({ ...defaultLabels, ...labelsProp }), [labelsProp]);
    const now = useNow();
    const nodes = useMemo(() => nest(comments, maxDepth), [comments, maxDepth]);
    const [message, setMessage] = useState("");
    const frame = useRef(0);

    const announce = useCallback((text: string) => {
        // Cleared first, so the same words read out a second time.
        setMessage("");
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => setMessage(text));
    }, []);
    useEffect(() => () => cancelAnimationFrame(frame.current), []);

    const own = useCallback((comment: Comment) => currentUser !== undefined && comment.author.name === currentUser.name, [currentUser]);

    const context = useMemo<CommentThreadContextValue>(
        () => ({
            labels,
            collapsible,
            density,
            reactionOptions,
            now,
            locale,
            renderBody,
            formatTime,
            onReply,
            onEdit,
            onDelete,
            onReact,
            canEdit: canEdit ?? own,
            canDelete: canDelete ?? own,
            announce,
        }),
        [labels, collapsible, density, reactionOptions, now, locale, renderBody, formatTime, onReply, onEdit, onDelete, onReact, canEdit, canDelete, own, announce],
    );

    return (
        <CommentThreadContext.Provider value={context}>
            <div className={cx("ow-comment-thread", `ow-comment-thread--${density}`, className)}>
                {nodes.length ? (
                    <ul className="ow-comment-thread__list" aria-label={label}>
                        {nodes.map((node) => (
                            <CommentItem key={node.comment.id} node={node} depth={0} />
                        ))}
                    </ul>
                ) : (
                    <p className="ow-comment-thread__empty">{labels.empty}</p>
                )}
                <div className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                    {message}
                </div>
            </div>
        </CommentThreadContext.Provider>
    );
}
