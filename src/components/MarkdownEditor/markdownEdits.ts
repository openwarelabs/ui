import type { MarkdownEdit, MarkdownEditorTool } from "./MarkdownEditor.types";

/*
 * The edits each tool makes, as pure functions of the text and the selection. Each returns what to put where and
 * what to select afterwards, or null when there's nothing to do; the component applies it to the textarea.
 */

/** The inline markers, for the tools that wrap a run of text. */
const inlineMarkers: Partial<Record<MarkdownEditorTool, string>> = {
    bold: "**",
    italic: "_",
    strikethrough: "~~",
    code: "`",
};

/** The prefix of a list item or quote: its indent, the marker (with a task box) and the space after. */
const LINE_PREFIX = /^(\s*)(?:([-*+])(\s+\[[ xX]\])?|(\d+)[.)]|(>)|(#{1,6}))\s+/;

/** The start and end of the line(s) the selection touches. */
function lineBounds(value: string, start: number, end: number) {
    const from = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", end);
    return { from, to: lineEnd === -1 ? value.length : lineEnd };
}

/** The word around a caret, when it sits inside one (no selection). */
function wordAround(value: string, caret: number) {
    const isWord = (char: string | undefined) => !!char && !/\s/.test(char);
    if (!isWord(value[caret - 1]) && !isWord(value[caret])) return null;
    let start = caret;
    let end = caret;
    while (isWord(value[start - 1])) start -= 1;
    while (isWord(value[end])) end += 1;
    return { start, end };
}

/** Wraps the selection (or the word at the caret) in `marker`, or takes the markers off when they're already there. */
export function toggleInline(value: string, start: number, end: number, marker: string): MarkdownEdit {
    let from = start;
    let to = end;
    if (from === to) {
        const word = wordAround(value, from);
        if (word) ({ start: from, end: to } = word);
    }
    const length = marker.length;
    // The markers are just outside the selection ("**bold**" with "bold" selected): take them off.
    if (value.slice(from - length, from) === marker && value.slice(to, to + length) === marker) {
        return {
            start: from - length,
            end: to + length,
            text: value.slice(from, to),
            selectionStart: from - length,
            selectionEnd: to - length,
        };
    }
    const selected = value.slice(from, to);
    // The selection holds its own markers ("**bold**" selected): take them off.
    if (selected.length >= length * 2 && selected.startsWith(marker) && selected.endsWith(marker)) {
        const inner = selected.slice(length, -length);
        return { start: from, end: to, text: inner, selectionStart: from, selectionEnd: from + inner.length };
    }
    return {
        start: from,
        end: to,
        text: marker + selected + marker,
        selectionStart: from + length,
        selectionEnd: from + length + selected.length,
    };
}

/** What the tools that mark lines put at the start of each: the quote mark, a bullet, a number, a task box. */
export function linePrefix(tool: MarkdownEditorTool, index: number): string {
    switch (tool) {
        case "quote":
            return "> ";
        case "bulletList":
            return "- ";
        case "numberedList":
            return `${String(index + 1)}. `;
        case "taskList":
            return "- [ ] ";
        default:
            return "";
    }
}

/** Whether a line already carries this tool's prefix. */
export function hasPrefix(tool: MarkdownEditorTool, line: string): boolean {
    const match = LINE_PREFIX.exec(line);
    if (!match) return false;
    const [, , bullet, task, number, quote] = match;
    switch (tool) {
        case "quote":
            return !!quote;
        case "bulletList":
            return !!bullet && !task;
        case "numberedList":
            return !!number;
        case "taskList":
            return !!task;
        default:
            return false;
    }
}

/**
 * Puts a line prefix on every selected line, or takes it off when every one already has it. A line with another
 * list's or the quote's prefix swaps it for this one.
 */
export function toggleLines(value: string, start: number, end: number, tool: MarkdownEditorTool): MarkdownEdit {
    const { from, to } = lineBounds(value, start, end);
    const lines = value.slice(from, to).split("\n");
    const allHave = lines.every((line) => hasPrefix(tool, line));
    const next = lines.map((line, index) => {
        const match = LINE_PREFIX.exec(line);
        // Headings keep their marks; the prefix goes before them.
        const stripped = match && !match[6] ? line.slice(match[0].length) : line;
        const indent = match && !match[6] ? match[1]! : "";
        return allHave ? indent + stripped : indent + linePrefix(tool, index) + stripped;
    });
    const text = next.join("\n");
    const grew = text.length - (to - from);
    const firstDelta = next[0]!.length - lines[0]!.length;
    return {
        start: from,
        end: to,
        text,
        // A caret stays by its text; a selection covers the whole lines again.
        selectionStart: start === end ? Math.max(from, start + firstDelta) : from,
        selectionEnd: start === end ? Math.max(from, start + firstDelta) : to + grew,
    };
}

/** Cycles the heading of the first selected line: none → `#` → `##` → `###` → none. */
export function cycleHeading(value: string, start: number, end: number): MarkdownEdit {
    const { from } = lineBounds(value, start, start);
    const lineEnd = value.indexOf("\n", from);
    const to = lineEnd === -1 ? value.length : lineEnd;
    const line = value.slice(from, to);
    const match = /^(#{1,6})\s+/.exec(line);
    const level = match ? match[1]!.length : 0;
    const rest = match ? line.slice(match[0].length) : line;
    const nextLevel = level >= 3 ? 0 : level + 1;
    const prefix = nextLevel ? `${"#".repeat(nextLevel)} ` : "";
    const delta = prefix.length - (match ? match[0].length : 0);
    const caret = Math.max(from, start + delta);
    return {
        start: from,
        end: to,
        text: prefix + rest,
        selectionStart: caret,
        selectionEnd: start === end ? caret : Math.max(from, end + delta),
    };
}

/** Fences the selected lines as a code block, or unfences them when they're one already. */
export function toggleCodeBlock(value: string, start: number, end: number): MarkdownEdit {
    const { from, to } = lineBounds(value, start, end);
    const block = value.slice(from, to);
    const fenced = /^```[^\n]*\n([\s\S]*?)\n?```$/.exec(block);
    if (fenced) {
        const inner = fenced[1] ?? "";
        return { start: from, end: to, text: inner, selectionStart: from, selectionEnd: from + inner.length };
    }
    // A fence around the lines just above and below: take it off from there.
    const before = value.lastIndexOf("\n", from - 2);
    const above = value.slice(before + 1, Math.max(before + 1, from - 1));
    const below = value.slice(to + 1, value.indexOf("\n", to + 1) === -1 ? value.length : value.indexOf("\n", to + 1));
    if (/^```[^\n]*$/.test(above) && /^```\s*$/.test(below)) {
        const outerStart = before + 1;
        const outerEnd = to + 1 + below.length;
        return { start: outerStart, end: outerEnd, text: block, selectionStart: outerStart, selectionEnd: outerStart + block.length };
    }
    const text = `\`\`\`\n${block}\n\`\`\``;
    // Nothing selected: the caret goes after the opening fence, to type the language or the code.
    const caret = from + 3;
    return {
        start: from,
        end: to,
        text,
        selectionStart: block ? from + 4 : caret,
        selectionEnd: block ? from + 4 + block.length : caret,
    };
}

const URL_LIKE = /^(?:https?:\/\/|mailto:|www\.)\S+$/i;

/** Makes the selection a link: a URL becomes the target with the text to fill in, anything else the text with the URL to fill in. */
export function insertLink(value: string, start: number, end: number): MarkdownEdit {
    const selected = value.slice(start, end);
    if (selected && URL_LIKE.test(selected)) {
        return { start, end, text: `[](${selected})`, selectionStart: start + 1, selectionEnd: start + 1 };
    }
    const text = selected || "text";
    const result = `[${text}](url)`;
    return selected
        ? { start, end, text: result, selectionStart: start + text.length + 3, selectionEnd: start + text.length + 6 }
        : { start, end, text: result, selectionStart: start + 1, selectionEnd: start + 1 + text.length };
}

/** Puts a rule on a line of its own after the current line. */
export function insertDivider(value: string, start: number, end: number): MarkdownEdit {
    const { to } = lineBounds(value, start, end);
    const atStart = to === 0 || value[to - 1] === "\n";
    const text = `${atStart ? "" : "\n\n"}---\n\n`;
    const caret = to + text.length;
    return { start: to, end: to, text, selectionStart: caret, selectionEnd: caret };
}

/** The edit a tool makes with this selection. */
export function editFor(tool: MarkdownEditorTool, value: string, start: number, end: number): MarkdownEdit | null {
    const marker = inlineMarkers[tool];
    if (marker) return toggleInline(value, start, end, marker);
    switch (tool) {
        case "heading":
            return cycleHeading(value, start, end);
        case "link":
            return insertLink(value, start, end);
        case "codeBlock":
            return toggleCodeBlock(value, start, end);
        case "divider":
            return insertDivider(value, start, end);
        case "quote":
        case "bulletList":
        case "numberedList":
        case "taskList":
            return toggleLines(value, start, end, tool);
        default:
            return null;
    }
}

/** Whether the format is on at the selection, for the buttons' aria-pressed. */
export function isActive(tool: MarkdownEditorTool, value: string, start: number, end: number): boolean {
    const marker = inlineMarkers[tool];
    if (marker) {
        let from = start;
        let to = end;
        if (from === to) {
            const word = wordAround(value, from);
            if (!word) return false;
            ({ start: from, end: to } = word);
        }
        const selected = value.slice(from, to);
        const length = marker.length;
        if (value.slice(from - length, from) === marker && value.slice(to, to + length) === marker) return true;
        return selected.length > length * 2 && selected.startsWith(marker) && selected.endsWith(marker);
    }
    const { from } = lineBounds(value, start, start);
    const lineEnd = value.indexOf("\n", from);
    const line = value.slice(from, lineEnd === -1 ? value.length : lineEnd);
    if (tool === "heading") return /^#{1,6}\s/.test(line);
    return hasPrefix(tool, line);
}

/**
 * What Enter inserts at the end of a list item: a new line with the same marker (the next number for a numbered
 * list, an empty box for a task). On an item with nothing in it, Enter ends the list instead. Null means a plain Enter.
 */
export function continueList(value: string, caret: number): MarkdownEdit | null {
    const { from } = lineBounds(value, caret, caret);
    const line = value.slice(from, caret);
    const match = LINE_PREFIX.exec(line);
    if (!match || match[6]) return null;
    const [whole, indent, bullet, task, number] = match;
    const content = line.slice(whole.length);
    const lineEnd = value.indexOf("\n", caret);
    const restOfLine = value.slice(caret, lineEnd === -1 ? value.length : lineEnd);
    if (!content.trim() && !restOfLine.trim()) {
        // Empty item: Enter takes the marker off and ends the list.
        return { start: from, end: caret, text: indent ?? "", selectionStart: from + (indent ?? "").length, selectionEnd: from + (indent ?? "").length };
    }
    let prefix: string;
    if (number) prefix = `${String(Number(number) + 1)}. `;
    else if (task) prefix = `${bullet!} [ ] `;
    else if (bullet) prefix = `${bullet} `;
    else prefix = "> ";
    const text = `\n${indent ?? ""}${prefix}`;
    return { start: caret, end: caret, text, selectionStart: caret + text.length, selectionEnd: caret + text.length };
}
