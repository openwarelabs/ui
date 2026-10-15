import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

import { Avatar, Button, Stack, Text, VirtualList, type VirtualListHandle } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "VirtualList",
    category: "Layout",
    description:
        "A scrolling list that renders only the rows in view, for long logs, chat histories and big datasets: 10,000 rows cost what 20 do. It loads more as you near the end, and can follow a log's newest line.",
    source: "components/VirtualList/VirtualList.tsx",
    imports: ["VirtualList", "useVirtualizer"],
    props: ["VirtualListProps", "VirtualListHandle", "VirtualListLabels", "UseVirtualizerOptions", "Virtualizer"],
    keyboard: [
        ["Tab", "Moves onto the list, then into the rows' own buttons and links."],
        ["Up or Down", "Scroll the list while it has focus."],
        ["Page Up or Page Down", "Scroll by a screen. In a feed, move focus to the previous or next article."],
        ["Home or End", "Go to the first or the last row that's loaded. In a following log, End starts following again."],
    ],
    notes: [
        'It\'s a focusable list (role="list") named by label, so the keyboard scrolls it; each row is a listitem with aria-posinset and aria-setsize, so screen readers say "item 5,001 of 10,000" though only a few rows are in the page.',
        'role="feed" suits an endless stream read one article at a time: each row is a focusable article, Page Down and Page Up move between them, and the feed is aria-busy while more load. aria-setsize is -1 while hasMore says the end isn\'t known.',
        "The tradeoff: rows out of view aren't in the page, so a screen reader's reading mode and the browser's find only reach the rows around the view. For a list of a few hundred rows or fewer, render them all in a ScrollShadow instead.",
        "The row holding focus stays rendered when it scrolls out of view, so focus is never dropped; and the spinner at the end is announced once, as Loading more.",
        "Give itemSize when every row is the same height: nothing is measured. Otherwise rows are measured as they render, and a row above the view that turns out taller than estimateSize doesn't move what you're reading.",
        "It fills its parent, so give the parent a height, or pass height or maxHeight.",
        "With getKey, rows added at the top by onStartReached (older messages) leave the view where it was. scrollToIndex and scrollToEnd on its ref scroll smoothly when asked, and at once under reduced motion.",
        "useVirtualizer is the windowing on its own: it says which rows to render and where, for a virtualized table or list box of your own.",
    ],
    related: ["ScrollShadow", "ChatConversation", "Table", "ListBox"],
    since: "0.15.0",
};

const frame: CSSProperties = {
    width: "100%",
    border: "1px solid var(--ow-border)",
    borderRadius: "var(--ow-radius-container)",
    background: "var(--ow-surface)",
};

const row: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: "100%",
    padding: "0 16px",
    borderBottom: "1px solid var(--ow-border)",
};

const regions = ["eu-west", "us-east", "ap-south", "sa-east"];

/** 10,000 rows of 40px: only those in view are in the page. The buttons scroll to any row through the ref. */
export function TenThousandRows() {
    const list = useRef<VirtualListHandle>(null);
    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Stack direction="row" gap="sm" wrap>
                <Button size="sm" variant="secondary" onClick={() => list.current?.scrollToIndex(0, { align: "start", behavior: "smooth" })}>
                    First
                </Button>
                <Button size="sm" variant="secondary" onClick={() => list.current?.scrollToIndex(4999, { align: "center" })}>
                    Go to 5,000
                </Button>
                <Button size="sm" variant="secondary" onClick={() => list.current?.scrollToEnd()}>
                    Last
                </Button>
            </Stack>
            <div style={frame}>
                <VirtualList
                    ref={list}
                    label="Servers"
                    count={10000}
                    itemSize={40}
                    height={360}
                    renderItem={(_, index) => (
                        <div style={row}>
                            <Text as="span" variant="label" style={{ fontVariantNumeric: "tabular-nums", minWidth: 56 }}>
                                {index + 1}
                            </Text>
                            <Text as="span" variant="caption" truncate style={{ flex: 1 }}>
                                server-{String(index + 1).padStart(5, "0")}.{regions[index % regions.length]}
                            </Text>
                            <Text as="span" variant="caption" tone={index % 7 === 3 ? "warning" : "success"}>
                                {index % 7 === 3 ? "Degraded" : "Healthy"}
                            </Text>
                        </div>
                    )}
                />
            </div>
        </Stack>
    );
}
TenThousandRows.layout = { fill: true };

const words = "the build passed after we pinned the version and cleared the cache so the next deploy can go out this afternoon once review is done".split(" ");
const people = ["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson"];

/** Some made-up text of a length that varies from row to row, the same every time. */
function sentence(index: number) {
    const length = 4 + ((index * 7919) % 37);
    return Array.from({ length }, (_, word) => words[(index * 31 + word * 7) % words.length]).join(" ");
}

/** Rows of any height: each is measured as it renders, from a guess of 72px. Scroll up and down; nothing jumps. */
export function VariableHeights() {
    return (
        <div style={frame}>
            <VirtualList
                label="Comments"
                count={2000}
                estimateSize={72}
                gap={4}
                height={400}
                renderItem={(_, index) => (
                    <Stack direction="row" gap="sm" style={{ padding: "10px 16px" }}>
                        <Avatar name={people[index % people.length]!} size="sm" />
                        <Stack gap="3xs" style={{ minWidth: 0 }}>
                            <Text as="span" variant="label">
                                {people[index % people.length]} · #{index + 1}
                            </Text>
                            <Text variant="copy">{sentence(index)}.</Text>
                        </Stack>
                    </Stack>
                )}
            />
        </div>
    );
}
VariableHeights.layout = { fill: true };

