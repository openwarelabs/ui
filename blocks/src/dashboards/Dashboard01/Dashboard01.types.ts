import type { HTMLAttributes, ReactNode } from "react";

import type { SegmentedControlOption, StatProps } from "@openwarelabs/ui";

/** A control beside the title that changes what the page shows: a select (a project) or segments (a time range). */
export interface Dashboard01Filter {
    /** `select` for a list of choices, `segmented` for two to five side by side. */
    kind: "select" | "segmented";
    /** Names it for screen readers: "Project", "Time range". */
    label: string;
    /** Its choices. */
    options: SegmentedControlOption[];
    /** The chosen value, when you keep it yourself. */
    value?: string;
    /** The value chosen to start with. @default the first option's */
    defaultValue?: string;
    /** Called with the new value when it changes. */
    onChange?(value: string): void;
}

/** One entry in the chart's legend. */
export interface Dashboard01LegendItem {
    /** What the mark stands for. */
    label: ReactNode;
    /** The mark itself, drawn to match the chart: a short line, a small bar. */
    swatch: ReactNode;
}

/** The chart across the page, in a card. */
export interface Dashboard01Chart {
    /** The card's heading: "Deploys per day". */
    title: ReactNode;
    /** A caption under it, summing up what the chart shows. */
    description?: ReactNode;
    /** The legend, on the right of the heading. */
    legend?: Dashboard01LegendItem[];
    /** The chart: an SVG you draw, or one from a charting library. */
    content: ReactNode;
}

export interface Dashboard01Labels {
    /** Names the legend for screen readers. @default "Legend" */
    legend?: string;
}

export interface Dashboard01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The page's name, as its h1. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** Controls on the right of the title that change what the stats and the chart show. */
    filters?: Dashboard01Filter[];
    /** A row of stats: four fill it on desktops, two to a row on tablets and phones. */
    stats: StatProps[];
    /** The chart across the page, under the stats. */
    chart?: Dashboard01Chart;
    /** Words that aren't content (names for screen readers), in English unless you pass your own. */
    labels?: Dashboard01Labels;
}
