import type { HTMLAttributes, ReactNode } from "react";

import type { SpaceToken } from "@/components/Layout/Layout";

/** Which way the items travel. `left` and `right` make a row; `up` and `down` make a column. */
export type MarqueeDirection = "left" | "right" | "up" | "down";

export interface MarqueeLabels {
    /** The button that stops the items moving. @default "Pause" */
    pause?: string;
    /** The same button once they're stopped. @default "Play" */
    play?: string;
}

export interface MarqueeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The items, in order. They're repeated to make the loop, and every copy after the first is hidden from screen readers. */
    children: ReactNode;
    /** How fast the items travel, in pixels a second.
     * @default 40 */
    speed?: number;
    /** Which way they go. `left` and `right` make a row; `up` and `down` make a column, which needs a height.
     * @default "left" */
    direction?: MarqueeDirection;
    /** Holds still while the pointer is over it.
     * @default true */
    pauseOnHover?: boolean;
    /** Holds still while focus is on something inside it, so a link can be read and followed.
     * @default true */
    pauseOnFocus?: boolean;
    /** The space between items, from the spacing scale or in pixels.
     * @default "2xl" */
    gap?: SpaceToken | number;
    /** Fades the items out at both ends.
     * @default true */
    fade?: boolean;
    /** Repeats the items until they fill the width (or height), so a short list still loops without a gap.
     * @default true */
    autoFill?: boolean;
    /** A button to pause and play it, which moving content needs (WCAG 2.2.2). Hidden with reduced motion, when nothing moves.
     * @default true */
    controls?: boolean;
    /** Stopped, when you control it. */
    paused?: boolean;
    /** Whether it starts stopped, when it controls itself.
     * @default false */
    defaultPaused?: boolean;
    /** Called when the button stops or starts it. */
    onPausedChange?(paused: boolean): void;
    /** Names the strip for screen readers, e.g. "Customer logos". With it, the strip is a region. */
    label?: string;
    /** Words that aren't content (the button's names), in English unless you pass your own. */
    labels?: MarqueeLabels;
}
