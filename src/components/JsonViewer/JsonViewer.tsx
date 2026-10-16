import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import { CopyButton } from "@/components/CodeBlock/CodeBlock";
import { SearchField } from "@/components/SearchField/SearchField";
import { useControllableState } from "@/hooks/useControllableState";
import { ChevronRightIcon, CopyIcon, RouteIcon } from "@/icons";
import { copyText } from "@/utils/copyText";
import { cx } from "@/utils/cx";
import type { JsonPathSegment, JsonValueType, JsonViewerNode, JsonViewerProps, JsonViewerRow } from "./JsonViewer.types";

export type { JsonPathSegment, JsonValue, JsonViewerLabels, JsonViewerProps } from "./JsonViewer.types";

const defaultLabels = {
    search: "Search keys and values",
    matches: (count: number) => (count === 1 ? "1 match" : `${count} matches`),
    noMatches: "No matches",
    copy: "Copy JSON",
    copied: "Copied",
    copyValue: (path: string) => `Copy value at ${path}`,
    copyPath: (path: string) => `Copy path ${path}`,
    valueCopied: "Value copied",
    pathCopied: "Path copied",
    more: "more",
    less: "less",
    parseError: "Couldn't parse this JSON.",
    tree: "JSON",
};

const identifier = /^[A-Za-z_$][\w$]*$/;

/** Adds a key or index to a path: `a.b`, `a[2]`, `a["my key"]`. */
function join(path: string, segment: JsonPathSegment) {
    if (typeof segment === "number") return `${path}[${segment}]`;
    if (identifier.test(segment)) return path ? `${path}.${segment}` : segment;
    return `${path}[${JSON.stringify(segment)}]`;
}

function typeOf(value: unknown): JsonValueType {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    const type = typeof value;
    return type === "object" || type === "string" || type === "number" || type === "boolean" ? type : "other";
}

/** A primitive as the row shows it: strings without their quotes, escaped as JSON would. */
function textOf(value: unknown, type: JsonValueType) {
    if (type === "string") return JSON.stringify(value).slice(1, -1);
    if (type === "other") return typeof value === "bigint" ? `${value}n` : String(value);
    return JSON.stringify(value) ?? String(value);
}

function stringify(value: unknown) {
    const type = typeOf(value);
    return type === "other" ? textOf(value, type) : JSON.stringify(value, null, 2);
}

/** Wraps each occurrence of `query` in a mark. */
function highlight(text: string, query: string): ReactNode {
    if (!query) return text;
    const lower = text.toLowerCase();
    const parts: ReactNode[] = [];
    let from = 0;
    for (let at = lower.indexOf(query); at >= 0; at = lower.indexOf(query, from)) {
        if (at > from) parts.push(text.slice(from, at));
        parts.push(<mark key={at} className="ow-json__mark">{text.slice(at, at + query.length)}</mark>);
        from = at + query.length;
    }
    if (!parts.length) return text;
    if (from < text.length) parts.push(text.slice(from));
    return parts;
}

function buildTree(value: unknown, sortKeys: boolean, query: string, rootName?: string) {
    let matches = 0;
    const build = (
        current: unknown,
        segments: JsonPathSegment[],
        key: JsonPathSegment | undefined,
        parent: JsonViewerNode | undefined,
        pos: number,
        size: number,
    ): JsonViewerNode => {
        const type = typeOf(current);
        const path = parent ? join(parent.path, key!) : "";
        const container = type === "object" || type === "array";
        const label = key === undefined ? rootName : String(key);
        const matched = Boolean(
            query && ((label && label.toLowerCase().includes(query)) || (!container && textOf(current, type).toLowerCase().includes(query))),
        );
        if (matched) matches += 1;
        const node: JsonViewerNode = {
            path,
            segments,
            key,
            value: current,
            type,
            parent,
            level: segments.length,
            pos,
            size,
            count: 0,
            expandable: false,
            matched,
            hasMatch: matched,
            children: [],
        };
        if (type === "array") {
            const list = current as unknown[];
            node.count = list.length;
            node.children = list.map((item, index) => build(item, [...segments, index], index, node, index + 1, list.length));
        } else if (type === "object") {
            const record = current as Record<string, unknown>;
            const keys = Object.keys(record);
            if (sortKeys) keys.sort((a, b) => a.localeCompare(b));
            node.count = keys.length;
            node.children = keys.map((name, index) => build(record[name], [...segments, name], name, node, index + 1, keys.length));
        }
        node.expandable = node.count > 0;
        if (node.children.some((child) => child.hasMatch)) node.hasMatch = true;
        return node;
    };
    return { root: build(value, [], undefined, undefined, 1, 1), matches };
}

