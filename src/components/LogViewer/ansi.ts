import type { AnsiSegment, AnsiStyle } from "./LogViewer.types";

// An escape sequence: a CSI (`ESC [ params final`), an OSC (`ESC ] … BEL` or `ESC ] … ESC \`), or a two-character one.
const escapePattern = /\x1b(?:\[([0-9;:?]*)([ -/]*[@-~])|\]([^\x07\x1b]*)(?:\x07|\x1b\\)|[@-Z\\-_])/g;

/** The colour of a 256-colour code as CSS: the 16 named ones stay indexes. */
function colour256(code: number): number | string | undefined {
    if (!(code >= 0 && code <= 255)) return undefined;
    if (code < 16) return code;
    if (code >= 232) {
        const grey = 8 + (code - 232) * 10;
        return `rgb(${grey},${grey},${grey})`;
    }
    const cube = code - 16;
    const level = (n: number) => (n ? 55 + n * 40 : 0);
    return `rgb(${level(Math.floor(cube / 36))},${level(Math.floor(cube / 6) % 6)},${level(cube % 6)})`;
}

/** Applies one SGR sequence's parameters to a style. */
function applySgr(params: string, style: AnsiStyle): AnsiStyle {
    const next = { ...style };
    const codes = params === "" ? [0] : params.split(/[;:]/).map((part) => (part === "" ? 0 : Number(part)));
    for (let index = 0; index < codes.length; index++) {
        const code = codes[index]!;
        if (code === 0) {
            for (const key of Object.keys(next) as Array<keyof AnsiStyle>) delete next[key];
        } else if (code === 1) next.bold = true;
        else if (code === 2) next.dim = true;
        else if (code === 3) next.italic = true;
        else if (code === 4) next.underline = true;
        else if (code === 7) next.inverse = true;
        else if (code === 9) next.strike = true;
        else if (code === 22) {
            delete next.bold;
            delete next.dim;
        } else if (code === 23) delete next.italic;
        else if (code === 24) delete next.underline;
        else if (code === 27) delete next.inverse;
        else if (code === 29) delete next.strike;
        else if (code >= 30 && code <= 37) next.fg = code - 30;
        else if (code >= 90 && code <= 97) next.fg = code - 90 + 8;
        else if (code === 39) delete next.fg;
        else if (code >= 40 && code <= 47) next.bg = code - 40;
        else if (code >= 100 && code <= 107) next.bg = code - 100 + 8;
        else if (code === 49) delete next.bg;
        else if (code === 38 || code === 48) {
            // Extended colours: `38;5;n` from the 256-colour table, `38;2;r;g;b` as 24-bit.
            const key = code === 38 ? "fg" : "bg";
            const kind = codes[index + 1];
            if (kind === 5) {
                const value = colour256(codes[index + 2] ?? -1);
                if (value !== undefined) next[key] = value;
                index += 2;
            } else if (kind === 2) {
                const [r, g, b] = [codes[index + 2], codes[index + 3], codes[index + 4]];
                if (r !== undefined && g !== undefined && b !== undefined) next[key] = `rgb(${r & 255},${g & 255},${b & 255})`;
                index += 4;
            }
        }
    }
    return next;
}

/**
 * Splits a line of terminal output into runs of text with the style the ANSI SGR codes before each one set: the 16
 * colours, the 256-colour table and 24-bit colours, bold, dim, italic, underline, inverse and strikethrough. Every
 * other escape sequence (cursor moves, hyperlinks, titles) is removed.
 */
export function parseAnsi(text: string): AnsiSegment[] {
    const segments: AnsiSegment[] = [];
    let style: AnsiStyle = {};
    let last = 0;
    escapePattern.lastIndex = 0;
    for (let match = escapePattern.exec(text); match; match = escapePattern.exec(text)) {
        if (match.index > last) segments.push({ text: text.slice(last, match.index), style });
        if (match[2] === "m") style = applySgr(match[1] ?? "", style);
        last = match.index + match[0].length;
    }
    if (last < text.length) segments.push({ text: text.slice(last), style });
    return segments;
}

/** The text of a line without its ANSI escape sequences: what gets copied, saved and searched. */
export function stripAnsi(text: string): string {
    return text.includes("\x1b") ? text.replace(escapePattern, "") : text;
}
