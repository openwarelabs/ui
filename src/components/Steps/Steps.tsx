import { useId, type ReactNode } from "react";

import { CheckIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface StepItem {
    title: ReactNode;
    /** A line under the title. Hidden once the step is done, in the vertical layout. */
    description?: ReactNode;
    /** A control on the right of the step while it's the current one, such as a small Button. Other steps don't show it. */
    action?: ReactNode;
    /** Overrides the status worked out from `current`. */
    status?: "done" | "current" | "upcoming";
}

export interface StepsProps {
    items: StepItem[];
    /** The index of the step in progress. Steps before it are done. Use items.length when every step is done.
     * @default 0 */
    current?: number;
    /** `vertical` is a first-run checklist; `horizontal` is a compact progress strip.
     * @default "vertical" */
    orientation?: "vertical" | "horizontal";
    /** A heading above a vertical list, with a "2 of 4 done" count beside it. */
    title?: ReactNode;
    /** Names the list for screen readers when there's no title.
     * @default "Steps" */
    label?: string;
    className?: string;
}

/** Numbered steps toward a goal. The current one is raised; finished ones are checked off. */
export function Steps({ items, current = 0, orientation = "vertical", title, label = "Steps", className }: StepsProps) {
    const statuses = items.map((item, index) => item.status ?? (index < current ? "done" : index === current ? "current" : "upcoming"));
    const doneCount = statuses.filter((status) => status === "done").length;
    const headingId = useId();

    const list = (
        <ol className="ow-steps__list">
            {items.map((item, index) => {
                const status = statuses[index]!;
                return (
                    <li
                        key={index}
                        className={cx("ow-steps__item", `ow-steps__item--${status}`)}
                        aria-current={status === "current" ? "step" : undefined}
                    >
                        <span className="ow-steps__marker">
                            {status === "done" ? <CheckIcon size={14} strokeWidth={3} /> : index + 1}
                        </span>
                        <span className="ow-steps__text">
                            <span className="ow-steps__title">
                                {status === "done" ? <span className="ow-visually-hidden">Done: </span> : null}
                                {item.title}
                            </span>
                            {item.description && (orientation === "horizontal" || status !== "done") ? (
                                <span className="ow-steps__description">{item.description}</span>
                            ) : null}
                        </span>
                        {item.action && status === "current" && orientation === "vertical" ? (
                            <span className="ow-steps__action">{item.action}</span>
                        ) : null}
                    </li>
                );
            })}
        </ol>
    );

    return (
        <section
            className={cx("ow-steps", `ow-steps--${orientation}`, className)}
            aria-labelledby={title && orientation === "vertical" ? headingId : undefined}
            aria-label={title && orientation === "vertical" ? undefined : label}
        >
            {title && orientation === "vertical" ? (
                <div className="ow-steps__header">
                    <h3 id={headingId} className="ow-steps__heading">
                        {title}
                    </h3>
                    <span className="ow-steps__count">
                        {doneCount} of {items.length} done
                    </span>
                </div>
            ) : null}
            {list}
        </section>
    );
}
