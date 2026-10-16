import { useState } from "react";

import { CommentThread, type Comment } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "CommentThread",
    category: "Data display",
    description:
        "A discussion: comments with their replies nested under them, each with its author, time and reactions, and Reply, React, Edit and Delete for the callbacks you give. Comments on a document, a ticket, a design or a pull request.",
    source: "components/CommentThread/CommentThread.tsx",
    imports: ["CommentThread"],
    props: ["CommentThreadProps", "Comment", "CommentAuthor", "CommentReaction", "CommentThreadLabels"],
    keyboard: [
        ["Tab", "Moves through each comment's name link, reaction pills and action buttons in reading order."],
        ["Ctrl or ⌘ + Enter", "In the reply or edit box, sends it."],
        ["Escape", "In the reply or edit box, cancels it and puts focus back on the button that opened it."],
        ["Arrows, Escape", "In the More menu and the emoji picker, as in Menu and Popover."],
    ],
    notes: [
        "Comments come as one flat list and nest by parentId, so the data matches what a server stores. A reply whose parent isn't in the list sits at the top level.",
        "Replies nest down to maxDepth (3 by default). A deeper reply sits at that level, after the comment it answers, with \"Replying to @name\" above it.",
        "The thread is a list of comments, each an article named by its author (\"Comment by Aoife O'Sullivan\"), with its replies in a nested list named \"Replies to Aoife O'Sullivan\".",
        "A string body is Markdown, drawn by the Markdown component at its chat size, so it's safe to render what people typed. Pass a ReactNode, or renderBody, for anything else.",
        "Times read \"2h ago\", with the full date on hover and in the <time> element's dateTime, and keep up every minute. formatTime replaces the words.",
        "Each action shows only when you give its callback. Edit and Delete show on the reader's own comments, matched by currentUser.name, unless canEdit or canDelete say otherwise. Return a promise and the Submit button shows loading until it settles; a rejection leaves the box open.",
        "Reaction pills are toggle buttons with aria-pressed; without onReact they're plain text. \"Reply posted\", \"Comment updated\" and \"Comment deleted\" are read out in a polite live region.",
        "A pending comment is faded, says \"Posting…\" and has no actions; a deleted one says so in place of its body and keeps its replies.",
    ],
    related: ["Avatar", "Timeline", "ChatMessage", "Markdown", "Textarea"],
    since: "0.18.0",
};

const me = { name: "Cian Murphy" };

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000);

const discussion: Comment[] = [
    {
        id: "c1",
        author: { name: "Aoife O'Sullivan", href: "#aoife" },
        body: "The new **pricing page** reads well. One thing: the annual toggle defaults to monthly, so the headline price looks higher than the one we quote in sales decks.",
        createdAt: ago(60 * 26),
        reactions: [
            { emoji: "👍", count: 3, reacted: true },
            { emoji: "🤔", count: 1 },
        ],
    },
    {
        id: "c2",
        parentId: "c1",
        author: { name: "Cian Murphy" },
        body: "Good catch. Most visitors land from the monthly ads, though, so I'd rather keep monthly first and make the annual saving louder.",
        createdAt: ago(60 * 23),
        editedAt: ago(60 * 22),
        reactions: [{ emoji: "👍", count: 1 }],
    },
    {
        id: "c3",
        parentId: "c2",
        author: { name: "Niamh Byrne", href: "#niamh" },
        body: "Could we remember the choice? A `localStorage` key would do it:\n\n```ts\nlocalStorage.setItem(\"billing\", \"annual\");\n```",
        createdAt: ago(60 * 20),
    },
    {
        id: "c4",
        parentId: "c3",
        author: { name: "Aoife O'Sullivan", href: "#aoife" },
        body: "Yes, and default to annual for anyone arriving from the sales deck link.",
        createdAt: ago(60 * 19),
        reactions: [{ emoji: "🎉", count: 2 }],
    },
    {
        id: "c5",
        parentId: "c4",
        author: { name: "Saoirse Doyle" },
        body: "I'll add a `?billing=annual` parameter to the deck links today.",
        createdAt: ago(60 * 3),
    },
    {
        id: "c6",
        author: { name: "Oisín Walsh" },
        body: "Separate point: the FAQ still mentions the old 14-day trial. It's 30 days now.",
        createdAt: ago(45),
        reactions: [{ emoji: "❤️", count: 1 }],
    },
];

let nextId = 100;

