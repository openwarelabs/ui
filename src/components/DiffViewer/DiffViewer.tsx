import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { CopyButton } from "@/components/CodeBlock/CodeBlock";
import { ChevronsUpDownIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { diffText, parsePatch, toRows } from "./diff";
import type { DiffFile, DiffLine, DiffTableProps, DiffViewerProps } from "./DiffViewer.types";

export type { DiffViewerLabels, DiffViewerProps } from "./DiffViewer.types";

/** No gaps opened. */
const closed: number[] = [];

const lines = (count: number) => `${count} ${count === 1 ? "line" : "lines"}`;

const defaultLabels = {
    added: "Added",
    removed: "Removed",
    oldLine: "Old line",
    newLine: "New line",
    line: "Line",
    before: "Before",
    after: "After",
    summary: (added: number, removed: number) => `${lines(added)} added, ${removed} removed`,
    expand: (count: number) => `Show ${count} unchanged ${count === 1 ? "line" : "lines"}`,
    copy: "Copy",
    noChanges: "No changes",
    renamed: "renamed to",
};

/**
 * A code diff on the code block's night ground: from two versions of a text or from a unified patch, shown unified or
 * side by side. Changed lines are tinted green or red with a "+" or "−" and read out as "Added" or "Removed"; the
 * words that changed within them are marked; long runs of unchanged lines fold into buttons that show them.
 */
export function DiffViewer({
    oldValue,
    newValue,
    patch,
    view = "unified",
    splitMinWidth = 500,
    language,
    filename,
    oldFilename,
    context = 3,
    wrap = false,
    showLineNumbers = true,
    wordDiff = true,
    copyable = true,
    maxHeight,
    labels: labelsProp,
    className,
    ...props
}: DiffViewerProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [narrow, setNarrow] = useState(false);
    const labels = { ...defaultLabels, ...labelsProp };

    const files = useMemo(() => {
        if (patch === undefined) {
            return [{ oldName: oldFilename, newName: filename, lines: diffText(oldValue ?? "", newValue ?? "", wordDiff), text: newValue ?? "" }];
        }
        const parsed = parsePatch(patch, wordDiff);
        if (parsed.length === 1 && filename) parsed[0] = { ...parsed[0]!, newName: filename, oldName: oldFilename ?? filename };
        return parsed;
    }, [oldValue, newValue, patch, filename, oldFilename, wordDiff]);

    const wantSplit = view === "split" && splitMinWidth > 0;
    useEffect(() => {
        const root = rootRef.current;
        if (!wantSplit || !root) return;
        const observer = new ResizeObserver(([entry]) => setNarrow((entry?.contentRect.width ?? splitMinWidth) < splitMinWidth));
        observer.observe(root);
        return () => observer.disconnect();
    }, [wantSplit, splitMinWidth]);

    return (
        <div ref={rootRef} className={cx("ow-diff", className)} {...props}>
            {files.map((file, index) => (
                <DiffTable
                    key={index}
                    file={file}
                    split={view === "split" && !(wantSplit && narrow)}
                    context={context}
                    wrap={wrap}
                    showLineNumbers={showLineNumbers}
                    copyable={copyable}
                    language={language}
                    maxHeight={maxHeight}
                    labels={labels}
                />
            ))}
        </div>
    );
}

/** One file: its header with the counts, and its lines in a table. */
function DiffTable({ file, split, context, wrap, showLineNumbers, copyable, language, maxHeight, labels }: DiffTableProps) {
    const tableRef = useRef<HTMLTableElement>(null);
    // The gaps that were opened, kept with the file they belong to so a new diff starts folded again.
    const [opened, setOpened] = useState<{ of: DiffFile; gaps: number[] }>({ of: file, gaps: [] });
    const gaps = opened.of === file ? opened.gaps : closed;
    const revealed = useRef<number>(-1);
    const rows = useMemo(() => toRows(file.lines, context, gaps, split), [file, context, gaps, split]);

    // After a gap opens its button is gone, so the keyboard moves to the first line it showed.
    useEffect(() => {
        if (revealed.current < 0) return;
        tableRef.current?.querySelector<HTMLElement>(`[data-reveal="${revealed.current}"]`)?.focus();
        revealed.current = -1;
    }, [gaps]);

    let added = 0;
    let removed = 0;
    let last = 0;
    for (const line of file.lines) {
        if (line.type === "add") added++;
        if (line.type === "del") removed++;
        last = Math.max(last, line.oldNo ?? 0, line.newNo ?? 0);
    }
    const name = file.newName ?? file.oldName;
    const renamed = file.oldName && file.newName && file.oldName !== file.newName;
    const columns = (showLineNumbers ? 2 : 0) + (split ? 2 : 1);

    const number = (line: DiffLine | undefined, side: "oldNo" | "newNo") =>
        showLineNumbers ? <td className={cx("ow-diff__num", line && `ow-diff__${line.type}`)}>{line?.[side]}</td> : null;

    const code = (line: DiffLine | undefined, reveal?: number) => (
        <td
            className={cx("ow-diff__code", line ? `ow-diff__${line.type}` : "ow-diff__empty")}
            tabIndex={reveal === undefined ? undefined : -1}
            data-reveal={reveal}
        >
            {line ? (
                <>
                    <span className="ow-diff__sign" aria-hidden="true">
                        {line.type === "add" ? "+" : line.type === "del" ? "−" : " "}
                    </span>
                    {line.type === "same" ? null : (
                        <span className="ow-visually-hidden">{`${line.type === "add" ? labels.added : labels.removed}: `}</span>
                    )}
                    {line.words
                        ? line.words.map((segment, index) =>
                              segment.changed ? (
                                  <span key={index} className="ow-diff__word">
                                      {segment.text}
                                  </span>
                              ) : (
                                  segment.text
                              ),
                          )
                        : line.text}
                </>
            ) : null}
        </td>
    );

    const wide = (content: ReactNode, rowClass: string, key: number | string) => (
        <tr key={key} className={rowClass}>
            <td colSpan={columns}>{content}</td>
        </tr>
    );

    return (
        <div className="ow-code-block ow-diff__file">
            <div className="ow-code-block__header">
                <span className="ow-code-block__title">
                    {renamed ? (
                        <>
                            {file.oldName}
                            <span aria-hidden="true"> → </span>
                            <span className="ow-visually-hidden"> {labels.renamed} </span>
                        </>
                    ) : null}
                    {name}
                </span>
                <span className="ow-diff__counts" aria-hidden="true">
                    <span className="ow-diff__added">+{added}</span> <span className="ow-diff__removed">−{removed}</span>
                </span>
                {language ? <span className="ow-code-block__language">{language}</span> : null}
                {copyable && file.text ? <CopyButton value={file.text} tone="onDark" iconOnly label={labels.copy} /> : null}
            </div>
            <div className="ow-diff__scroll" style={maxHeight ? { maxHeight } : undefined} tabIndex={0} dir="ltr">
                <table
                    ref={tableRef}
                    className={cx("ow-diff__table", split && "ow-diff__table--split", (wrap || split) && "ow-diff__table--wrap")}
                    style={{ "--ow-diff-digits": String(last).length } as CSSProperties}
                >
                    <caption className="ow-visually-hidden">{[name, labels.summary(added, removed)].filter(Boolean).join(": ")}</caption>
                    <colgroup>
                        {Array.from({ length: columns }, (_, index) => (
                            <col key={index} className={showLineNumbers && (split ? index % 2 === 0 : index < 2) ? "ow-diff__num-col" : undefined} />
                        ))}
                    </colgroup>
                    <thead className="ow-visually-hidden">
                        <tr>
                            {(split
                                ? [labels.oldLine, labels.before, labels.newLine, labels.after].filter((_, index) => showLineNumbers || index % 2)
                                : [labels.oldLine, labels.newLine, labels.line].slice(showLineNumbers ? 0 : 2)
                            ).map((header) => (
                                <th key={header} scope="col">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? wide(labels.noChanges, "ow-diff__hunk", "none") : null}
                        {rows.map((row, index) => {
                            if (row.kind === "gap") {
                                return wide(
                                    <button
                                        type="button"
                                        className="ow-diff__expand"
                                        onClick={() => {
                                            revealed.current = row.gap;
                                            setOpened({ of: file, gaps: [...gaps, row.gap] });
                                        }}
                                    >
                                        <ChevronsUpDownIcon size={14} />
                                        {labels.expand(row.count)}
                                    </button>,
                                    "ow-diff__gap",
                                    `gap${row.gap}`,
                                );
                            }
                            if (row.kind === "pair") {
                                return (
                                    <tr key={index}>
                                        {number(row.left, "oldNo")}
                                        {code(row.left, row.reveal)}
                                        {number(row.right, "newNo")}
                                        {code(row.right)}
                                    </tr>
                                );
                            }
                            const { line } = row;
                            if (line.type === "hunk") return wide(line.text, "ow-diff__hunk", index);
                            return (
                                <tr key={index}>
                                    {number(line, "oldNo")}
                                    {number(line, "newNo")}
                                    {code(line, row.reveal)}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
