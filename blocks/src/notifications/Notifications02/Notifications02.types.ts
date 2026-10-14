import type { HTMLAttributes, ReactNode } from "react";

/** One event on the rail. */
export interface Notifications02Event {
    /** Tells them apart. */
    id: string;
    /** What kind it is, for the filter: "deploy", "review". */
    kind?: string;
    /** Who did it: a person's name, drawn as their Avatar. */
    by?: string;
    /** A 14–15px icon in a circle instead of an Avatar, for what the product records itself. */
    icon?: ReactNode;
    /** The icon's circle: muted, the brand's tint, or red for something that failed.
     * @default "default" */
    tone?: "default" | "primary" | "danger";
    /** The time of day, as written and in the `<time>` element: "14:32". */
    time: string;
    /** What happened, in a sentence: names in bold, the things it happened to as links. */
    line: ReactNode;
    /** What came with it, under the line: a badge, a commit, a quote, the people added. */
    detail?: ReactNode;
}

/** A day's events, under its heading. */
export interface Notifications02Day {
    /** The day as an ISO date, for each event's `<time>`: "2026-10-13". */
    dateTime: string;
    /** The heading: "Today", "Yesterday", "Friday". */
    label: ReactNode;
    /** The date, muted beside it: "Tuesday 13 October". */
    date?: ReactNode;
    events: Notifications02Event[];
}

/** A kind of event the filter can show on its own. */
export interface Notifications02Kind {
    /** Matches the events' `kind`. */
    value: string;
    /** The filter's word for it: "Deploys". */
    label: string;
}

/** The words that aren't content, in English unless you pass your own. */
export interface Notifications02Labels {
    /** The filter's first option, for every kind. @default "All" */
    all?: string;
    /** The filter's name for screen readers. @default "Show" */
    filter?: string;
    /** When the filter leaves nothing. @default "Nothing of this kind yet." */
    empty?: string;
    /** The button that loads older days. @default "Show earlier activity" */
    loadEarlier?: string;
    /** Under the list once there's nothing older. @default "That's everything." */
    end?: string;
}

export interface Notifications02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The page's heading: "Activity". */
    title: ReactNode;
    /** A sentence under it. */
    description?: ReactNode;
    /** The days to show, newest first. */
    days: Notifications02Day[];
    /** The kinds the filter offers after All. Without them there's no filter. */
    kinds?: Notifications02Kind[];
    /** Fetches the days before these. While its promise is pending the button shows a spinner; the days it gives
     * are added below. Without it there's no button, only the `end` line. */
    onLoadEarlier?(): Notifications02Day[] | Promise<Notifications02Day[]>;
    labels?: Notifications02Labels;
}
