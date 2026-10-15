import type { DiffFile, DiffLine, DiffRow, DiffSegment } from "./DiffViewer.types";

const SAME = 0;
const DEL = 1;
const ADD = 2;

/**
 * Myers' diff of two lists of ids: one op per step, SAME, DEL (from `a`) or ADD (from `b`). The common start and end
 * are trimmed first. Past `limit` edits it gives up on the middle, which then reads as all removed and all added,
 * so two unrelated files can't take long or much memory.
 */
function myers(a: number[], b: number[], limit: number): number[] {
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) start++;
    let endA = a.length;
    let endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
        endA--;
        endB--;
    }
    const n = endA - start;
    const m = endB - start;
    const offset = n + m + 1;
    const v = new Int32Array(2 * offset + 1);
    // The furthest x on each diagonal after each number of edits, kept for the walk back.
    const trace: Int32Array[] = [];
    let found = -1;
    for (let d = 0; d <= Math.min(n + m, limit) && found < 0; d++) {
        for (let k = -d; k <= d; k += 2) {
            let x = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!) ? v[offset + k + 1]! : v[offset + k - 1]! + 1;
            let y = x - k;
            while (x < n && y < m && a[start + x] === b[start + y]) {
                x++;
                y++;
            }
            v[offset + k] = x;
            if (x >= n && y >= m) {
                found = d;
                break;
            }
        }
        trace.push(v.slice(offset - d, offset + d + 1));
    }

    const middle: number[] = [];
    if (found < 0) {
        for (let i = 0; i < m; i++) middle.push(ADD);
        for (let i = 0; i < n; i++) middle.push(DEL);
    } else {
        let x = n;
        let y = m;
        for (let d = found; d > 0; d--) {
            const previous = trace[d - 1]!;
            const k = x - y;
            const down = k === -d || (k !== d && previous[k - 1 + d - 1]! < previous[k + 1 + d - 1]!);
            const prevK = down ? k + 1 : k - 1;
            const prevX = previous[prevK + d - 1]!;
            const prevY = prevX - prevK;
            while (x > prevX && y > prevY) {
                middle.push(SAME);
                x--;
                y--;
            }
            middle.push(down ? ADD : DEL);
            x = prevX;
            y = prevY;
        }
        while (x-- > 0) middle.push(SAME);
    }
    return [...Array<number>(start).fill(SAME), ...middle.reverse(), ...Array<number>(a.length - endA).fill(SAME)];
}

/** Gives equal strings equal ids, so the diff compares numbers. */
function toIds(lists: string[][]): number[][] {
    const ids = new Map<string, number>();
    return lists.map((list) =>
        list.map((item) => {
            let id = ids.get(item);
            if (id === undefined) ids.set(item, (id = ids.size));
            return id;
        }),
    );
}

const tokenise = (line: string) => line.match(/\w+|\s+|[^\w\s]/g) ?? [];

/** The words that changed between a removed line and the added line it pairs with, if the two are alike enough. */
function wordDiff(before: string, after: string): [DiffSegment[], DiffSegment[]] | undefined {
    const a = tokenise(before);
    const b = tokenise(after);
    if (a.length + b.length > 400) return undefined;
    const [ia = [], ib = []] = toIds([a, b]);
    const sides: [DiffSegment[], DiffSegment[]] = [[], []];
    const push = (side: DiffSegment[], text: string, changed: boolean) => {
        const last = side[side.length - 1];
        if (last && last.changed === changed) last.text += text;
        else side.push({ text, changed });
    };
    let i = 0;
    let j = 0;
    let common = 0;
    for (const op of myers(ia, ib, 100)) {
        if (op === SAME) {
            common += a[i]!.length;
            push(sides[0], a[i++]!, false);
            push(sides[1], b[j++]!, false);
        } else if (op === DEL) push(sides[0], a[i++]!, true);
        else push(sides[1], b[j++]!, true);
    }
    // Lines that share little are simply replaced: marking nearly every word helps no one.
    return common * 2 >= Math.max(before.length, after.length) ? sides : undefined;
}

/** The removed and the added lines in the run of changes from `at`, and where the run ends. */
function changes<T>(list: T[], at: number, line: (item: T | undefined) => DiffLine | undefined): [DiffLine[], DiffLine[], number] {
    const removed: DiffLine[] = [];
    const added: DiffLine[] = [];
    for (let next = line(list[at]); next && (next.type === "add" || next.type === "del"); next = line(list[++at])) {
        (next.type === "del" ? removed : added).push(next);
    }
    return [removed, added, at];
}

/** Puts each run of changes in order, removed lines then added ones, and marks the words that changed in pairs. */
function settle(lines: DiffLine[], words: boolean): DiffLine[] {
    const out: DiffLine[] = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index]!;
        if (line.type !== "add" && line.type !== "del") {
            out.push(line);
            index++;
            continue;
        }
        const [removed, added, end] = changes(lines, index, (item) => item);
        index = end;
        if (words) {
            removed.forEach((old, pair) => {
                const fresh = added[pair];
                const marked = fresh && wordDiff(old.text, fresh.text);
                if (fresh && marked) [old.words, fresh.words] = marked;
            });
        }
        out.push(...removed, ...added);
    }
    return out;
}

const splitLines = (text: string) => (text === "" ? [] : text.replace(/\r?\n$/, "").split(/\r?\n/));

