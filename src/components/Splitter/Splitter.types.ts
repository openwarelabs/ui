import type { HTMLAttributes, ReactNode } from "react";

export type SplitterDirection = "horizontal" | "vertical";

export interface SplitterProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** SplitterPanels with a SplitterHandle between each pair, straight inside (fragments are fine). */
    children: ReactNode;
    /** `horizontal` puts the panels side by side, `vertical` stacks them.
     * @default "horizontal" */
    direction?: SplitterDirection;
    /** Each panel's size in percent, in order, adding up to 100, when you control it. */
    sizes?: number[];
    /** The sizes at first, when it controls itself. Without it, each panel's `defaultSize` is used, and panels without
     * one share what's left. */
    defaultSizes?: number[];
    /** Called with every panel's size, in percent, as they change: while dragging, on each key press, on collapsing. */
    onSizesChange?(sizes: number[]): void;
    /** Remembers the sizes in localStorage under this name and puts them back next time. Give each splitter its own. */
    autoSaveId?: string;
}

export interface SplitterPanelProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    /** Its size at first, in percent of the splitter. Panels without one share what the others leave. */
    defaultSize?: number;
    /** The smallest it can be dragged, in percent. @default 0 */
    minSize?: number;
    /** The largest it can be dragged, in percent. @default 100 */
    maxSize?: number;
    /** Lets it fold away: dragging well past `minSize`, double-clicking its handle, or Enter on the handle collapses it
     * to `collapsedSize`, and the same expands it again. @default false */
    collapsible?: boolean;
    /** Its size when collapsed, in percent: 0 hides it, more leaves a strip such as a rail of icons. @default 0 */
    collapsedSize?: number;
    /** Called with its new size, in percent, when it changes. */
    onResize?(size: number): void;
    /** Called when it collapses or expands. */
    onCollapsedChange?(collapsed: boolean): void;
}

export interface SplitterHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> {
    /** Names the handle for screen readers: say which panel it resizes, such as "Resize sidebar".
     * @default "Resize panels" */
    "aria-label"?: string;
    /** Shows a small grip on the line, so it's easier to see and to catch on a touch screen. @default false */
    grip?: boolean;
    /** Keeps the panels at their sizes: the handle can't be dragged or focused. @default false */
    disabled?: boolean;
}

/** A panel's limits, in percent, as the layout maths reads them. Internal. */
export interface SplitterPanelLimits {
    minSize: number;
    maxSize: number;
    collapsible: boolean;
    collapsedSize: number;
}

/** What a Splitter shares with its panels and handles. Internal. */
export interface SplitterState {
    direction: SplitterDirection;
    sizes: number[];
    limits: SplitterPanelLimits[];
    /** Each panel's element id, for the handles' aria-controls. */
    panelIds: string[];
    /** Moves handle `handle` by `delta` percent; `snap` lets a collapsible panel fold or unfold on the way. */
    move(handle: number, delta: number, snap: boolean, from?: number[]): void;
    /** Collapses or expands the collapsible panel beside the handle. */
    toggle(handle: number): void;
    /** The panels' length along the direction, in pixels, and whether a horizontal splitter runs right to left. */
    measure(): { length: number; reversed: boolean };
}
