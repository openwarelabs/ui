import type { ReactNode } from "react";

/** A chart series colour: 1 to 8 for the chart palette's slots, or any CSS colour. */
export type ChartColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | (string & {});

export interface ChartSeries {
    /** The key in each row that holds this series' number. */
    key: string;
    /** Its name, in the legend, the readout and the table. */
    label: string;
    /**
     * A palette slot (1–8) or a CSS colour. By default series take the slots in order. Give each one a fixed slot when
     * a filter can hide some, so the rest keep their colours.
     */
    color?: ChartColor;
}

export type ChartRow = Record<string, unknown>;

export interface CartesianChartProps {
    /** One row per point along the x axis, e.g. `{ month: "Jan", visits: 120, signups: 30 }`. */
    data: ChartRow[];
    /** The key in each row for the x axis: a label, a number or a Date. */
    index: string;
    /** The numbers to plot, one series each; at most eight. */
    series: ChartSeries[];
    /** What the chart shows, e.g. "Visits per month". Read out by screen readers and used as the table's caption. */
    label: string;
    /** Height of the plot in pixels, axes included. @default 240 */
    height?: number;
    /** Turns a number into the text in the readout and the table, e.g. (v) => `€${v}`. @default the locale's format */
    formatValue?(value: number): string;
    /** Turns a number into a y axis label. @default compact: 1.2K, 3M */
    formatTick?(value: number): string;
    /** Turns an x value into its label. @default dates as "12 Oct", anything else as text */
    formatIndex?(value: unknown): string;
    /** Shows the legend above the plot. @default true when there's more than one series */
    legend?: boolean;
    className?: string;
}

export interface LineChartProps extends CartesianChartProps {
    /** Fills under each line with a light wash of its colour. @default false */
    area?: boolean;
    /** Joins the points with smooth curves instead of straight lines. @default false */
    curved?: boolean;
}

export interface BarChartProps extends CartesianChartProps {
    /** Stacks the series in one bar per row instead of side by side. @default false */
    stacked?: boolean;
}

export interface DonutChartSlice {
    label: string;
    value: number;
    color?: ChartColor;
}

export interface DonutChartProps {
    /** One slice each, largest first reads best; at most eight. Fold the smallest into an "Other" slice past that. */
    data: DonutChartSlice[];
    /** What the chart shows, e.g. "Spend by category". Read out by screen readers and used as the table's caption. */
    label: string;
    /** @default the locale's format */
    formatValue?(value: number): string;
    /** In the middle: a total, or anything short. @default the total, formatted, over the word "Total" */
    center?: ReactNode;
    /** The word under the total in the middle. @default "Total" */
    centerLabel?: ReactNode;
    /** Diameter in pixels. @default 180 */
    size?: number;
    /** Shows the legend, with each slice's value and share, beside the ring. @default true */
    legend?: boolean;
    className?: string;
}

export interface SparklineProps {
    /** The numbers, oldest first. */
    data: number[];
    /** Read out by screen readers, e.g. "Sign-ups over the last 30 days, rising from 12 to 48". */
    "aria-label": string;
    /** A palette slot (1–8) or a CSS colour. @default 1 */
    color?: ChartColor;
    /** Fills under the line with a light wash. @default true */
    area?: boolean;
    /** @default 120 */
    width?: number | string;
    /** @default 32 */
    height?: number;
    className?: string;
}