/** The paths of the rows open at first: every one, or those above a depth. */
function pathsToDepth(root: JsonViewerNode, depth: boolean | number) {
    const limit = depth === true ? Infinity : depth === false ? 0 : depth;
    const paths: string[] = [];
    const walk = (node: JsonViewerNode) => {
        if (!node.expandable || node.level >= limit) return;
        paths.push(node.path);
        node.children.forEach(walk);
    };
    walk(root);
    return paths;
}

/**
 * A JSON document as a tree of rows that open and close: an API response, a config file, an event's payload. Keys and
 * values are coloured by type, a closed row says how much it holds, a search box finds keys and values, and each row
 * copies its value or its path. It's one tab stop: the arrow keys move and open, Home/End jump, Enter toggles.
 */
export function JsonViewer({
    data,
    defaultExpanded = 1,
    expanded,
    onExpandedChange,
    searchable = false,
    copyable = true,
    rootName,
    maxStringLength,
    sortKeys = false,
    showTypes = false,
    showCounts = true,
    indent = 20,
    onSelect,
    height,
    maxHeight,
    label,
    labels: labelsProp,
    className,
}: JsonViewerProps) {
    const labels = { ...defaultLabels, ...labelsProp };
    const [queryText, setQueryText] = useState("");
    const query = queryText.trim().toLowerCase();
    const [focusPath, setFocusPath] = useState<string>();
    const [full, setFull] = useState(() => new Set<string>());
    const [announcement, setAnnouncement] = useState("");
    const refs = useRef(new Map<string, HTMLLIElement>());
    const timer = useRef(0);

    const parsed = useMemo(() => {
        if (typeof data !== "string") return { value: data };
        try {
            return { value: JSON.parse(data) as unknown };
        } catch (error) {
            return { error: error instanceof Error ? error.message : String(error) };
        }
    }, [data]);

    const { root, matches } = useMemo(
        () => buildTree(parsed.value, sortKeys, query, rootName),
        [parsed.value, sortKeys, query, rootName],
    );
    const [initialOpen] = useState(() => pathsToDepth(root, defaultExpanded));
    const [open, setOpen] = useControllableState(expanded, initialOpen, onExpandedChange);

    // The rows on show, in order. While searching, rows above a match are open and rows without one hide.
    const { rows, kidsOf } = useMemo(() => {
        const openSet = new Set(open);
        const flat: JsonViewerRow[] = [];
        const kids = new Map<JsonViewerRow | undefined, JsonViewerRow[]>();
        const walk = (node: JsonViewerNode, parent: JsonViewerRow | undefined, inMatch: boolean) => {
            if (query && !node.hasMatch && !inMatch) return;
            const forced = Boolean(query) && node.children.some((child) => child.hasMatch);
            const row: JsonViewerRow = { node, index: flat.length, open: node.expandable && (openSet.has(node.path) || forced), parent };
            flat.push(row);
            kids.set(parent, [...(kids.get(parent) ?? []), row]);
            if (row.open) node.children.forEach((child) => walk(child, row, inMatch || node.matched));
        };
        walk(root, undefined, false);
        return { rows: flat, kidsOf: kids };
    }, [root, open, query]);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    function announce(text: string) {
        setAnnouncement(text);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setAnnouncement(""), 2000);
    }

    async function copy(node: JsonViewerNode, what: "value" | "path") {
        const text = what === "value" ? stringify(node.value) : node.path || (rootName ?? "");
        if (await copyText(text)) announce(what === "value" ? labels.valueCopied : labels.pathCopied);
    }

    function focusRow(row: JsonViewerRow | undefined) {
        if (!row) return;
        setFocusPath(row.node.path);
        refs.current.get(row.node.path)?.focus();
    }

    function setRowOpen(row: JsonViewerRow, next: boolean) {
        if (!row.node.expandable || row.open === next) return;
        setOpen((previous) => (next ? [...previous, row.node.path] : previous.filter((path) => path !== row.node.path)));
    }

    function toggleFull(path: string) {
        setFull((previous) => {
            const next = new Set(previous);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    }

    function truncated(node: JsonViewerNode) {
        return node.type === "string" && maxStringLength !== undefined && textOf(node.value, node.type).length > maxStringLength;
    }

    function activate(row: JsonViewerRow) {
        onSelect?.(row.node.path, row.node.value);
        if (row.node.expandable) setRowOpen(row, !row.open);
        else if (truncated(row.node)) toggleFull(row.node.path);
    }

    function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
        const row = rows.find((entry) => refs.current.get(entry.node.path) === event.target);
        if (!row || event.altKey || event.ctrlKey || event.metaKey) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const key = rtl ? ({ ArrowRight: "ArrowLeft", ArrowLeft: "ArrowRight" }[event.key] ?? event.key) : event.key;
        if (key === "ArrowDown") focusRow(rows[row.index + 1]);
        else if (key === "ArrowUp") focusRow(rows[row.index - 1]);
        else if (key === "Home") focusRow(rows[0]);
        else if (key === "End") focusRow(rows[rows.length - 1]);
        else if (key === "ArrowRight") row.open ? focusRow(rows[row.index + 1]) : setRowOpen(row, true);
        else if (key === "ArrowLeft") row.open ? setRowOpen(row, false) : focusRow(row.parent);
        else if (key === "Enter" || key === " ") activate(row);
        else if (key === "*") {
            const closed = rows.filter((entry) => entry.parent === row.parent && entry.node.expandable && !entry.open).map((entry) => entry.node.path);
            if (closed.length) setOpen((previous) => [...previous, ...closed]);
        } else if (key === "c" && copyable) void copy(row.node, "value");
        else if (key === "C" && copyable) void copy(row.node, "path");
        else return;
        event.preventDefault();
    }

    const tabStop = rows.find((row) => row.node.path === focusPath) ?? rows[0];

    function renderValue(node: JsonViewerNode, open: boolean) {
        if (node.type === "object" || node.type === "array") {
            const [opener, closer] = node.type === "array" ? ["[", "]"] : ["{", "}"];
            if (!node.expandable) return <span className="ow-json__bracket">{opener + closer}</span>;
            if (open) return <span className="ow-json__bracket">{opener}</span>;
            return (
                <span className="ow-json__bracket">
                    {opener}
                    <span className="ow-json__count">{showCounts ? node.count : "…"}</span>
                    {closer}
                </span>
            );
        }
        let text = textOf(node.value, node.type);
        const cut = truncated(node) && !full.has(node.path);
        if (cut) text = text.slice(0, maxStringLength);
        const quote = node.type === "string" ? '"' : "";
        return (
            <>
                <span className={cx("ow-json__value", `ow-json__value--${node.type}`)}>
                    {quote}
                    {highlight(text, query)}
                    {cut ? "…" : ""}
                    {quote}
                </span>
                {truncated(node) ? (
                    <button
                        type="button"
                        className="ow-json__more"
                        tabIndex={-1}
                        onClick={(event) => {
                            event.stopPropagation();
                            toggleFull(node.path);
                        }}
                    >
                        {cut ? labels.more : labels.less}
                    </button>
                ) : null}
            </>
        );
    }

    function renderRows(list: JsonViewerRow[]): ReactNode {
        return list.map((row) => {
            const { node } = row;
            const name = node.key === undefined ? rootName : String(node.key);
            const style = { paddingInlineStart: `calc(${node.level} * var(--ow-json-indent))` };
            return (
                <li
                    key={node.path}
                    ref={(element) => {
                        if (element) refs.current.set(node.path, element);
                        else refs.current.delete(node.path);
                    }}
                    role="treeitem"
                    aria-level={node.level + 1}
                    aria-setsize={node.size}
                    aria-posinset={node.pos}
                    aria-expanded={node.expandable ? row.open : undefined}
                    tabIndex={row === tabStop ? 0 : -1}
                    className="ow-json__item"
                    onFocus={(event) => {
                        if (event.target === event.currentTarget) setFocusPath(node.path);
                    }}
                >
                    <div
                        className={cx("ow-json__row", node.matched && "ow-json__row--match")}
                        style={style}
                        onClick={() => {
                            focusRow(row);
                            activate(row);
                        }}
                    >
                        <span className="ow-json__toggle">{node.expandable ? <ChevronRightIcon size={14} /> : null}</span>
                        <span className="ow-json__text">
                            {name !== undefined ? (
                                <>
                                    <span className={cx("ow-json__key", typeof node.key === "number" && "ow-json__key--index")}>
                                        {highlight(name, query)}
                                    </span>
                                    <span className="ow-json__colon">: </span>
                                </>
                            ) : null}
                            {renderValue(node, row.open)}
                            {showTypes ? (
                                <span className="ow-json__type">
                                    {node.type === "other" ? typeof node.value : node.type}
                                    {node.expandable ? ` (${node.count})` : ""}
                                </span>
                            ) : null}
                        </span>
                        {copyable ? (
                            <span className="ow-json__actions">
                                <button
                                    type="button"
                                    className="ow-json__action"
                                    tabIndex={-1}
                                    aria-label={labels.copyValue(node.path || rootName || "root")}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        void copy(node, "value");
                                    }}
                                >
                                    <CopyIcon size={14} />
                                </button>
                                {node.path ? (
                                    <button
                                        type="button"
                                        className="ow-json__action"
                                        tabIndex={-1}
                                        aria-label={labels.copyPath(node.path)}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void copy(node, "path");
                                        }}
                                    >
                                        <RouteIcon size={14} />
                                    </button>
                                ) : null}
                            </span>
                        ) : null}
                    </div>
                    {row.open ? (
                        <>
                            <ul role="group" className="ow-json__group">
                                {renderRows(kidsOf.get(row) ?? [])}
                            </ul>
                            <div className="ow-json__close" style={style} aria-hidden="true">
                                <span className="ow-json__toggle" />
                                <span className="ow-json__bracket">{node.type === "array" ? "]" : "}"}</span>
                            </div>
                        </>
                    ) : null}
                </li>
            );
        });
    }

    const hasBar = searchable || copyable;
    const scrollStyle: CSSProperties | undefined = height !== undefined || maxHeight !== undefined ? { height, maxHeight } : undefined;

    return (
        <div className={cx("ow-json", className)} style={{ "--ow-json-indent": `${indent}px` } as CSSProperties}>
            {hasBar ? (
                <div className="ow-json__bar">
                    {searchable ? (
                        <SearchField className="ow-json__search" size="sm" value={queryText} onChange={setQueryText} aria-label={labels.search} placeholder={labels.search} />
                    ) : null}
                    <span className="ow-json__status" role="status">
                        {searchable && query ? (matches ? labels.matches(matches) : labels.noMatches) : ""}
                    </span>
                    {copyable && !parsed.error ? <CopyButton value={stringify(parsed.value)} label={labels.copy} copiedLabel={labels.copied} className="ow-json__copy" /> : null}
                </div>
            ) : null}
            {parsed.error ? (
                <div className="ow-json__error">
                    <p className="ow-json__error-text">
                        {labels.parseError} <span className="ow-json__error-detail">{parsed.error}</span>
                    </p>
                    <pre className="ow-json__raw">{data as string}</pre>
                </div>
            ) : (
                <div className="ow-json__scroll" style={scrollStyle}>
                    <ul role="tree" aria-label={label ?? labels.tree} className="ow-json__tree" onKeyDown={onKeyDown}>
                        {renderRows(kidsOf.get(undefined) ?? [])}
                    </ul>
                </div>
            )}
            <span className="ow-visually-hidden" role="status">
                {announcement}
            </span>
        </div>
    );
}
