import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { CheckIcon, ChevronRightIcon, XIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";
import { CodeBlock, Snippet } from "../CodeBlock/CodeBlock";
import { Code } from "../Kbd/Kbd";
import { Spinner } from "../Spinner/Spinner";
import { TextShimmer } from "../TextShimmer/TextShimmer";

/**
 * Where a tool call or a step has got to. `approval` waits for a person to approve it; `cancelled` didn't run or didn't
 * finish because a person denied it or stopped the run.
 */
export type ChatToolStatus = "pending" | "running" | "success" | "error" | "approval" | "cancelled";

/* Pieces shared with ChainOfThought and ChatSources: the status mark, durations and the collapsing panel. */

const statusWords: Record<ChatToolStatus, string> = {
    pending: "Not started",
    running: "Running",
    success: "Done",
    error: "Failed",
    approval: "Needs approval",
    cancelled: "Cancelled",
};

/** A slash across the ring: it was called off. */
function SlashIcon() {
    return (
        <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M7 17 17 7" />
        </svg>
    );
}

function ExclamationIcon() {
    return (
        <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
        >
            <path d="M12 5v9" />
            <path d="M12 19h.01" />
        </svg>
    );
}

/** The round mark before a tool call or a step: a spinner, a check, a cross, a "!", a slash or a hollow ring, with its status as words for screen readers. */
export function ChatStatusMarker({ status, icon }: { status: ChatToolStatus; icon?: ReactNode }) {
    // A step's own icon stands in for the check or the ring; running, failed and waiting always show their mark.
    const showsIcon = Boolean(icon) && (status === "success" || status === "pending");
    const glyph =
        status === "running" ? (
            <Spinner size="sm" label="" />
        ) : status === "error" ? (
            <XIcon size={12} strokeWidth={3} />
        ) : status === "approval" ? (
            <ExclamationIcon />
        ) : status === "cancelled" ? (
            <SlashIcon />
        ) : showsIcon ? (
            icon
        ) : status === "success" ? (
            <CheckIcon size={12} strokeWidth={3} />
        ) : null;
    return (
        <span className={cx("ow-chat-status", `ow-chat-status--${status}`, showsIcon && "ow-chat-status--icon")}>
            <span className="ow-chat-status__glyph" aria-hidden="true">
                {glyph}
            </span>
            <span className="ow-visually-hidden">{statusWords[status]}: </span>
        </span>
    );
}

/** "380 ms", "4.2 s", "12 s", "1 min 12 s", "1 h 4 min": a duration as people say it, with the locale's digits. */
export function formatDuration(ms: number, locale?: string): string {
    const number = (value: number, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
    const safe = Math.max(0, ms);
    if (safe < 1000) return `${number(Math.round(safe))} ms`;
    const seconds = safe / 1000;
    if (seconds < 10) return `${number(Math.floor(seconds * 10) / 10, 1)} s`;
    if (seconds < 60) return `${number(Math.floor(seconds))} s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const rest = Math.floor(seconds % 60);
        return rest ? `${number(minutes)} min ${number(rest)} s` : `${number(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${number(hours)} h ${number(rest)} min` : `${number(hours)} h`;
}

/** A duration in a <time> element, so it carries a machine-readable value too. */
export function ChatDuration({ ms, locale, className }: { ms: number; locale?: string; className?: string }) {
    return (
        <time dateTime={`PT${Math.max(0, Math.round(ms)) / 1000}S`} className={className}>
            {formatDuration(ms, locale)}
        </time>
    );
}

/**
 * Open state that follows a status: it opens when `wantsOpen` turns true (an error, a step under way) and closes again
 * when it turns false, unless the person has opened or closed it themselves since. A controlled `expanded` is left alone.
 */
export function useStatusExpansion({
    expanded,
    defaultExpanded,
    onExpandedChange,
    wantsOpen,
    closeWhenSettled = true,
    initial = wantsOpen,
}: {
    expanded: boolean | undefined;
    defaultExpanded: boolean | undefined;
    onExpandedChange: ((expanded: boolean) => void) | undefined;
    wantsOpen: boolean;
    closeWhenSettled?: boolean;
    initial?: boolean;
}): [boolean, () => void] {
    const [isOpen, setOpen] = useControllableState(expanded, defaultExpanded ?? initial, onExpandedChange);
    const touched = useRef(false);
    const previous = useRef(wantsOpen);

    useEffect(() => {
        if (previous.current === wantsOpen) return;
        previous.current = wantsOpen;
        if (expanded !== undefined) return;
        if (wantsOpen) {
            touched.current = false;
            setOpen(true);
        } else if (closeWhenSettled && !touched.current) {
            setOpen(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only a change of status moves it.
    }, [wantsOpen]);

    return [
        isOpen,
        () => {
            touched.current = true;
            setOpen(!isOpen);
        },
    ];
}

/**
 * A panel that opens and closes under a disclosure button, animating its height (a 0fr → 1fr grid row). Closed, it's
 * inert: nothing in it can be tabbed to or read out. `bleed` lets focus rings at its edges show past the clip.
 */
export function ChatCollapse({
    id,
    open,
    bleed = false,
    className,
    children,
}: {
    id: string;
    open: boolean;
    bleed?: boolean;
    className?: string;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) ref.current.inert = !open;
    }, [open]);
    return (
        <div ref={ref} id={id} className={cx("ow-chat-collapse", bleed && "ow-chat-collapse--bleed")} data-open={open}>
            <div className="ow-chat-collapse__clip">
                <div className={className}>{children}</div>
            </div>
        </div>
    );
}

export interface ChatToolProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** What the agent is doing, in words: "Run the test suite". */
    title: ReactNode;
    /** The tool it calls, shown in code type beside the title: "run_tests". */
    name?: string;
    /** A 15px icon for the tool, before the title. */
    icon?: ReactNode;
    /** Where the call has got to. Running shows a spinner and a shimmering title; `approval` asks the person to approve it;
     * `cancelled` is for a call they denied, or one the run stopped before it finished: say which in `summary`. */
    status: ChatToolStatus;
    /** The result in one line: "212 tests passed", "Read 3 files". */
    summary?: ReactNode;
    /** How long it took, or has taken so far, in milliseconds. Shown as "4.2 s". */
    duration?: number;
    /** What the tool was called with: a one-line string (a command) in a Snippet, a longer one in a code block, or an
     * object as formatted JSON. Shown under "Input". */
    input?: string | Record<string, unknown> | unknown[];
    /** What the tool returned: a string in a code block, or any node (a list of files, a link). Shown under "Output". */
    output?: ReactNode;
    /** What went wrong, shown in the danger colour under "Error". */
    error?: ReactNode;
    /** Whether the input and output show. Leave out to let it follow the status: closed, opening for an error or an approval. */
    expanded?: boolean;
    /** Whether it starts open. Defaults to open for an error or an approval and closed otherwise. */
    defaultExpanded?: boolean;
    /** Called with the new state when it opens or closes, by the person or by a change of status. */
    onExpandedChange?(expanded: boolean): void;
    /** What it asks to do, while `status` is "approval". Defaults to "Wants to run" and the tool's name. */
    approvalMessage?: ReactNode;
    /** The approve button's label: name the action, e.g. "Approve and publish".
     * @default "Approve" */
    approveLabel?: string;
    /** The deny button's label, e.g. "Don't publish".
     * @default "Deny" */
    denyLabel?: string;
    /** Called when the person approves the call. Move `status` on from "approval" in response. */
    onApprove?(): void;
    /** Called when the person refuses the call. Move `status` on to "cancelled" in response. */
    onDeny?(): void;
    /** The locale for the duration's digits, e.g. "de-CH". Defaults to the browser's. */
    locale?: string;
}

/** The longest an input or output gets before it scrolls. */
const codeMaxHeight = 280;

function formatInput(input: NonNullable<ChatToolProps["input"]>): string {
    if (typeof input === "string") return input;
    try {
        return JSON.stringify(input, null, 2);
    } catch {
        return String(input);
    }
}

/**
 * One tool call an agent makes: what it's doing, the tool, its status and result on one row, which opens to show the
 * input and output. A failed call opens to its error, and a call that needs approval asks for it with Approve and Deny.
 */
export const ChatTool = forwardRef<HTMLDivElement, ChatToolProps>(function ChatTool(
    {
        title,
        name,
        icon,
        status,
        summary,
        duration,
        input,
        output,
        error,
        expanded,
        defaultExpanded,
        onExpandedChange,
        approvalMessage,
        approveLabel = "Approve",
        denyLabel = "Deny",
        onApprove,
        onDeny,
        locale,
        className,
        ...props
    },
    ref,
) {
    const id = useId();
    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const decided = useRef(false);
    const [announcement, setAnnouncement] = useState("");

    const needsApproval = status === "approval";
    const [isOpen, toggle] = useStatusExpansion({
        expanded,
        defaultExpanded,
        onExpandedChange,
        wantsOpen: status === "error" || needsApproval,
    });

    const hasInput = input !== undefined && input !== null && input !== "";
    const hasOutput = output !== undefined && output !== null && output !== false && output !== "";
    const hasError = error !== undefined && error !== null && error !== false && error !== "";
    const hasDetails = hasInput || hasOutput || hasError;
    const hasMeta = Boolean(summary) || duration !== undefined;

    // Say politely that the agent is waiting for the person, once the request is on screen. The region starts empty
    // and fills a moment later, so screen readers notice the change even when it mounts already waiting.
    useEffect(() => {
        if (!needsApproval) {
            setAnnouncement("");
            return;
        }
        const timer = window.setTimeout(() => {
            const request = messageRef.current?.textContent?.trim();
            setAnnouncement(`Needs approval. ${request ?? ""}`.trim());
        }, 150);
        return () => window.clearTimeout(timer);
    }, [needsApproval]);

    // Approving or denying removes the buttons; keep the keyboard on this call rather than losing it to the page.
    useEffect(() => {
        if (needsApproval || !decided.current) return;
        decided.current = false;
        const active = document.activeElement;
        if (!active || active === document.body) (triggerRef.current ?? rootRef.current)?.focus();
    }, [needsApproval]);

    const running = status === "running";
    const header = (
        <>
            <ChatStatusMarker status={status} />
            {icon ? (
                <span className="ow-chat-tool__icon" aria-hidden="true">
                    {icon}
                </span>
            ) : null}
            <span className="ow-chat-tool__main">
                <span className="ow-chat-tool__heading">
                    <span className="ow-chat-tool__title">{running ? <TextShimmer>{title}</TextShimmer> : title}</span>
                    {name ? <Code className="ow-chat-tool__name">{name}</Code> : null}
                </span>
                {hasMeta ? (
                    <span className="ow-chat-tool__meta">
                        {summary ? <span className="ow-chat-tool__summary">{summary}</span> : null}
                        {summary && duration !== undefined ? (
                            <span className="ow-chat-tool__dot" aria-hidden="true">
                                ·
                            </span>
                        ) : null}
                        {duration !== undefined ? <ChatDuration ms={duration} locale={locale} className="ow-chat-tool__duration" /> : null}
                    </span>
                ) : null}
            </span>
            {hasDetails ? (
                <span className="ow-chat-tool__chevron" aria-hidden="true">
                    <ChevronRightIcon size={14} />
                </span>
            ) : null}
        </>
    );

    return (
        <div
            ref={(element) => {
                rootRef.current = element;
                if (typeof ref === "function") ref(element);
                else if (ref) ref.current = element;
            }}
            className={cx("ow-chat-tool", className)}
            data-status={status}
            data-open={hasDetails ? isOpen : undefined}
            aria-busy={running || undefined}
            tabIndex={hasDetails ? undefined : -1}
            {...props}
        >
            {hasDetails ? (
                <button
                    ref={triggerRef}
                    type="button"
                    id={`${id}-trigger`}
                    className="ow-chat-tool__header ow-chat-tool__header--button"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-details`}
                    onClick={toggle}
                >
                    {header}
                </button>
            ) : (
                <div className="ow-chat-tool__header">{header}</div>
            )}

            {hasDetails ? (
                <ChatCollapse id={`${id}-details`} open={isOpen} className="ow-chat-tool__details">
                    {hasInput ? (
                        <div className="ow-chat-tool__section">
                            <span className="ow-chat-tool__label">Input</span>
                            {typeof input === "string" && !input.includes("\n") ? (
                                <Snippet value={input} prompt={null} />
                            ) : (
                                <CodeBlock code={formatInput(input)} language={typeof input === "string" ? undefined : "json"} maxHeight={codeMaxHeight} />
                            )}
                        </div>
                    ) : null}
                    {hasOutput ? (
                        <div className="ow-chat-tool__section">
                            <span className="ow-chat-tool__label">Output</span>
                            {typeof output === "string" ? (
                                <CodeBlock code={output} maxHeight={codeMaxHeight} />
                            ) : (
                                <div className="ow-chat-tool__output">{output}</div>
                            )}
                        </div>
                    ) : null}
                    {hasError ? (
                        <div className="ow-chat-tool__section">
                            <span className="ow-chat-tool__label">Error</span>
                            <div className="ow-chat-tool__error">{error}</div>
                        </div>
                    ) : null}
                </ChatCollapse>
            ) : null}

            {needsApproval ? (
                <div className="ow-chat-tool__approval" role="group" aria-labelledby={`${id}-request`}>
                    <p ref={messageRef} id={`${id}-request`} className="ow-chat-tool__request">
                        {approvalMessage ??
                            (name ? (
                                <>
                                    Wants to run <Code>{name}</Code>
                                </>
                            ) : (
                                "Wants to go ahead"
                            ))}
                    </p>
                    <div className="ow-chat-tool__actions">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                decided.current = true;
                                onApprove?.();
                            }}
                        >
                            {approveLabel}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                decided.current = true;
                                onDeny?.();
                            }}
                        >
                            {denyLabel}
                        </Button>
                    </div>
                </div>
            ) : null}

            <span className="ow-visually-hidden" aria-live="polite">
                {announcement}
            </span>
        </div>
    );
});
