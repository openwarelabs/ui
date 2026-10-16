import type { Key, ReactNode } from "react";

import type { ISODate } from "@/components/Calendar/dates";
import type { ChartColor } from "@/components/Chart/Chart.types";

/** A day on the chart: a Date, or "YYYY-MM-DD". A Date is read in local time, so it's the day it shows in a calendar. */
export type GanttDate = Date | string;

/** How wide a day is: `day` for a few weeks, `week` for a quarter, `month` for a year or more. */
export type GanttScale = "day" | "week" | "month";

export interface GanttTask {
    /** Unique. */
    id: Key;
    /** Its name, written in the bar and read out. */
    title: string;
    /** The first day. */
    start: GanttDate;
    /** The last day, included: a task from the 3rd to the 12th is ten days long. A milestone ignores it. */
    end: GanttDate;
    /** How much is done, from 0 to 1: the bar fills up to it, and it's read out as "40% done". */
    progress?: number;
    /** A chart palette slot (1–8) or any CSS colour. By default a group's tasks share a slot, in order. */
    color?: ChartColor;
    /** The group it belongs under. Tasks with none come first, in one flat list. */
    group?: Key;
    /** The ids of the tasks that must finish before it starts, drawn as arrows into it. */
    dependsOn?: Key[];
    /** A single day shown as a diamond, such as a launch or a deadline. */
    milestone?: boolean;
    /** Makes the bar a link. */
    href?: string;
}

export interface GanttGroup {
    /** Matches the tasks' `group`. */
    id: Key;
    /** The heading over its tasks. */
    title: string;
}

/** A task's new days, as "YYYY-MM-DD", after it's moved or resized. */
export interface GanttChange {
    start: ISODate;
    end: ISODate;
}

export interface GanttTaskState {
    /** The bar's width in pixels, to show less in a narrow one. */
    width: number;
    /** It's picked up: being dragged, or carried with the keyboard. */
    isDragging: boolean;
}

export interface GanttLabels {
    /** The heading of the column of titles. @default "Task" */
    task?: string;
    /** Names the timeline's header for screen readers. @default "Timeline" */
    timeline?: string;
    /** The today line's title. @default "Today" */
    today?: string;
    /** The word for a single-day task in its name. @default "milestone" */
    milestone?: string;
    /** Two days as read out, from their short forms. @default (start, end) => `${start} to ${end}` */
    range?(start: string, end: string): string;
    /** The progress as read out. @default (percent) => `${percent}% done` */
    done?(percent: number): string;
    /** Read out when a bar is picked up. @default (task, range) => `Picked up ${task}. ${range}.` */
    pickedUp?(task: string, range: string): string;
    /** Read out at each step while it's carried. @default (task, range) => `${range}.` */
    moved?(task: string, range: string): string;
    /** Read out when it's put down. @default (task, range) => `Dropped ${task}: ${range}.` */
    dropped?(task: string, range: string): string;
    /** Read out when Escape puts it back. @default (task, range) => `Cancelled. ${task} is back at ${range}.` */
    cancelled?(task: string, range: string): string;
    /** Each bar's description, telling screen reader users how to move it. */
    instructions?: string;
}

export interface GanttProps {
    /** The tasks, in the order they're shown within their groups. */
    tasks: GanttTask[];
    /** The groups and their order. Without it, groups come from the tasks in the order they first appear. */
    groups?: GanttGroup[];
    /** The first day shown. @default the earliest task, with some room before it */
    start?: GanttDate;
    /** The last day shown. @default the latest task, with some room after it */
    end?: GanttDate;
    /** How wide a day is. @default `day` up to six weeks, `week` up to six months, then `month` */
    scale?: GanttScale;
    /** Where the today line is drawn. `null` draws none. @default today */
    today?: GanttDate | null;
    /**
     * Lets people move and resize the bars: by dragging a bar or its edges, or with the keyboard (Space picks it up,
     * the arrow keys shift it a day, Shift with them changes its end, Space drops it). Called with the task and its
     * new days, as "YYYY-MM-DD".
     */
    onChange?(task: GanttTask, change: GanttChange): void;
    /** Called when a bar is clicked, or Enter is pressed on it. */
    onTaskClick?(task: GanttTask): void;
    /** What a bar shows. @default the title */
    renderTask?(task: GanttTask, state: GanttTaskState): ReactNode;
    /** Draws an arrow from each task to the ones that depend on it. @default true */
    dependencies?: boolean;
    /** Each row's height in pixels. @default 36 */
    rowHeight?: number;
    /** The width of the column of titles, which stays put while the timeline scrolls. @default 200 */
    labelWidth?: number;
    /** A fixed height; the rows scroll within it. */
    height?: number | string;
    /** The most it grows before the rows scroll. */
    maxHeight?: number | string;
    /** Month and day names follow this locale, e.g. "en-IE". @default the browser's */
    locale?: string;
    /** Names the chart for screen readers: "Launch plan". */
    label: string;
    /** The words it uses, for other languages. */
    labels?: GanttLabels;
    className?: string;
}

/** A bar on the move: where it started and where it would go. Internal. */
export interface GanttDrag {
    id: Key;
    /** Its name in what's read out. */
    name: string;
    /** `move` shifts both days; `start` and `end` move one edge. */
    mode: "move" | "start" | "end";
    from: GanttChange;
    to: GanttChange;
    keyboard: boolean;
}

/** One row of the chart: a group's heading, or a task. Internal. */
export type GanttRow = { kind: "group"; group: GanttGroup; color: string } | { kind: "task"; task: GanttTask; color: string };

/** A span of the header: a month over its days, a year over its months. Internal. */
export interface GanttSegment {
    key: string;
    label: string;
    /** From the first day shown, in days. */
    offset: number;
    /** In days. */
    length: number;
}