/** The line-by-line diff of two texts. */
export function diffText(oldValue: string, newValue: string, words: boolean): DiffLine[] {
    const a = splitLines(oldValue);
    const b = splitLines(newValue);
    const [ia = [], ib = []] = toIds([a, b]);
    const lines: DiffLine[] = [];
    let oldNo = 0;
    let newNo = 0;
    for (const op of myers(ia, ib, 1000)) {
        if (op === SAME) lines.push({ type: "same", text: b[newNo]!, oldNo: ++oldNo, newNo: ++newNo });
        else if (op === DEL) lines.push({ type: "del", text: a[oldNo]!, oldNo: ++oldNo });
        else lines.push({ type: "add", text: b[newNo]!, newNo: ++newNo });
    }
    return settle(lines, words);
}

/** "a/src/app.ts\t2024-01-01" → "src/app.ts"; "/dev/null" → undefined. */
const fileName = (raw: string) => {
    const name = raw.replace(/\t.*$/, "").trim();
    return name === "/dev/null" ? undefined : name.replace(/^[ab]\//, "");
};

/** Reads a unified diff: its files, their hunks and lines. Anything else (a commit message, index lines) is skipped. */
export function parsePatch(patch: string, words: boolean): DiffFile[] {
    const files: DiffFile[] = [];
    let file: DiffFile | undefined;
    let oldNo = 0;
    let newNo = 0;
    let oldLeft = 0;
    let newLeft = 0;
    const start = (oldName?: string, newName?: string) => {
        file = { oldName, newName, lines: [], text: "" };
        files.push(file);
        return file;
    };
    const rows = patch.replace(/\r?\n$/, "").split(/\r?\n/);
    rows.forEach((raw, index) => {
        const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(raw);
        const sign = raw[0];
        // A file's "---" and "+++" header ends a hunk whose counts were off, as hand-written patches' often are.
        const header = raw.startsWith("--- ") && rows[index + 1]?.startsWith("+++ ");
        if ((oldLeft > 0 || newLeft > 0) && file && !header && (!sign || " +-\\".includes(sign))) {
            const text = raw.slice(1);
            if (sign === "+") {
                file.lines.push({ type: "add", text, newNo: newNo++ });
                newLeft--;
            } else if (sign === "-") {
                file.lines.push({ type: "del", text, oldNo: oldNo++ });
                oldLeft--;
            } else if (sign !== "\\") {
                file.lines.push({ type: "same", text, oldNo: oldNo++, newNo: newNo++ });
                oldLeft--;
                newLeft--;
            }
        } else if (hunk) {
            file ??= start();
            file.lines.push({ type: "hunk", text: raw });
            oldNo = Number(hunk[1]);
            newNo = Number(hunk[3]);
            oldLeft = Number(hunk[2] ?? 1);
            newLeft = Number(hunk[4] ?? 1);
        } else if (raw.startsWith("diff --git ")) {
            const names = / a\/(.*) b\/(.*)$/.exec(raw);
            start(names?.[1], names?.[2]);
        } else if (header) {
            oldLeft = newLeft = 0;
            if (!file || file.lines.length) start();
            file!.oldName = fileName(raw.slice(4));
        } else if (raw.startsWith("+++ ") && file) {
            file.newName = fileName(raw.slice(4));
        }
        if (file) file.text += `${raw}\n`;
    });
    for (const each of files) each.lines = settle(each.lines, words);
    return files;
}

/**
 * The rows a file shows: its lines, with runs of unchanged lines beyond `context` of a change folded into a gap,
 * unless that gap was opened. A file's first and last runs only keep the lines next to a change.
 */
export function toRows(lines: DiffLine[], context: number, opened: number[], split: boolean): DiffRow[] {
    const rows: DiffRow[] = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index]!;
        if (line.type !== "same") {
            rows.push({ kind: "line", line });
            index++;
            continue;
        }
        let end = index;
        while (lines[end]?.type === "same") end++;
        const first = index === 0 || lines[index - 1]!.type === "hunk";
        const last = end === lines.length || lines[end]!.type === "hunk";
        const before = first ? 0 : context;
        const after = last ? 0 : context;
        const hidden = end - index - before - after;
        for (let at = index; at < end; at++) {
            if (hidden > 1 && at === index + before && !opened.includes(at)) {
                rows.push({ kind: "gap", gap: at, count: hidden });
                at += hidden - 1;
            } else rows.push({ kind: "line", line: lines[at]!, reveal: hidden > 1 && at === index + before ? at : undefined });
        }
        index = end;
    }
    if (!split) return rows;

    // Side by side: unchanged lines on both sides, and each removed line beside the added line it pairs with.
    const pairs: DiffRow[] = [];
    for (let at = 0; at < rows.length; ) {
        const row = rows[at]!;
        if (row.kind !== "line" || row.line.type === "hunk" || row.line.type === "same") {
            pairs.push(row.kind === "line" && row.line.type === "same" ? { kind: "pair", left: row.line, right: row.line, reveal: row.reveal } : row);
            at++;
            continue;
        }
        const [removed, added, end] = changes(rows, at, (item) => (item?.kind === "line" ? item.line : undefined));
        at = end;
        for (let pair = 0; pair < Math.max(removed.length, added.length); pair++) {
            pairs.push({ kind: "pair", left: removed[pair], right: added[pair] });
        }
    }
    return pairs;
}
