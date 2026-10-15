import type { LiHTMLAttributes, OlHTMLAttributes, ReactNode } from "react";

/** The colour of an item's dot or icon circle, the same set as Badge and Alert. */
export type TimelineTone = "neutral" | "brand" | "success" | "warning" | "danger";

export interface TimelineProps extends OlHTMLAttributes<HTMLOListElement> {
    /**
     * `comfortable` is a changelog or a history: a bold title with the time at the end of its line, and room for a
     * description or a card under it. `compact` is an activity feed: one sentence with the time after it, close
     * together, for 24px avatars.
     * @default "comfortable"
     */
    density?: "compact" | "comfortable";
    /** The events, as `TimelineItem`s, in the order they read: newest first for a feed, oldest first for a plan. */
    children?: ReactNode;
}

export interface TimelineItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
    /** What happened: a heading in a changelog, or the whole sentence in a feed ("Ana merged #42"). */
    title?: ReactNode;
    /** When it happened, as people read it: "2h ago", "14 Oct", "v0.13.0 · 14 Oct". */
    time?: ReactNode;
    /**
     * The machine-readable moment for `time`, such as "2026-10-13T14:32" or "2026-10-13". With it, the time is a
     * `<time>` element that screen readers, search engines and scripts can read.
     */
    dateTime?: string;
    /**
     * The colour of the dot, or of the icon's circle. Brand for something in progress or by an agent, success for
     * something that shipped, warning for something that needs you, danger for something that failed.
     * @default "neutral"
     */
    tone?: TimelineTone;
    /** A 14px icon in a circle in place of the dot, such as a rocket for a deploy. */
    icon?: ReactNode;
    /**
     * An `Avatar` in place of the dot, for who did it. Size it to the timeline: `sm` (24px) when compact, `md` (28px)
     * when comfortable.
     */
    avatar?: ReactNode;
    /** Something that hasn't happened yet: a hollow marker, a muted title and a dashed line into and out of it. */
    pending?: boolean;
    /** More about it under the title: a line of description, a quoted comment, badges, a link. */
    children?: ReactNode;
}
