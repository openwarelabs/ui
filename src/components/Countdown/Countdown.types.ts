import type { HTMLAttributes, ReactNode } from "react";

/** A moment: a `Date`, an ISO string ("2026-11-05T09:00:00Z") or milliseconds since the epoch. */
export type TimeInput = Date | string | number;

export interface RelativeTimeProps extends Omit<HTMLAttributes<HTMLTimeElement>, "style" | "title" | "children"> {
    /** The moment to describe, as a `Date`, an ISO string or milliseconds since the epoch. */
    date: TimeInput;
    /** The language the words are in, as a BCP 47 tag ("en-GB", "fr"). The browser's when left out. */
    locale?: string;
    /**
     * `auto` uses words where there are some: "yesterday", "now", "next week". `always` keeps to numbers: "1 day ago".
     * @default "auto"
     */
    numeric?: "auto" | "always";
    /**
     * How long the words are: "3 minutes ago", "3 min. ago" or "3m ago". Narrow suits a tight column or a feed.
     * @default "long"
     */
    style?: "long" | "short" | "narrow";
    /**
     * After this many days away, past or future, the absolute date shows instead ("14 Oct 2026"), as relative
     * words lose their meaning. Off when left out.
     */
    threshold?: number;
    /**
     * How the absolute date is written once past the threshold, as `Intl.DateTimeFormat`'s `dateStyle`.
     * @default "medium"
     */
    dateStyle?: "full" | "long" | "medium" | "short";
    /** Your own words instead of the built-in ones. It gets the date and the current time and returns the text. */
    format?: (date: Date, now: Date) => string;
    /**
     * Whether the words keep up as time passes: every second under a minute away, every minute under an hour, then
     * every hour. Off, it's rendered once.
     * @default true
     */
    live?: boolean;
    /**
     * Shows the full date and time in a `Tooltip` on hover or focus, instead of the browser's `title` tooltip. The
     * `<time>` element isn't focusable, so give it `tabIndex={0}` if keyboard users should see it.
     * @default false
     */
    tooltip?: boolean;
}

/** One of the units a Countdown can show. */
export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";

/** The time left, split into units; the largest unit shown takes whatever is above it. */
export type CountdownParts = Record<CountdownUnit, number>;

/** The words under each segment, and read out with it. */
export type CountdownLabels = Partial<Record<CountdownUnit, string>>;

export interface CountdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The moment counted down to, as a `Date`, an ISO string or milliseconds since the epoch. */
    to: TimeInput;
    /**
     * Which units to show, largest first. Left out, it shows days, hours, minutes and seconds, and drops the days
     * once none are left. The largest unit shown takes whatever is above it, so `["hours", "minutes"]` shows 50
     * hours for a little over two days.
     */
    units?: CountdownUnit[];
    /** Called once, when the countdown reaches zero while it's showing. */
    onComplete?: () => void;
    /** What replaces the numbers once it reaches zero: "Launched", "Sale ended". The zeros stay when left out. */
    completeText?: ReactNode;
    /**
     * The size of the numbers: 20px, 28px or 40px.
     * @default "md"
     */
    size?: "sm" | "md" | "lg";
    /**
     * `boxes` puts each number in a card with its unit under it, as a launch timer. `inline` is one line of numbers
     * with colons between them ("02:14:09"), for a row or a sentence.
     * @default "boxes"
     */
    variant?: "boxes" | "inline";
    /**
     * Keeps every number two digits wide ("07"), so the segments don't change width as the time runs down.
     * @default true
     */
    padZeros?: boolean;
    /** The words under each segment, to translate them: `{ days: "Jours", hours: "Heures" }`. */
    labels?: CountdownLabels;
    /**
     * Whether it counts down every second. Off, it shows the time left when rendered and stays there.
     * @default true
     */
    live?: boolean;
    /**
     * What screen readers hear as it runs. `minute` reads out the time left ("2 days, 14 hours and 9 minutes
     * left") each time the minute changes, then that it's complete; `none` says nothing until asked. Either way
     * the numbers aren't read every second.
     * @default "minute"
     */
    announce?: "minute" | "none";
    /** What's being counted down to, for screen readers: "Time until launch". */
    label?: string;
}
