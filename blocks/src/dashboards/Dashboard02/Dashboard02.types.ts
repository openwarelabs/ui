import type { HTMLAttributes, ReactNode } from "react";

import type { StatProps, TableSort } from "@openwarelabs/ui";

import type { BlockTableColumn } from "@blocks/shared/shared.types";

/** One thing that happened, in the feed. */
export interface Dashboard02Event {
    /** Unique in the feed. */
    id: string;
    /** What sort of event it is, matched by the feed's filters: "deploy", "review". */
    kind?: string;
    /** A 14px icon in a round tile, usually from lucide-react. */
    icon: ReactNode;
    /** Colours the tile: green for something that went live, red for a failure, the primary colour for agents. */
    tone?: "success" | "danger" | "primary";
    /** The sentence: who did what. */
    text: ReactNode;
    /** A caption under it: where, how long, when. */
    meta?: ReactNode;
    /** The day it belongs to, as a heading over its group: "Today", "Yesterday". Events of a day sit together. */
    day: string;
}

/** A filter over the feed: shows the events of one kind. */
export interface Dashboard02EventFilter {
    /** The kind it shows, matching events' `kind`. */
    value: string;
    /** Its words. */
    label: ReactNode;
}

/** The table under the stats, in its own card. */
export interface Dashboard02Table<Row> {
    /** The card's heading: "Projects". */
    title: ReactNode;
    /** Describes the table for screen readers. */
    caption: string;
    /** Its columns. */
    columns: Array<BlockTableColumn<Row>>;
    /** Its rows. */
    rows: Row[];
    /** The order to start with. */
    defaultSort?: TableSort;
}

export interface Dashboard02Labels {
    /** The feed's heading. @default "Activity" */
    feed?: string;
    /** Names the feed's filters for screen readers. @default "Show" */
    filters?: string;
    /** The filter that shows every event. @default "All" */
    all?: string;
    /** The button over the feed when new events are waiting. @default "2 new events" */
    newEvents?(count: number): ReactNode;
    /** The button under the feed that shows the days before the first. @default "Show earlier activity" */
    showEarlier?: string;
    /** When nothing in the first day matches the filter. @default "Nothing like this has happened today." */
    noneToday?: string;
    /** When nothing at all matches it. @default "Nothing like this happened this week." */
    none?: string;
}

export interface Dashboard02Props<Row extends object> extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The page's name, as its h1. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** Stats on the left, two to a row: four fill it. */
    stats: StatProps[];
    /** A table under the stats. */
    table?: Dashboard02Table<Row>;
    /** What happened, newest first, in a feed on the right. Only the first day shows until the person asks for more. */
    events: Dashboard02Event[];
    /** Events that arrived while the page was open. A button over the feed shows how many, and adds them to it. */
    newEvents?: Dashboard02Event[];
    /** Filters over the feed, after "All", each showing the events of one kind. */
    eventFilters?: Dashboard02EventFilter[];
    /** Words that aren't content (headings, buttons, empty text), in English unless you pass your own. */
    labels?: Dashboard02Labels;
}
