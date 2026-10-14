import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";

import { ChevronRightIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { ChatCollapse, ChatStatusMarker, formatDuration, useStatusExpansion } from "../ChatTool/ChatTool";
import { TextShimmer } from "../TextShimmer/TextShimmer";

/** Where the reasoning, or one step of it, has got to. */
export type ChainOfThoughtStatus = "pending" | "running" | "success" | "error";

export interface ChainOfThoughtStep {
    /** A stable key for the step, so it keeps its place as steps are added. */
    id: string;
    /** The step in words: "Find where invoice dates are formatted". */
    title: ReactNode;
    /** Where the step has got to: a hollow ring, a spinner, a check or a cross. */
    status: ChainOfThoughtStatus;
    /** More about the step under its title: what it found, a file path, a short list. */
    detail?: ReactNode;
    /** A 12px icon in place of the check or the hollow ring, e.g. a search icon. Running and failed steps keep their own mark. */
    icon?: ReactNode;
}

export interface ChainOfThoughtProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** The plan, in order, each with its status. */
    steps?: ChainOfThoughtStep[];
    /** "running" shows "Thinking…" with a shimmer and keeps it open; anything else is finished.
     * @default "success" */
    status?: ChainOfThoughtStatus;
    /** How long it thought, in milliseconds: "Thought for 12 s". */
    duration?: number;
    /** The header's words. Defaults to "Thinking…" while running and "Thought for 12 s" once done. */
    label?: ReactNode;
    /** The reasoning itself, as text, shown above the steps. It can grow while it streams in. */
    children?: ReactNode;
    /** Whether the reasoning shows. Leave out to let it follow `status`. */
    expanded?: boolean;
    /** Whether it starts open. Defaults to open while running and closed once done. */
    defaultExpanded?: boolean;
    /** Called with the new state when it opens or closes, by the person or by a change of status. */
    onExpandedChange?(expanded: boolean): void;
    /** Folds the reasoning away when `status` turns from "running" to done, unless the person has opened or closed it.
     * @default true */
    collapseWhenDone?: boolean;
    /** The locale for the duration's digits, e.g. "de-CH". Defaults to the browser's. */
    locale?: string;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/**
 * An agent's reasoning and plan: a "Thinking…" header that opens to the reasoning and a list of steps on a thin line,
 * each with its status. It stays open while the agent works and folds to "Thought for 12 s" when it's done.
 */
export const ChainOfThought = forwardRef<HTMLDivElement, ChainOfThoughtProps>(function ChainOfThought(
    {
        steps = [],
        status = "success",
        duration,
        label,
        children,
        expanded,
        defaultExpanded,
        onExpandedChange,
        collapseWhenDone = true,
        locale,
        className,
        ...props
    },
    ref,
) {
    const id = useId();
    const running = status === "running";
    const [isOpen, toggle] = useStatusExpansion({
        expanded,
        defaultExpanded,
        onExpandedChange,
        wantsOpen: running,
        closeWhenSettled: collapseWhenDone,
        initial: running || !collapseWhenDone,
    });

    const hasReasoning = children !== undefined && children !== null && children !== false && children !== "";
    const hasBody = hasReasoning || steps.length > 0;
    const finished = steps.filter((step) => step.status === "success" || step.status === "error").length;
    const failed = steps.filter((step) => step.status === "error").length;

    const heading = label ?? (running ? "Thinking…" : duration !== undefined ? `Thought for ${formatDuration(duration, locale)}` : "Reasoning");
    const count = steps.length > 0 ? (running ? `${finished} of ${plural(steps.length, "step")}` : plural(steps.length, "step")) : null;

    const headerText = (
        <span className="ow-chat-toggle__text">
            <span className="ow-chain-of-thought__label">{running ? <TextShimmer>{heading}</TextShimmer> : heading}</span>
            {count ? (
                <span className="ow-chat-toggle__meta">
                    <span aria-hidden="true">· </span>
                    {count}
                    {failed > 0 ? <span className="ow-chain-of-thought__failed">, {failed} failed</span> : null}
                </span>
            ) : null}
        </span>
    );

    return (
        <div ref={ref} className={cx("ow-chain-of-thought", className)} data-status={status} aria-busy={running || undefined} {...props}>
            {hasBody ? (
                <button type="button" className="ow-chat-toggle" aria-expanded={isOpen} aria-controls={`${id}-body`} onClick={toggle}>
                    <span className="ow-chat-toggle__chevron" aria-hidden="true">
                        <ChevronRightIcon size={14} />
                    </span>
                    {headerText}
                </button>
            ) : (
                <div className="ow-chat-toggle ow-chain-of-thought__static">{headerText}</div>
            )}
            {hasBody ? (
                <ChatCollapse id={`${id}-body`} open={isOpen} bleed className="ow-chain-of-thought__body">
                    {hasReasoning ? <div className="ow-chain-of-thought__reasoning">{children}</div> : null}
                    {steps.length > 0 ? (
                        <ol className="ow-chain-of-thought__steps">
                            {steps.map((step) => (
                                <li key={step.id} className="ow-chain-of-thought__step" data-status={step.status}>
                                    <ChatStatusMarker status={step.status} icon={step.icon} />
                                    <div className="ow-chain-of-thought__step-body">
                                        <span className="ow-chain-of-thought__step-title">
                                            {step.status === "running" ? <TextShimmer>{step.title}</TextShimmer> : step.title}
                                        </span>
                                        {step.detail !== undefined && step.detail !== null ? (
                                            <div className="ow-chain-of-thought__detail">{step.detail}</div>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : null}
                </ChatCollapse>
            ) : null}
        </div>
    );
});
