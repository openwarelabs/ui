import type { HTMLAttributes, ReactNode } from "react";

import type { ChainOfThoughtStep, ChatSourceItem, ChatToolProps } from "@openwarelabs/ui";

/** A file a tool call changed, opening to its diff. */
export interface Chat03File {
    /** Its path: "src/invoices/format.ts". */
    path: string;
    /** Lines added. */
    added: number;
    /** Lines removed. */
    removed: number;
    /** The diff's lines, each starting with "+", "-", " " (context) or "@@" (a hunk's header). */
    diff: string[];
    /** Whether its diff starts open. @default false */
    defaultOpen?: boolean;
}

/** A tool call the agent makes: what it's doing, the tool, its status and result, and what it changed. */
export interface Chat03Tool extends Pick<
    ChatToolProps,
    | "title"
    | "name"
    | "icon"
    | "status"
    | "summary"
    | "duration"
    | "input"
    | "output"
    | "error"
    | "defaultExpanded"
    | "approvalMessage"
    | "approveLabel"
    | "denyLabel"
    | "onApprove"
    | "onDeny"
> {
    /** The files it changed, as its output, each opening to its diff. Without a summary, the lines added and removed sum up. */
    files?: Chat03File[];
}

/** One step of the run: a tool call, or the agent's own words between calls. */
export interface Chat03Step {
    /** Unique in the run. */
    id: string;
    /** The tool call. */
    tool?: Chat03Tool;
    /** The agent's words, level with the calls' titles, when the step isn't a call. */
    note?: ReactNode;
}

/** The agent's reasoning before it starts: what it thought and the plan it made. */
export interface Chat03Reasoning {
    /** The reasoning itself, as text. */
    text?: ReactNode;
    /** The plan, in order, each with its status. */
    steps?: ChainOfThoughtStep[];
    /** How long it thought, in milliseconds. */
    duration?: number;
    /** Whether it starts open. @default true */
    defaultExpanded?: boolean;
}

/** Where the run has got to: working, waiting for the person to approve a call, stopped, or finished. */
export type Chat03Status = "running" | "waiting" | "stopped" | "done";

export interface Chat03Labels {
    /** The badge while it works. @default "Running" */
    running?: string;
    /** The badge while it waits for an approval. @default "Needs approval" */
    waiting?: string;
    /** @default "Stopped" */
    stopped?: string;
    /** @default "Done" */
    done?: string;
    /** @default "Stop" */
    stop?: string;
    /** @default "Run again" */
    runAgain?: string;
    /** Read out before the clock. @default "Time taken: " */
    elapsed?: string;
    /** Names the list of steps. @default "Steps" */
    steps?: string;
    /** Names a call's list of files. @default "Files changed" */
    files?: string;
    /** Names a file's diff. @default "Changes to src/invoices/format.ts" */
    diff?(path: string): string;
    /** Read out after lines added. @default "8 lines added," */
    linesAdded?(count: number): string;
    /** Read out after lines removed. @default "2 removed" */
    linesRemoved?(count: number): string;
}

export interface Chat03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The task the agent is working on, as the section's heading. */
    title: ReactNode;
    /** Where it's working, first in the line under the title: the project. */
    project?: ReactNode;
    /** The branch it works on, in mono after the project. */
    branch?: ReactNode;
    /** The end of that line: who started it. Hidden behind its dot on phones. */
    byline?: ReactNode;
    /** Where the run has got to: sets the badge and whether Stop or Run again shows. */
    status: Chat03Status;
    /** How long it has taken so far, in seconds, as a clock. */
    elapsed?: number;
    /** Called by Stop, while it's running or waiting. */
    onStop?(): void;
    /** Called by Run again, once it's stopped or done. */
    onRestart?(): void;
    /** Its reasoning before it starts. */
    reasoning?: Chat03Reasoning;
    /** What it read, cited in its reasoning and summary. */
    sources?: ChatSourceItem[];
    /** Its steps, as they happen. */
    steps: Chat03Step[];
    /** What happened, under a hairline at the end: shown once it's stopped or done. */
    summary?: ReactNode;
    /** Words that aren't content (the badge, the buttons, names for screen readers), in English unless you pass your own. */
    labels?: Chat03Labels;
}