interface Post {
    id: number;
    title: string;
    body: string;
}

const pageSize = 20;
const lastPost = 120;

/** A pretend server: the next page of posts after a short wait. */
function fetchPosts(from: number): Promise<Post[]> {
    return new Promise((resolve) =>
        setTimeout(() => {
            const count = Math.min(pageSize, lastPost - from);
            resolve(Array.from({ length: count }, (_, i) => ({ id: from + i, title: `Release notes ${from + i + 1}`, body: sentence(from + i) })));
        }, 700),
    );
}

/** An infinite feed: onEndReached loads the next page as you near the end, with a spinner while it does. role="feed"
 * makes each post an article that Page Down and Page Up move between. */
export function InfiniteFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const hasMore = posts.length < lastPost;

    const loadMore = useCallback(() => {
        setLoading(true);
        void fetchPosts(posts.length).then((next) => {
            setPosts((previous) => [...previous, ...next]);
            setLoading(false);
        });
    }, [posts.length]);

    return (
        <div style={frame}>
            <VirtualList
                role="feed"
                label="Release notes"
                items={posts}
                getKey={(post) => post.id}
                estimateSize={96}
                height={400}
                onEndReached={loadMore}
                loading={loading}
                hasMore={hasMore}
                renderItem={(post) => (
                    <Stack gap="2xs" style={{ padding: "14px 16px", borderBottom: "1px solid var(--ow-border)" }}>
                        <Text variant="card-title" as="h3">
                            {post.title}
                        </Text>
                        <Text variant="copy" tone="muted">
                            {post.body}.
                        </Text>
                    </Stack>
                )}
            />
        </div>
    );
}
InfiniteFeed.layout = { fill: true };

const levels = ["info", "info", "info", "debug", "warn", "info", "error"] as const;

/** A log that follows output: new lines keep the newest in view, until you scroll up to read. Scroll back to the end,
 * or press Jump to end, to follow again. */
export function FollowingLog() {
    const [lines, setLines] = useState<string[]>(() => Array.from({ length: 200 }, (_, index) => logLine(index)));
    const [running, setRunning] = useState(true);
    const list = useRef<VirtualListHandle>(null);

    useEffect(() => {
        if (!running) return undefined;
        const timer = setInterval(() => setLines((previous) => [...previous, logLine(previous.length)]), 400);
        return () => clearInterval(timer);
    }, [running]);

    return (
        <Stack gap="md" style={{ width: "100%" }}>
            <Stack direction="row" gap="sm" wrap>
                <Button size="sm" variant="secondary" onClick={() => setRunning((value) => !value)}>
                    {running ? "Pause" : "Resume"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => list.current?.scrollToEnd({ behavior: "smooth" })}>
                    Jump to end
                </Button>
            </Stack>
            <div style={{ ...frame, background: "var(--ow-surface-muted)" }}>
                <VirtualList
                    ref={list}
                    label="Build log"
                    items={lines}
                    itemSize={22}
                    height={300}
                    followOutput
                    renderItem={(line, index) => (
                        <div
                            style={{
                                padding: "0 12px",
                                font: "12px/22px var(--ow-font-mono)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color: line.includes("error") ? "var(--ow-danger-text)" : undefined,
                            }}
                        >
                            <span style={{ color: "var(--ow-text-muted)" }}>{String(index + 1).padStart(5, " ")} </span>
                            {line}
                        </div>
                    )}
                />
            </div>
        </Stack>
    );
}
FollowingLog.layout = { fill: true };

function logLine(index: number) {
    const level = levels[index % levels.length];
    const ms = 40 + ((index * 131) % 900);
    return `${level?.padEnd(5, " ")} step ${index + 1}: compiled chunk-${(index * 2654435761) % 4096} in ${ms}ms${level === "error" ? " (retrying)" : ""}`;
}

interface Message {
    id: number;
    author: string;
    text: string;
}

const message = (id: number): Message => ({ id, author: people[Math.abs(id) % people.length]!, text: sentence(Math.abs(id) + 3) });

/** A chat history that opens at the newest message and loads older ones as you scroll to the top. getKey keeps the
 * messages you're reading in place as older ones are added above them. */
export function ChatHistory() {
    const [messages, setMessages] = useState<Message[]>(() => Array.from({ length: 30 }, (_, i) => message(i)));
    const [loading, setLoading] = useState(false);
    const oldest = messages[0]?.id ?? 0;

    const loadOlder = useCallback(() => {
        if (oldest <= -150) return;
        setLoading(true);
        setTimeout(() => {
            setMessages((previous) => [...Array.from({ length: 30 }, (_, i) => message(oldest - 30 + i)), ...previous]);
            setLoading(false);
        }, 600);
    }, [oldest]);

    return (
        <div style={frame}>
            <VirtualList
                label="Messages"
                items={messages}
                getKey={(item) => item.id}
                estimateSize={64}
                height={380}
                followOutput
                onStartReached={loading ? undefined : loadOlder}
                renderItem={(item) => (
                    <Stack direction="row" gap="sm" style={{ padding: "8px 16px" }}>
                        <Avatar name={item.author} size="sm" />
                        <Stack gap="3xs" style={{ minWidth: 0 }}>
                            <Text as="span" variant="label">
                                {item.author}
                            </Text>
                            <Text variant="copy">{item.text}.</Text>
                        </Stack>
                    </Stack>
                )}
            />
        </div>
    );
}
ChatHistory.layout = { fill: true };