/** Reactions, replies, edits and deletes, kept in state: the reader is Cian Murphy, so only his comment has Edit and Delete. */
export function Discussion() {
    const [comments, setComments] = useState(discussion);
    const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

    return (
        <CommentThread
            comments={comments}
            currentUser={me}
            onReply={async (parentId, body) => {
                await wait();
                setComments((current) => [...current, { id: `n${nextId++}`, parentId, author: me, body, createdAt: new Date() }]);
            }}
            onEdit={async (id, body) => {
                await wait();
                setComments((current) => current.map((comment) => (comment.id === id ? { ...comment, body, editedAt: new Date() } : comment)));
            }}
            onDelete={(id) => setComments((current) => current.map((comment) => (comment.id === id ? { ...comment, deleted: true } : comment)))}
            onReact={(id, emoji) =>
                setComments((current) =>
                    current.map((comment) => {
                        if (comment.id !== id) return comment;
                        const reactions = comment.reactions ?? [];
                        const existing = reactions.find((reaction) => reaction.emoji === emoji);
                        if (!existing) return { ...comment, reactions: [...reactions, { emoji, count: 1, reacted: true }] };
                        return {
                            ...comment,
                            reactions: reactions.map((reaction) =>
                                reaction.emoji === emoji
                                    ? { ...reaction, reacted: !reaction.reacted, count: reaction.count + (reaction.reacted ? -1 : 1) }
                                    : reaction,
                            ),
                        };
                    }),
                )
            }
        />
    );
}
Discussion.layout = { align: "start" as const, fill: true };

const review: Comment[] = [
    {
        id: "r1",
        author: { name: "Eoin Fitzgerald" },
        body: "Line 42: `round()` here uses banker's rounding. Is that what finance expects?",
        createdAt: ago(60 * 50),
    },
    { id: "r2", parentId: "r1", author: { name: "Clodagh Nolan" }, body: "They asked for half-up. I'll switch it.", createdAt: ago(60 * 48) },
    { id: "r3", parentId: "r2", author: { name: "Eoin Fitzgerald" }, body: "Add a test for 2.5 → 3 while you're there.", createdAt: ago(60 * 47) },
    { id: "r4", parentId: "r3", author: { name: "Clodagh Nolan" }, body: "Done, in `vat.test.ts`.", createdAt: ago(60 * 40), reactions: [{ emoji: "👍", count: 1 }] },
    {
        id: "r5",
        author: { name: "Gráinne O'Neill" },
        body: "The invoice total is off by a cent when there are three lines at €0.335.",
        createdAt: ago(60 * 5),
    },
    { id: "r6", parentId: "r5", author: { name: "Clodagh Nolan" }, body: "Rounding per line rather than on the total. Fixing.", createdAt: ago(60 * 4), pending: true },
];

/** Compact, with each chain of replies folded under a count, and replies nesting one level before they flatten. */
export function CompactCollapsible() {
    const [comments, setComments] = useState(review);
    return (
        <CommentThread
            comments={comments}
            currentUser={{ name: "Clodagh Nolan" }}
            density="compact"
            collapsible
            maxDepth={1}
            onReply={(parentId, body) =>
                setComments((current) => [...current, { id: `n${nextId++}`, parentId, author: { name: "Clodagh Nolan" }, body, createdAt: new Date() }])
            }
            onReact={(id, emoji) =>
                setComments((current) =>
                    current.map((comment) =>
                        comment.id === id
                            ? { ...comment, reactions: [{ emoji, count: 1, reacted: true }, ...(comment.reactions ?? []).filter((reaction) => reaction.emoji !== emoji)] }
                            : comment,
                    ),
                )
            }
        />
    );
}
CompactCollapsible.layout = { align: "start" as const, fill: true };

const archived: Comment[] = [
    {
        id: "a1",
        author: { name: "Declan Walsh", href: "#declan" },
        body: "Closing this thread: the rounding change shipped in 2.4.0. Thanks all.",
        createdAt: "2026-09-02T09:12:00Z",
        reactions: [
            { emoji: "🎉", count: 4 },
            { emoji: "❤️", count: 2 },
        ],
    },
    { id: "a2", parentId: "a1", author: { name: "Caoimhe Brennan" }, body: "Lovely work.", createdAt: "2026-09-02T09:30:00Z" },
    { id: "a3", parentId: "a1", author: { name: "Niamh Byrne", href: "#niamh" }, body: "", createdAt: "2026-09-02T10:02:00Z", deleted: true },
];

/** No callbacks: a closed thread to read, with reactions as plain counts and a deleted comment holding its place. */
export function ReadOnly() {
    return <CommentThread comments={archived} formatTime={(date) => date.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })} />;
}
ReadOnly.layout = { align: "start" as const, fill: true };
