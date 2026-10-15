import type { HTMLAttributes, ReactNode } from "react";

import type { SpaceToken } from "@/components/Layout/Layout";

export interface CarouselProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** Names the carousel for screen readers, e.g. "Featured projects". */
    label: string;
    /** The slides: one CarouselSlide each. */
    children: ReactNode;
    /** How many slides show at once. A fraction (1.2) lets the next one peek in. To change it with the screen's width,
     * set `--ow-carousel-per-view` in your own CSS instead.
     * @default 1 */
    slidesPerView?: number;
    /** The space between slides.
     * @default "md" */
    gap?: SpaceToken;
    /** Where a slide comes to rest: at the `start` of the carousel, or in its `center` with its neighbours either side.
     * @default "start" */
    align?: "start" | "center";
    /** The slide at the start (or centre), from 0, when you control it. */
    index?: number;
    /** The slide it starts on, when it controls itself.
     * @default 0 */
    defaultIndex?: number;
    /** Called when another slide comes to rest, from the buttons, the dots, the keys or a swipe. */
    onIndexChange?(index: number): void;
    /** Next from the last slide goes back to the first, and previous from the first goes to the last.
     * @default false */
    loop?: boolean;
    /** Moves on by itself every this many milliseconds (`true` is 5000), with a button to pause. It waits while the
     * pointer is over it or focus is in it, and starts paused when the system asks for reduced motion.
     * @default false */
    autoplay?: boolean | number;
    /** Where the previous and next buttons go: `overlay` on the slides' edges, `outside` beside them (it takes room
     * either side), or `false` for none.
     * @default "overlay" */
    arrows?: "overlay" | "outside" | false;
    /** Shows a dot for each place it can rest, to go straight there.
     * @default true */
    indicators?: boolean;
    /** The words it uses, for other languages. */
    labels?: CarouselLabels;
}

export interface CarouselLabels {
    /** @default "Previous slide" */
    previous?: string;
    /** @default "Next slide" */
    next?: string;
    /** The button that stops autoplay. @default "Pause slides" */
    pause?: string;
    /** The button that starts it again. @default "Play slides" */
    play?: string;
    /** Names the dots. @default "Choose a slide" */
    indicators?: string;
    /** Names a dot, and is read out when another slide comes to rest. @default (n, count) => `Slide ${n} of ${count}` */
    slide?(n: number, count: number): string;
    /** Names a slide, which screen readers already call a slide. @default (n, count) => `${n} of ${count}` */
    position?(n: number, count: number): string;
}

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    /** Names the slide for screen readers.
     * @default its place, e.g. "2 of 5" */
    label?: string;
}
