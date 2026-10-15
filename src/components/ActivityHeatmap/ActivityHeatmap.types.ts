import type { ReactNode } from "react";

import type { ISODate } from "@/components/Calendar/dates";
import type { ChartColor } from "@/components/Chart/Chart.types";

/** One day's number: `{ date: "2026-03-03", count: 12 }`. */
export interface ActivityHeatmapDay {
    /** The day, as "YYYY-MM-DD". */
    date: ISODate;
    /** How many things happened that day. Days left out count as 0. */
    count: number;
}

export interface ActivityHeatmapLabels {
    /** A day's number in words, in the tooltip, the cell's name and the summary.
     * @default (count) => "No contributions", "1 contribution", "12 contributions" */
    count?(count: number): string;
    /** A cell's name for screen readers, from its count in words and its full date.
     * @default (count, date) => `${count} on ${date}`, e.g. "12 contributions on Tuesday, 3 March 2026" */
    day?(count: string, date: string): string;
    /** What a screen reader hears before the grid: the total, and the busiest day when there is one.
     * @default "1,204 contributions in total. The busiest day was Tuesday, 3 March 2026, with 42 contributions." */
    summary?(total: string, busiest?: { date: string; count: string }): string;
    /** The word before the legend's swatches. @default "Less" */
    less?: string;
    /** The word after them. @default "More" */
    more?: string;
}

export interface ActivityHeatmapProps {
    /** The numbers, one entry per day, in any order. Days with no entry show as empty; two entries for a day add up. */
    data: ActivityHeatmapDay[];
    /** What it shows, e.g. "Commits in the last year". It names the grid for screen readers. */
    label: string;
    /** The first day shown, "YYYY-MM-DD". @default 52 weeks before `end` */
    start?: ISODate;
    /** The last day shown, "YYYY-MM-DD". @default today */
    end?: ISODate;
    /** 1 starts each column on Monday, 0 on Sunday. @default the locale's first day of the week */
    weekStartsOn?: 0 | 1;
    /** How many shades, counting the empty one: 5 is empty and four steps up to the busiest day. Ignored with `thresholds`.
     * @default 5 */
    levels?: number;
    /**
     * The lowest count for each shade above empty, rising, e.g. `[1, 5, 10, 20]`: 1–4 is the lightest, 20 and over the
     * darkest. @default `levels - 1` equal steps up to the busiest day
     */
    thresholds?: number[];
    /** A chart palette slot (1–8) or any CSS colour, such as `"var(--ow-primary)"`. The shades are mixed from it and the
     * empty colour, so they follow the theme. @default 1 */
    color?: ChartColor;
    /** Month and weekday names, dates and numbers follow this locale, e.g. "en-IE". @default the browser's */
    locale?: string;
    /** The tooltip for the hovered or focused day. @default its count and date, e.g. "12 contributions on Tue, 3 Mar 2026" */
    formatTooltip?(day: ActivityHeatmapDay): ReactNode;
    /** Makes each day a button: called with the day when it's clicked, or Enter or Space is pressed on it. */
    onDayClick?(day: ActivityHeatmapDay): void;
    /** The side of each square in pixels; the gap between them is a quarter of it. @default 12 */
    cellSize?: number;
    /** Shows "Less ▢▢▢▢▢ More" under the grid. @default true */
    showLegend?: boolean;
    /** The words it uses, for other languages. */
    labels?: ActivityHeatmapLabels;
    className?: string;
}

/** What `Intl.Locale` says about a locale's week, where the browser supports it: 1 is Monday … 7 is Sunday. Internal. */
export interface LocaleWeekInfo {
    getWeekInfo?(): { firstDay: number };
    weekInfo?: { firstDay: number };
}
