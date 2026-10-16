import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
} from "react";

import { usePresence } from "@/hooks/usePresence";
import { ArrowDownIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { Button } from "../Button/Button";
import { CopyButton } from "../CodeBlock/CodeBlock";
import { SearchField } from "../SearchField/SearchField";
import { useVirtualizer } from "../VirtualList/useVirtualizer";
import { parseAnsi, stripAnsi } from "./ansi";
import type { AnsiSegment, AnsiStyle, LogViewerHandle, LogViewerLevel, LogViewerProps, LogViewerRow } from "./LogViewer.types";

export type { AnsiSegment, AnsiStyle, LogViewerEntry, LogViewerHandle, LogViewerLabels, LogViewerLevel, LogViewerLine, LogViewerProps } from "./LogViewer.types";
export { parseAnsi, stripAnsi } from "./ansi";

/** A line's height in pixels when lines don't wrap, and the guess for one that does. */
const rowHeight = 20;
/** How close to the end, in pixels, still counts as following it. */
const stickyDistance = 32;

const defaultLabels = {
    jump: "Jump to latest",
    newCount: (count: number) => `${count} new`,
    search: "Search log",
    matches: (current: number, total: number) => `${current} of ${total}`,
    noMatches: "No matches",
    previous: "Previous match",
    next: "Next match",
    copy: "Copy log",
    copied: "Copied",
    download: "Download log",
    streaming: "Streaming",
};

/** The first word of a line, after any time or bracket: `ERROR`, `[warn]`, `12:04:31 INFO`. */
const levelPattern = /^[^A-Za-z]*(ERROR|FATAL|WARN(?:ING)?|INFO|DEBUG|TRACE)\b/i;
const levelNames: Record<string, LogViewerLevel> = { error: "error", fatal: "error", warn: "warn", warning: "warn", info: "info", debug: "debug", trace: "debug" };

function detectLevel(text: string): LogViewerLevel | undefined {
    const match = levelPattern.exec(text.length > 80 ? text.slice(0, 80) : text);
    return match ? levelNames[match[1]!.toLowerCase()] : undefined;
}

const prefersReducedMotion = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

const ansiColour = (value: number | string) => (typeof value === "number" ? `var(--ow-log-viewer-ansi-${value})` : value);

/** The class and inline style of one styled run. */
function ansiPresentation({ fg, bg, bold, dim, italic, underline, inverse, strike }: AnsiStyle) {
    const style: CSSProperties = {};
    let colour = fg === undefined ? undefined : ansiColour(fg);
    let ground = bg === undefined ? undefined : ansiColour(bg);
    if (inverse) [colour, ground] = [ground ?? "var(--ow-log-viewer-ground)", colour ?? "currentColor"];
    if (colour !== undefined) style.color = colour;
    if (ground !== undefined) style.backgroundColor = ground;
    const className = cx(
        bold && "ow-log-viewer__ansi--bold",
        dim && "ow-log-viewer__ansi--dim",
        italic && "ow-log-viewer__ansi--italic",
        underline && "ow-log-viewer__ansi--underline",
        strike && "ow-log-viewer__ansi--strike",
    );
    return { className: className || undefined, style: colour === undefined && ground === undefined ? undefined : style };
}

/** Where `needle` occurs in `text` (already lower-cased), as [start, end) pairs. */
function findRanges(text: string, needle: string) {
    const ranges: Array<[number, number]> = [];
    for (let from = text.indexOf(needle); from >= 0; from = text.indexOf(needle, from + needle.length)) ranges.push([from, from + needle.length]);
    return ranges;
}

/** A line's text as React nodes: its ANSI runs, with the search matches wrapped in `mark`. */
function renderLine(segments: AnsiSegment[], ranges: Array<[number, number]>, current: boolean): ReactNode {
    const nodes: ReactNode[] = [];
    let offset = 0;
    let range = 0;
    segments.forEach((segment, index) => {
        const { className, style } = ansiPresentation(segment.style);
        const parts: ReactNode[] = [];
        let cursor = 0;
        const end = offset + segment.text.length;
        // Each match range that overlaps this run splits it: plain text, then the marked text.
        while (range < ranges.length && ranges[range]![0] < end) {
            const [start, stop] = ranges[range]!;
            const from = Math.max(start, offset) - offset;
            const to = Math.min(stop, end) - offset;
            if (from > cursor) parts.push(segment.text.slice(cursor, from));
            parts.push(
                <mark key={`${start}-${from}`} className={cx("ow-log-viewer__match", current && "ow-log-viewer__match--current")}>
                    {segment.text.slice(from, to)}
                </mark>,
            );
            cursor = to;
            if (stop <= end) range++;
            else break;
        }
        if (cursor < segment.text.length) parts.push(segment.text.slice(cursor));
        offset = end;
        nodes.push(
            className || style ? (
                <span key={index} className={className} style={style}>
                    {parts}
                </span>
            ) : (
                parts
            ),
        );
    });
    return nodes;
}

/**
 * Terminal output as it streams: a build, a test run, an agent's tool call. It follows the newest line while the
 * reader is at the end and offers "Jump to latest" once they scroll up, colours ANSI escape codes, and renders only
 * the lines in view, so 10,000 lines cost what 20 do. Search, line numbers, level tints, copy and download are
 * each a prop away.
 */
export const LogViewer = forwardRef<LogViewerHandle, LogViewerProps>(function LogViewer(
    {
        lines,
        text,
        follow = true,
        ansi = true,
        lineNumbers = false,
        wrap = false,
        timestamps = true,
        height = 320,
        maxLines,
        searchable = false,
        levels = false,
        toolbar,
        copyable = false,
        downloadable = false,
        downloadName = "log.txt",
        streaming = false,
        announce = true,
        label,
        labels: givenLabels,
        id,
        className,
    },
    ref,
) {
    const labels = { ...defaultLabels, ...givenLabels };
    const scrollRef = useRef<HTMLDivElement>(null);
    const jumpRef = useRef<HTMLButtonElement>(null);
    const following = useRef(follow);
    const lastTop = useRef(0);
    const [isFollowing, setIsFollowing] = useState(follow);
    // How many lines there were when the reader scrolled up: the ones after are "new".
    const [seen, setSeen] = useState(0);
    const [query, setQuery] = useState("");
    const [current, setCurrent] = useState(0);

    // The lines as rows, the last `maxLines` of them, each with its text stripped of ANSI codes for searching and copying.
    const { rows, dropped } = useMemo(() => {
        const source = lines ?? (text ? text.replace(/\n$/, "").split("\n") : []);
        const skip = maxLines !== undefined && source.length > maxLines ? source.length - maxLines : 0;
        const result: LogViewerRow[] = new Array(source.length - skip);
        for (let index = skip; index < source.length; index++) {
            const line = source[index]!;
            const raw = typeof line === "string" ? line : line.text;
            result[index - skip] = { time: typeof line === "string" ? undefined : line.time, raw, plain: ansi ? stripAnsi(raw) : raw };
        }
        return { rows: result, dropped: skip };
    }, [lines, text, maxLines, ansi]);
    const count = rows.length;
    const total = dropped + count;

    const hasTimes = useMemo(() => timestamps && rows.some((row) => row.time !== undefined), [rows, timestamps]);
    const timeWidth = useMemo(() => (hasTimes ? rows.reduce((width, row) => Math.max(width, row.time?.length ?? 0), 0) : 0), [rows, hasTimes]);
    // The longest line sets the width to scroll sideways, so the scrollbar doesn't change as lines render.
    const longest = useMemo(() => (wrap ? 0 : rows.reduce((width, row) => Math.max(width, row.plain.length), 0)), [rows, wrap]);
    const digits = String(Math.max(1, total)).length;

    const needle = query.trim().toLowerCase();
    const matches = useMemo(() => {
        if (!needle) return [];
        const found: number[] = [];
        rows.forEach((row, index) => {
            if (row.plain.toLowerCase().includes(needle)) found.push(index);
        });
        return found;
    }, [rows, needle]);
    const currentMatch = matches.length ? Math.min(current, matches.length - 1) : -1;

    const levelOf = typeof levels === "function" ? levels : levels ? detectLevel : undefined;

    // Keys follow the line, not its place, so measured heights stay right as lines drop off the top.
    const getKey = useCallback((index: number) => index + dropped, [dropped]);
    const { items, totalSize, measureElement, scrollToIndex } = useVirtualizer({
        count,
        getScrollElement: () => scrollRef.current,
        itemSize: wrap ? undefined : rowHeight,
        estimateSize: rowHeight,
        overscan: 8,
        getKey,
    });

    const totalRef = useRef(total);
    totalRef.current = total;
    const setFollowing = useCallback((next: boolean) => {
        following.current = next;
        setIsFollowing(next);
        if (!next) setSeen(totalRef.current);
    }, []);

    // Pins the view to the end at once; following never animates, so a fast stream never lags behind.
    const stick = useCallback(() => {
        const element = scrollRef.current;
        if (!element) return;
        element.scrollTop = element.scrollHeight;
        lastTop.current = element.scrollTop;
    }, []);

    const scrollToEnd = useCallback(
        (options?: { behavior?: ScrollBehavior }) => {
            const element = scrollRef.current;
            if (!element) return;
            setFollowing(true);
            const smooth = (options?.behavior ?? "smooth") === "smooth" && !prefersReducedMotion();
            if (smooth) element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
            else stick();
        },
        [setFollowing, stick],
    );

    const scrollToLine = useCallback(
        (index: number) => {
            setFollowing(false);
            scrollToIndex(index, { align: "center" });
        },
        [setFollowing, scrollToIndex],
    );

    useImperativeHandle(
        ref,
        () => ({
            scrollToEnd,
            scrollToLine,
            get element() {
                return scrollRef.current;
            },
        }),
        [scrollToEnd, scrollToLine],
    );

    // Turning `follow` on picks the end up again.
    useLayoutEffect(() => {
        if (follow) setFollowing(true);
    }, [follow, setFollowing]);

    // Keeps the end in view while following: on open, as lines arrive, and as wrapped lines are measured.
    useLayoutEffect(() => {
        if (follow && following.current) stick();
    }, [follow, totalSize, count, streaming, stick]);

    // The frame changing size (a panel resized, the toolbar wrapping) keeps the end in view too.
    useEffect(() => {
        const element = scrollRef.current;
        if (!element || typeof ResizeObserver === "undefined") return undefined;
        const observer = new ResizeObserver(() => {
            if (follow && following.current) stick();
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [follow, stick]);

    function onScroll() {
        const element = scrollRef.current;
        if (!element || !follow) return;
        const top = element.scrollTop;
        const distance = element.scrollHeight - top - element.clientHeight;
        // Any move up is the reader looking back; reaching the end again picks following back up.
        if (top < lastTop.current - 1 && distance > 1) {
            if (following.current) setFollowing(false);
        } else if (distance <= stickyDistance && !following.current) {
            setFollowing(true);
        }
        lastTop.current = top;
    }

    function goToMatch(index: number) {
        if (!matches.length) return;
        const next = (index + matches.length) % matches.length;
        setCurrent(next);
        scrollToLine(matches[next]!);
    }

    function onSearch(value: string) {
        setQuery(value);
        setCurrent(0);
        const lower = value.trim().toLowerCase();
        if (!lower) return;
        const first = rows.findIndex((row) => row.plain.toLowerCase().includes(lower));
        if (first >= 0) scrollToLine(first);
    }

    function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        goToMatch(currentMatch + (event.shiftKey ? -1 : 1));
    }

    const plainText = useMemo(() => (copyable || downloadable ? rows.map((row) => row.plain).join("\n") : ""), [rows, copyable, downloadable]);

    function download() {
        const url = URL.createObjectURL(new Blob([plainText], { type: "text/plain;charset=utf-8" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = downloadName;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    const newCount = isFollowing ? 0 : Math.max(0, total - seen);
    const showJump = follow && !isFollowing && count > 0;
    const jump = usePresence(showJump);
    const hasToolbar = searchable || toolbar != null || copyable || downloadable;
    const gutters = 24 + (lineNumbers ? 12 : 0) + (hasTimes ? 12 : 0);

    return (
        <div
            id={id}
            className={cx("ow-log-viewer", wrap && "ow-log-viewer--wrap", className)}
            style={{ "--ow-log-viewer-digits": digits, "--ow-log-viewer-time": `${timeWidth}ch` } as CSSProperties}
        >
            {hasToolbar ? (
                <div className="ow-log-viewer__toolbar">
                    {searchable ? (
                        <>
                            <SearchField
                                className="ow-log-viewer__search"
                                size="sm"
                                value={query}
                                onChange={onSearch}
                                onKeyDown={onSearchKeyDown}
                                aria-label={labels.search}
                                placeholder={labels.search}
                            />
                            <span className="ow-log-viewer__matches" role="status">
                                {needle ? (matches.length ? labels.matches(currentMatch + 1, matches.length) : labels.noMatches) : ""}
                            </span>
                            <Button size="sm" variant="ghost" iconOnly aria-label={labels.previous} disabled={!matches.length} onClick={() => goToMatch(currentMatch - 1)}>
                                <ChevronUpIcon size={16} />
                            </Button>
                            <Button size="sm" variant="ghost" iconOnly aria-label={labels.next} disabled={!matches.length} onClick={() => goToMatch(currentMatch + 1)}>
                                <ChevronDownIcon size={16} />
                            </Button>
                        </>
                    ) : null}
                    <div className="ow-log-viewer__actions">
                        {toolbar}
                        {copyable ? <CopyButton value={plainText} iconOnly label={labels.copy} copiedLabel={labels.copied} /> : null}
                        {downloadable ? (
                            <Button size="sm" variant="ghost" iconOnly aria-label={labels.download} onClick={download}>
                                <DownloadIcon size={16} />
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : null}
            <div className="ow-log-viewer__viewport" style={{ height }}>
                <div
                    ref={scrollRef}
                    className="ow-log-viewer__scroll"
                    role="log"
                    aria-label={label}
                    // New lines are read out only while the view follows them: scrolling up to read quiets it.
                    aria-live={announce && follow && isFollowing ? "polite" : "off"}
                    aria-relevant="additions"
                    // A tab stop, so the log scrolls from the keyboard.
                    tabIndex={count > 0 ? 0 : undefined}
                    onScroll={onScroll}
                >
                    <div
                        className="ow-log-viewer__inner"
                        style={{ height: totalSize, minWidth: wrap ? undefined : `calc(${longest + (lineNumbers ? digits : 0) + timeWidth}ch + ${gutters}px)` }}
                    >
                        {items.map(({ index, key, start }) => {
                            const row = rows[index]!;
                            const isCurrent = currentMatch >= 0 && matches[currentMatch] === index;
                            const ranges = needle ? findRanges(row.plain.toLowerCase(), needle) : [];
                            const segments = ansi ? parseAnsi(row.raw) : [{ text: row.raw, style: {} }];
                            return (
                                <div
                                    key={key}
                                    ref={measureElement}
                                    data-index={index}
                                    data-level={levelOf?.(row.plain)}
                                    className={cx("ow-log-viewer__row", isCurrent && "ow-log-viewer__row--current")}
                                    style={{ transform: `translateY(${start}px)`, height: wrap ? undefined : rowHeight }}
                                >
                                    {lineNumbers ? (
                                        <span className="ow-log-viewer__number" aria-hidden="true">
                                            {dropped + index + 1}
                                        </span>
                                    ) : null}
                                    {hasTimes ? <span className="ow-log-viewer__time">{row.time}</span> : null}
                                    <span className="ow-log-viewer__text">
                                        {renderLine(segments, ranges, isCurrent)}
                                        {streaming && index === count - 1 ? <span className="ow-log-viewer__cursor" aria-hidden="true" /> : null}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {streaming && count === 0 ? (
                        <div className="ow-log-viewer__row" aria-hidden="true">
                            <span className="ow-log-viewer__text">
                                <span className="ow-log-viewer__cursor" />
                            </span>
                        </div>
                    ) : null}
                </div>
                {jump.mounted ? (
                    <div className="ow-log-viewer__jump" data-state={jump.state}>
                        <Button
                            ref={jumpRef}
                            size="sm"
                            shape="pill"
                            startIcon={<ArrowDownIcon size={16} />}
                            aria-label={newCount > 0 ? `${labels.jump}, ${labels.newCount(newCount)}` : labels.jump}
                            tabIndex={showJump ? undefined : -1}
                            onClick={() => {
                                // The button goes once the view is at the end: keep keyboard focus in the log.
                                if (document.activeElement === jumpRef.current) scrollRef.current?.focus({ preventScroll: true });
                                scrollToEnd();
                            }}
                        >
                            {labels.jump}
                            {newCount > 0 ? <span className="ow-log-viewer__count">{labels.newCount(newCount)}</span> : null}
                        </Button>
                    </div>
                ) : null}
            </div>
            <span className="ow-visually-hidden" role="status">
                {streaming ? labels.streaming : ""}
            </span>
        </div>
    );
});
