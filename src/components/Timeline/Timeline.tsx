import { cx } from "@/utils/cx";
import type { TimelineItemProps, TimelineProps } from "./Timeline.types";
export type { TimelineItemProps, TimelineProps, TimelineTone } from "./Timeline.types";

/** Events down a line, as an ordered list: an activity feed, a changelog or the history of a record. */
export function Timeline({ density = "comfortable", className, children, ...props }: TimelineProps) {
    return (
        <ol className={cx("ow-timeline", `ow-timeline--${density}`, className)} {...props}>
            {children}
        </ol>
    );
}

/** One event on a Timeline: a marker on the line (a dot, an icon or an avatar), a title, a time and anything under it. */
export function TimelineItem({
    title,
    time,
    dateTime,
    tone = "neutral",
    icon,
    avatar,
    pending = false,
    className,
    children,
    ...props
}: TimelineItemProps) {
    const marker = avatar ? "avatar" : icon ? "icon" : "dot";
    const timeElement = time ? (
        dateTime ? (
            <time className="ow-timeline__time" dateTime={dateTime}>
                {time}
            </time>
        ) : (
            <span className="ow-timeline__time">{time}</span>
        )
    ) : null;

    return (
        <li
            className={cx(
                "ow-timeline__item",
                `ow-timeline__item--${marker}`,
                `ow-timeline__item--${tone}`,
                pending && "ow-timeline__item--pending",
                className,
            )}
            {...props}
        >
            <span className="ow-timeline__marker" aria-hidden={avatar ? undefined : true}>
                {avatar ?? icon ?? <span className="ow-timeline__dot" />}
            </span>
            <div className="ow-timeline__content">
                {title || timeElement ? (
                    <div className="ow-timeline__header">
                        {title ? (
                            <span className="ow-timeline__title">
                                {pending ? <span className="ow-visually-hidden">Upcoming: </span> : null}
                                {title}
                            </span>
                        ) : null}
                        {title && timeElement ? (
                            <span className="ow-timeline__separator" aria-hidden="true">
                                ·
                            </span>
                        ) : null}
                        {timeElement}
                    </div>
                ) : null}
                {children ? <div className="ow-timeline__body">{children}</div> : null}
            </div>
        </li>
    );
}
