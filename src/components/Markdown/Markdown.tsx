import { createElement, Fragment, memo, useMemo, useRef, type ReactNode } from "react";

import { cx } from "@/utils/cx";
import { CodeBlock } from "@/components/CodeBlock/CodeBlock";
import { Prose } from "@/components/Prose/Prose";
import type { MarkdownBlockProps, MarkdownContext, MarkdownProps, MarkdownTag } from "./Markdown.types";

export type { MarkdownCodeBlockProps, MarkdownComponents, MarkdownProps, MarkdownTag } from "./Markdown.types";

const FENCE = /^ {0,3}(`{3,}|~{3,})[ \t]*([^\s`]*)/;
const HEADING = /^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const LIST = /^( {0,3})([-*+]|\d{1,9}[.)])([ \t]+|$)/;
const QUOTE = /^ {0,3}>/;
const DIVIDER = /^[\s|:-]*-[\s|:-]*$/;
// While streaming, a last line that is only the start of a construct ("```", "- [", "1.", "| --") waits for more.
const PENDING = /(?:^|\n)[ \t]*(?:[-*_+#=`~|:> \t]*|(?:[-*+]|\d+[.)])[ \t]*(?:\[[ xX]?\]?)?)[ \t]*$/;

/** A line that closes the fence opened by `fence`. */
const closes = (line: string, fence: string) => {
    const mark = line.trim();
    return /^(`+|~+)$/.test(mark) && mark[0] === fence[0] && mark.length >= fence.length;
};

/** Cuts Markdown into its top-level blocks' source: a fence, a heading, a rule, a list, a quote, a paragraph or table. */
function split(source: string) {
    const blocks: string[] = [];
    const lines = source.split("\n");
    let current: string[] = [];
    let kind = "";
    let fence = "";
    let ordered = false;
    // Another item of the same list: a bullet after bullets, a number after numbers.
    const sibling = (line: string) => {
        const item = LIST.exec(line);
        return !!item && /\d/.test(item[2]!) === ordered;
    };
    const flush = () => {
        if (current.length) blocks.push(current.join("\n"));
        current = [];
        kind = "";
    };
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i] as string;
        if (kind === "f") {
            current.push(line);
            if (closes(line, fence)) flush();
            continue;
        }
        if (!line.trim()) {
            // A blank line inside a list only ends it when what follows isn't indented or another item.
            const next = kind === "l" ? lines.slice(i + 1).find((rest) => rest.trim()) : undefined;
            if (next !== undefined && (/^\s/.test(next) || sibling(next))) current.push(line);
            else flush();
            continue;
        }
        if (kind === "l" && /^\s/.test(line)) {
            current.push(line);
            continue;
        }
        const opened = FENCE.exec(line);
        if (opened) {
            flush();
            kind = "f";
            fence = opened[1] as string;
            current.push(line);
            continue;
        }
        if (HEADING.test(line) || RULE.test(line)) {
            flush();
            blocks.push(line);
            continue;
        }
        const next = QUOTE.test(line) ? "q" : LIST.test(line) ? "l" : "p";
        if (next !== kind || (kind === "l" && !sibling(line))) flush();
        if (next === "l") ordered = /\d/.test(LIST.exec(line)![2]!);
        kind = next;
        current.push(line);
    }
    flush();
    return blocks;
}

/** Creates an element, or the `components` renderer that replaces it. */
const h = (context: MarkdownContext, tag: MarkdownTag, props: object | null, ...children: ReactNode[]) =>
    createElement(context.components?.[tag] ?? tag, props, ...children);

/** The URL if it's safe to follow (http, https, mailto for links, or relative), otherwise null. */
function safe(url: string, image?: boolean) {
    const clean = url.replace(/[\s\0-\x1f]/g, "");
    return /^(https?:)?\/\//i.test(clean) || (!image && /^mailto:/i.test(clean)) || !/^[^/?#]*:/.test(clean) ? clean : null;
}

/** Where the bracket opened at `start` closes, or -1. */
function matching(text: string, start: number, open: string, close: string) {
    for (let i = start, depth = 0; i < text.length; i++) {
        if (text[i] === "\\") i++;
        else if (text[i] === open) depth++;
        else if (text[i] === close && !--depth) return i;
    }
    return -1;
}

/** Where the emphasis `mark` opened before `from` closes (the start of its closing run), or -1. */
function closing(text: string, mark: string, from: number) {
    for (let j = text.indexOf(mark, from); j > -1; j = text.indexOf(mark, j + 1)) {
        const start = j;
        while (text[j + 1] === mark[0]) j++;
        const run = j - start + 1;
        if (/\s/.test(text[start - 1] ?? " ") || (mark === "_" && /\w/.test(text[j + 1] ?? ""))) continue;
        // `*` closes on an odd run (`*`, or the `*` of `***`); `**` on any run of two or more, at its end.
        if (mark.length === 1 ? run % 2 : run > 1) return j - mark.length + 1;
    }
    return -1;
}

const tags: Record<string, MarkdownTag> = { "*": "em", _: "em", "**": "strong", __: "strong", "~~": "del" };

/** Inline Markdown as React nodes. At the streaming end (`tail`), unclosed code, emphasis and links show as they will;
 * `bare` turns plain URLs into links (not inside a link's own text). */
function inline(text: string, context: MarkdownContext, tail: boolean, bare = true): ReactNode[] {
    const nodes: ReactNode[] = [];
    let plain = "";
    const add = (...more: ReactNode[]) => {
        if (plain) nodes.push(plain);
        plain = "";
        nodes.push(...more);
    };
    const link = (href: string, title: string | undefined, children: ReactNode[]) => {
        const url = safe(href);
        if (url === null) return add(...children);
        const external = /^(https?:)?\/\//i.test(url);
        add(
            h(
                context,
                "a",
                {
                    href: url,
                    title,
                    target: external ? "_blank" : undefined,
                    rel: external ? "noopener noreferrer" : undefined,
                    onClick: (event: Parameters<MarkdownContext["click"]>[0]) => context.click(event, url),
                },
                ...children,
            ),
        );
    };

    for (let i = 0; i < text.length; ) {
        const char = text[i] as string;
        const rest = text.slice(i, i + 2);

        if (char === "\\" && /[\n!-/:-@[-`{-~]/.test(text[i + 1] ?? "")) {
            if (text[i + 1] === "\n") add(createElement("br"));
            else plain += text[i + 1];
            i += 2;
            continue;
        }
        if (char === "\n") {
            // Two spaces before a line end break the line; otherwise it's a space.
            const hard = / {2,}$/.test(plain);
            plain = plain.replace(/ +$/, "");
            if (hard) add(createElement("br"));
            else plain += "\n";
            i++;
            continue;
        }
        if (char === "`") {
            const ticks = (/^`+/.exec(text.slice(i)) as RegExpExecArray)[0];
            const end = text.indexOf(ticks, i + ticks.length);
            if (end > -1 || tail) {
                const code = text.slice(i + ticks.length, end > -1 ? end : undefined);
                add(h(context, "code", null, /^ .*[^ ].* $/.test(code) ? code.slice(1, -1) : code));
                i = end > -1 ? end + ticks.length : text.length;
                continue;
            }
            plain += ticks;
            i += ticks.length;
            continue;
        }

        const mark = rest === "**" || rest === "__" || rest === "~~" ? rest : char === "*" || char === "_" ? char : "";
        // A mark that ends the streamed text is waiting for what it marks.
        if (tail && /^[*_~]+$/.test(text.slice(i))) break;
        if (mark && !/\s/.test(text[i + mark.length] ?? " ") && !(char === "_" && /\w/.test(text[i - 1] ?? ""))) {
            const end = closing(text, mark, i + mark.length + 1);
            // Unclosed at the streaming end, it's only taken as emphasis at the start of a word, not in 2*x.
            if (end > -1 || (tail && !/\w/.test(text[i - 1] ?? ""))) {
                const inner = text.slice(i + mark.length, end > -1 ? end : undefined);
                add(h(context, tags[mark] as MarkdownTag, null, ...inline(inner, context, end < 0, bare)));
                i = end > -1 ? end + mark.length : text.length;
                continue;
            }
        }

        if (char === "[" || rest === "![") {
            const image = char === "!";
            const open = i + (image ? 1 : 0);
            const close = matching(text, open, "[", "]");
            const label = text.slice(open + 1, close > -1 ? close : undefined);
            const end = close > -1 && text[close + 1] === "(" ? matching(text, close + 1, "(", ")") : -1;
            if (end > -1) {
                const [, href = "", title] = /^<?([^\s>]*)>?(?:\s+["'(](.*)["')])?$/.exec(text.slice(close + 2, end).trim()) ?? [];
                const source = image && context.allowImages ? safe(href, true) : null;
                if (source !== null) add(h(context, "img", { src: source, alt: label, title, loading: "lazy" }));
                else link(href, title, image ? [label || href] : inline(label, context, false, false));
                i = end + 1;
                continue;
            }
            // At the streaming end, a link still waiting for its URL shows just its text.
            if (tail && (close < 0 || close === text.length - 1 || (text[close + 1] === "(" && end < 0))) {
                add(...inline(label, context, true, bare));
                break;
            }
        }

        if (bare && (char === "<" || (char === "h" && !/\w/.test(text[i - 1] ?? "")))) {
            const auto = /^<((?:https?:\/\/|mailto:)[^\s<>]+)>|^https?:\/\/[^\s<]*[^\s<.,:;!?"')\]*_~]/i.exec(text.slice(i));
            if (auto) {
                const href = auto[1] ?? auto[0];
                link(href, undefined, [href.replace(/^mailto:/i, "")]);
                i += auto[0].length;
                continue;
            }
        }

        plain += char;
        i++;
    }
    if (plain) nodes.push(plain);
    return nodes;
}

/** A block's inline text, with the caret after it at the streaming end. */
const text = (source: string, context: MarkdownContext, tail: boolean) => {
    const nodes = inline(source, context, tail);
    if (tail && context.caret) nodes.push(createElement("span", { className: "ow-markdown__caret", "aria-hidden": true }));
    return nodes;
};

/** Every block in some Markdown; `tight` drops the paragraphs of a tight list's items. */
const blocks = (source: string, context: MarkdownContext, tail: boolean, tight = false) =>
    split(source).map((part, index, parts) => block(part, context, tail && index === parts.length - 1, tight));

/** Table cells, with \| as a literal pipe. */
const cells = (row: string) =>
    row
        .replace(/\\\|/g, "\0")
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((cell) => cell.trim().replace(/\0/g, "|"));

/** One block of Markdown, as returned by split(). */
function block(source: string, context: MarkdownContext, tail: boolean, tight: boolean): ReactNode {
    const lines = source.split("\n");
    const first = lines[0] as string;
    let match: RegExpExecArray | null;

    if ((match = FENCE.exec(first))) {
        const body = lines.slice(1);
        if (body.length && closes(body[body.length - 1] as string, match[1] as string)) body.pop();
        const indent = (/^ */.exec(first) as RegExpExecArray)[0].length;
        // The language waits for the end of its line, so "p" doesn't flash before "python".
        const language = lines.length > 1 || !tail ? match[2] || undefined : undefined;
        return createElement(context.components?.codeBlock ?? CodeBlock, {
            code: body.map((line) => line.replace(new RegExp(`^ {0,${indent}}`), "")).join("\n"),
            language,
        });
    }
    if ((match = HEADING.exec(first))) {
        const level = Math.min(6, match[1]!.length + context.headingOffset);
        return match[2] ? h(context, `h${level}` as MarkdownTag, null, ...text(match[2], context, tail)) : null;
    }
    if (RULE.test(first)) return h(context, "hr", null);
    if (QUOTE.test(first)) {
        return h(context, "blockquote", null, ...blocks(lines.map((line) => line.replace(/^ {0,3}> ?/, "")).join("\n"), context, tail));
    }
    if ((match = LIST.exec(first))) {
        const items: string[][] = [];
        const base = match[1]!.length;
        let pad = 0;
        for (const line of lines) {
            // An item marker at about the first one's indent starts the next item; further in, it's a nested list.
            const item = LIST.exec(line);
            if (item && item[1]!.length <= base + 1) {
                items.push([line.slice(item[0].length)]);
                pad = item[0].length + (item[3] ? 0 : 1);
            } else {
                items[items.length - 1]!.push(line.slice(Math.min(pad, (/^ */.exec(line) as RegExpExecArray)[0].length)));
            }
        }
        const loose = lines.some((line, index) => !line.trim() && index < lines.length - 1);
        const start = parseInt(match[2]!, 10);
        return h(
            context,
            isNaN(start) ? "ul" : "ol",
            { start: start > 1 || start === 0 ? start : undefined },
            ...items.map((item, index) => {
                const last = tail && index === items.length - 1;
                const content = item.join("\n");
                const task = /^\[([ xX])\](?:[ \t]+|$)/.exec(content);
                return h(
                    context,
                    "li",
                    null,
                    task ? createElement("input", { type: "checkbox", checked: task[1] !== " ", disabled: true, readOnly: true }) : null,
                    task ? " " : null,
                    ...blocks(task ? content.slice(task[0].length) : content, context, last, !loose),
                );
            }),
        );
    }
    // A table needs a header row and a divider under it; streaming, a row starting with | is one already.
    const table = first.includes("|") && (lines.length > 1 ? DIVIDER.test(lines[1]!) && (tail || /-/.test(lines[1]!)) : tail && first.trim()[0] === "|");
    if (table) {
        const head = cells(first);
        const aligns = cells(lines[1] ?? "").map((cell) => (/^:-*:$/.test(cell) ? "center" : /-:$/.test(cell) ? "right" : undefined));
        const rows = lines.slice(2).map(cells);
        const row = (values: string[], tag: "th" | "td", end: boolean) =>
            createElement(
                "tr",
                null,
                ...head.map((_, index) =>
                    h(context, tag, { align: aligns[index] }, ...text(values[index] ?? "", context, end && index === Math.min(values.length, head.length) - 1)),
                ),
            );
        return h(
            context,
            "table",
            null,
            createElement("thead", null, row(head, "th", tail && !rows.length)),
            rows.length ? createElement("tbody", null, ...rows.map((values, index) => row(values, "td", tail && index === rows.length - 1))) : null,
        );
    }
    const paragraph = text(source.replace(/^[ \t]+/gm, "").trimEnd(), context, tail);
    return tight ? createElement(Fragment, null, ...paragraph) : h(context, "p", null, ...paragraph);
}

/** A finished block renders once; only the one at the streaming end renders again as text arrives. */
const Block = memo(function Block({ source, context, tail }: MarkdownBlockProps) {
    return <>{block(source, context, tail, false)}</>;
});

/**
 * Renders Markdown safely, as React elements in Prose: no HTML is ever injected, raw HTML shows as text and only http,
 * https, mailto and relative links are followed. It's built for an agent's answer as it streams: the unfinished end
 * never flashes raw syntax, and the blocks above it aren't rendered again.
 */
export function Markdown({
    children,
    content,
    streaming = false,
    caret = false,
    size = "chat",
    allowImages = false,
    headingOffset = 0,
    components,
    onLinkClick,
    className,
    ...props
}: MarkdownProps) {
    const onClick = useRef(onLinkClick);
    onClick.current = onLinkClick;
    const context = useMemo<MarkdownContext>(
        () => ({ components, allowImages, headingOffset, caret, click: (event, href) => onClick.current?.(event, href) }),
        [components, allowImages, headingOffset, caret],
    );

    let source = (content ?? children ?? "").replace(/\r\n?/g, "\n");
    if (streaming) source = source.replace(PENDING, "");
    const parts = split(source);

    return (
        <Prose
            size={size === "article" ? "md" : "sm"}
            className={cx("ow-markdown", className)}
            aria-busy={streaming || undefined}
            {...props}
        >
            {parts.map((part, index) => (
                <Block key={index} source={part} context={context} tail={streaming && index === parts.length - 1} />
            ))}
            {streaming && caret && !parts.length ? <p>{text("", context, true)}</p> : null}
        </Prose>
    );
}
