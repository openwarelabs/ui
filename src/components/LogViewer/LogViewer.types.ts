import type { ReactNode } from "react";

/** One line with the time it was written, in place of a plain string. */
export interface LogViewerEntry {
    /** Shown in a muted column before the text, as given: "12:04:31", "+1.2s". */
    time?: string;
    /** The line, with any ANSI escape codes. */
    text: string;
}

export type LogViewerLine = string | LogViewerEntry;

/** The levels a line's gutter is tinted for. */
export type LogViewerLevel = "error" | "warn" | "info" | "debug";

export interface LogViewerLabels {
    /** The button that appears once the reader scrolls up.
     * @default "Jump to latest" */
    jump?: string;
    /** How that button counts the lines that arrived while the reader was scrolled up.
     * @default (count) => `${count} new` */
    newCount?(count: number): string;
    /** The search box's placeholder and name.
     * @default "Search log" */
    search?: string;
    /** The match counter.
     * @default (current, total) => `${current} of ${total}` */
    matches?(current: number, total: number): string;
    /** @default "No matches" */
    noMatches?: string;
    /** @default "Previous match" */
    previous?: string;
    /** @default "Next match" */
    next?: string;
    /** @default "Copy log" */
    copy?: string;
    /** @default "Copied" */
    copied?: string;
    /** @default "Download log" */
    download?: string;
    /** Read out while `streaming` is on.
     * @default "Streaming" */
    streaming?: string;
}

export interface LogViewerProps {
    /** The lines, newest last: strings, or `{ time, text }` entries. Pass this or `text`. */
    lines?: readonly LogViewerLine[];
    /** The whole log as one string, split on newlines. Pass this or `lines`. */
    text?: string;
    /** Opens at the end and keeps the newest line in view as lines arrive, while the reader is at the end. Scrolling
     * up to read stops it and shows a "Jump to latest" button; scrolling back to the end starts it again.
     * @default true */
    follow?: boolean;
    /** Reads ANSI SGR escape codes (`\x1b[31m`) for colour, bold, dim, italic, underline, inverse and strikethrough,
     * with the 16 named colours, the 256-colour cube and 24-bit colours. Other escape sequences are removed. Off, the
     * codes show as they are.
     * @default true */
    ansi?: boolean;
    /** Numbers the lines in the gutter. With `maxLines`, numbering carries on from the lines dropped.
     * @default false */
    lineNumbers?: boolean;
    /** Wraps long lines instead of scrolling sideways. Wrapped rows are measured as they render, so the scrollbar
     * settles as they're seen.
     * @default false */
    wrap?: boolean;
    /** Shows the `time` of entries that have one, in a column before the text.
     * @default true */
    timestamps?: boolean;
    /** The height of the log, in pixels or any CSS length.
     * @default 320 */
    height?: number | string;
    /** Keeps only the last this many lines; older ones are dropped. */
    maxLines?: number;
    /** A search box in the toolbar. Matching text is highlighted, and the buttons (or Enter and Shift+Enter) move
     * between matches.
     * @default false */
    searchable?: boolean;
    /** Tints the gutter of lines that start with a level, such as `ERROR`, `WARN`, `INFO` or `DEBUG` (`FATAL` and
     * `TRACE` count too, and `[INFO]` or a time before it is fine). A function decides the level of a line itself.
     * @default false */
    levels?: boolean | ((text: string) => LogViewerLevel | undefined);
    /** Controls at the end of the toolbar. */
    toolbar?: ReactNode;
    /** A button that copies the whole log, without the ANSI codes.
     * @default false */
    copyable?: boolean;
    /** A button that saves the whole log as a text file, without the ANSI codes.
     * @default false */
    downloadable?: boolean;
    /** The downloaded file's name.
     * @default "log.txt" */
    downloadName?: string;
    /** More is on its way: a blinking cursor after the last line.
     * @default false */
    streaming?: boolean;
    /** Whether screen readers hear new lines as they arrive. They're read only while the view follows the end, so
     * scrolling up to read also stops the announcements. Turn it off for a log that writes many lines a second.
     * @default true */
    announce?: boolean;
    /** Names the log for screen readers: "Build output". */
    label: string;
    /** The words it uses, for other languages. */
    labels?: LogViewerLabels;
    id?: string;
    className?: string;
}

export interface LogViewerHandle {
    /** Scrolls to the last line and follows new lines again. `behavior: "smooth"` animates, except under reduced
     * motion. */
    scrollToEnd(options?: { behavior?: ScrollBehavior }): void;
    /** Scrolls a line (from 0) into view, and stops following the end. */
    scrollToLine(index: number): void;
    /** The element that scrolls. */
    readonly element: HTMLDivElement | null;
}

/** How a run of text is styled by the ANSI codes before it. */
export interface AnsiStyle {
    /** A named colour (0 to 15), or any CSS colour from a 256-colour or 24-bit code. */
    fg?: number | string;
    bg?: number | string;
    bold?: boolean;
    dim?: boolean;
    italic?: boolean;
    underline?: boolean;
    inverse?: boolean;
    strike?: boolean;
}

export interface AnsiSegment {
    text: string;
    style: AnsiStyle;
}

/** A line as the viewer holds it. */
export interface LogViewerRow {
    time?: string;
    /** The text with its ANSI codes. */
    raw: string;
    /** The text without them. */
    plain: string;
}
