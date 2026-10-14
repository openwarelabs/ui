import { useId, useState } from "react";

import { Badge, Button, ChainOfThought, ChatAgentAvatar, ChatSources, ChatTool, Code, cx, Text, VisuallyHidden, type BadgeVariant } from "@openwarelabs/ui";

import { ChevronRightIcon, CircleStopIcon, RotateCcwIcon } from "@blocks/shared/icons";
import type { Chat03File, Chat03Labels, Chat03Props, Chat03Status } from "./Chat03.types";

const formatElapsed = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** Lines added and removed, in green and red, with words for screen readers. */
function DiffCount({ added, removed, labels }: { added: number; removed: number; labels: Chat03Labels }) {
    return (
        <>
            <Text as="span" variant="caption" tone="success">
                <span aria-hidden="true">+{added}</span>
                <VisuallyHidden>{labels.linesAdded?.(added) ?? `${added} lines added,`}</VisuallyHidden>
            </Text>{" "}
            <Text as="span" variant="caption" tone="danger">
                <span aria-hidden="true">−{removed}</span>
                <VisuallyHidden>{labels.linesRemoved?.(removed) ?? `${removed} removed`}</VisuallyHidden>
            </Text>
        </>
    );
}

/** The files a call changed, each opening to its diff. */
function Files({ files, open, onToggle, labels }: { files: Chat03File[]; open: string[]; onToggle(path: string): void; labels: Chat03Labels }) {
    return (
        <ul className="ow-chat03__files" aria-label={labels.files ?? "Files changed"}>
            {files.map((file) => {
                const expanded = open.includes(file.path);
                return (
                    <li key={file.path} className="ow-chat03__file">
                        <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            className="ow-chat03__file-button"
                            aria-expanded={expanded}
                            startIcon={<ChevronRightIcon size={14} />}
                            onClick={() => onToggle(file.path)}
                        >
                            <Text variant="code" tone="default" truncate className="ow-chat03__path">
                                {file.path}
                            </Text>
                            <DiffCount added={file.added} removed={file.removed} labels={labels} />
                        </Button>
                        {expanded ? (
                            <Text as="pre" variant="code" className="ow-chat03__diff" aria-label={labels.diff?.(file.path) ?? `Changes to ${file.path}`}>
                                {file.diff.map((line, index) => {
                                    const kind = line.startsWith("@@") ? "hunk" : line[0] === "+" ? "add" : line[0] === "-" ? "remove" : "context";
                                    const sign = kind === "add" ? "+" : kind === "remove" ? "−" : "";
                                    return (
                                        <span key={index} className={`ow-chat03__line ow-chat03__line--${kind}`} data-sign={sign}>
                                            {kind === "hunk" ? line : line.slice(1)}
                                            {"\n"}
                                        </span>
                                    );
                                })}
                            </Text>
                        ) : null}
                    </li>
                );
            })}
        </ul>
    );
}

const badgeTone: Record<Chat03Status, BadgeVariant> = { running: "active", waiting: "warning", stopped: "neutral", done: "success" };
const badgeLabel: Record<Chat03Status, string> = { running: "Running", waiting: "Needs approval", stopped: "Stopped", done: "Done" };

/**
 * One agent run: what it's working on at the top, with its status, a clock and Stop; its reasoning, sources and
 * tool calls below as they happen, each call opening to its input, output and the diffs of the files it changed.
 */
export function Chat03({
    title,
    project,
    branch,
    byline,
    status,
    elapsed,
    onStop,
    onRestart,
    reasoning,
    sources,
    steps,
    summary,
    labels = {},
    className,
    ...props
}: Chat03Props) {
    const id = useId();
    const [open, setOpen] = useState<string[]>(() => steps.flatMap((step) => step.tool?.files ?? []).flatMap((file) => (file.defaultOpen ? [file.path] : [])));
    const toggleFile = (path: string) => setOpen((paths) => (paths.includes(path) ? paths.filter((other) => other !== path) : [...paths, path]));
    const working = status === "running" || status === "waiting";

    return (
        <section className={cx("ow-chat03", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-chat03__panel">
                <header className="ow-chat03__header">
                    <ChatAgentAvatar size="lg" />
                    <div className="ow-chat03__heading">
                        <Text variant="card-title" as="h2" id={`${id}-title`}>
                            {title}
                        </Text>
                        {project !== undefined || branch !== undefined || byline !== undefined ? (
                            <Text variant="caption" as="p" className="ow-chat03__meta">
                                {project !== undefined ? <span>{project}</span> : null}
                                {project !== undefined && branch !== undefined ? (
                                    <span className="ow-chat03__meta-sep" aria-hidden="true">
                                        /
                                    </span>
                                ) : null}
                                {branch !== undefined ? <Code>{branch}</Code> : null}
                                {byline !== undefined && (project !== undefined || branch !== undefined) ? (
                                    <span className="ow-chat03__meta-sep ow-chat03__meta-sep--dot" aria-hidden="true">
                                        ·
                                    </span>
                                ) : null}
                                {byline !== undefined ? <span>{byline}</span> : null}
                            </Text>
                        ) : null}
                    </div>
                    <div className="ow-chat03__controls">
                        <Badge size="sm" variant={badgeTone[status]} role="status">
                            {labels[status] ?? badgeLabel[status]}
                        </Badge>
                        {elapsed !== undefined ? (
                            <Text variant="caption" className="ow-chat03__elapsed">
                                <VisuallyHidden>{labels.elapsed ?? "Time taken: "}</VisuallyHidden>
                                {formatElapsed(elapsed)}
                            </Text>
                        ) : null}
                        {working ? (
                            <Button size="sm" startIcon={<CircleStopIcon size={16} />} onClick={onStop}>
                                {labels.stop ?? "Stop"}
                            </Button>
                        ) : (
                            <Button size="sm" startIcon={<RotateCcwIcon size={16} />} onClick={onRestart}>
                                {labels.runAgain ?? "Run again"}
                            </Button>
                        )}
                    </div>
                </header>

                <div className="ow-chat03__body">
                    {reasoning ? (
                        <ChainOfThought duration={reasoning.duration} defaultExpanded={reasoning.defaultExpanded ?? true} steps={reasoning.steps}>
                            {reasoning.text}
                        </ChainOfThought>
                    ) : null}

                    {sources?.length ? <ChatSources sources={sources} /> : null}

                    <ol className="ow-chat03__steps" aria-label={labels.steps ?? "Steps"}>
                        {steps.map((step) => {
                            const tool = step.tool;
                            if (!tool) {
                                return (
                                    <li key={step.id}>
                                        <Text variant="copy" className="ow-chat03__note">
                                            {step.note}
                                        </Text>
                                    </li>
                                );
                            }
                            const { files, summary: toolSummary, output, ...rest } = tool;
                            const added = files?.reduce((sum, file) => sum + file.added, 0) ?? 0;
                            const removed = files?.reduce((sum, file) => sum + file.removed, 0) ?? 0;
                            return (
                                <li key={step.id}>
                                    <ChatTool
                                        {...rest}
                                        summary={toolSummary ?? (files?.length ? <DiffCount added={added} removed={removed} labels={labels} /> : undefined)}
                                        output={files?.length ? <Files files={files} open={open} onToggle={toggleFile} labels={labels} /> : output}
                                    />
                                </li>
                            );
                        })}
                    </ol>

                    {summary && !working ? <div className="ow-chat03__summary">{summary}</div> : null}
                </div>
            </div>
        </section>
    );
}
