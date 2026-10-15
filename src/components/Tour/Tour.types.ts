import type { CSSProperties, KeyboardEvent, ReactNode, RefObject } from "react";

import type { Placement } from "@/hooks/useFloating";

/** What a step points at: a CSS selector, a ref, or a function that returns the element. */
export type TourTarget = string | RefObject<HTMLElement | null> | (() => HTMLElement | null | undefined);

export interface TourStep {
    /** The part of the page this step is about. Leave it out (or point at something that isn't there) and the step
     * shows in the middle of the window, like a dialog: for a welcome or a last word. */
    target?: TourTarget;
    /** A few words that name the step. It names the card for screen readers too. */
    title: ReactNode;
    /** A sentence or two about the target. */
    content?: ReactNode;
    /** Where the card opens beside the target; it flips when there's no room.
     * @default "bottom" */
    placement?: Placement;
}

export interface TourLabels {
    /** @default "Back" */
    back?: string;
    /** @default "Next" */
    next?: string;
    /** The last step's button. @default "Done" */
    done?: string;
    /** The ✕ in the corner, for screen readers. @default "Skip tour" */
    skip?: string;
    /** The count in the corner of the card.
     * @default (step, total) => `Step ${step} of ${total}` */
    progress?(step: number, total: number): string;
}

export interface TourProps {
    /** The steps, in order. */
    steps: TourStep[];
    /** Shown, when you control it. */
    open?: boolean;
    /** Shown at first, when it controls itself.
     * @default false */
    defaultOpen?: boolean;
    /** Called when it opens or closes (Done, the ✕ or Escape). */
    onOpenChange?(open: boolean): void;
    /** The step showing, from 0, when you control it. */
    step?: number;
    /** The step it starts on, and goes back to after it closes, when it controls itself.
     * @default 0 */
    defaultStep?: number;
    /** Called with the new step's index on Back and Next. */
    onStepChange?(step: number): void;
    /** Called when the person presses Done on the last step. */
    onComplete?(): void;
    /** Called with the step's index when the person leaves early, with the ✕ or Escape. */
    onSkip?(step: number): void;
    /** Dims the page around the target, leaving a hole over it. The page still takes clicks and Tab: it's a cue, not a wall.
     * @default false */
    spotlight?: boolean;
    /** Room around the target inside the spotlight's hole, in pixels.
     * @default 6 */
    spotlightPadding?: number;
    /** The card's width: pixels, or any CSS width.
     * @default 320 */
    width?: number | string;
    /** The words it uses, for other languages. */
    labels?: TourLabels;
    className?: string;
}

export interface CoachmarkProps {
    /** What it points at: a CSS selector, a ref, or a function that returns the element. */
    target: TourTarget;
    /** A few words. It names the card for screen readers too. */
    title: ReactNode;
    /** A sentence about the target. */
    content?: ReactNode;
    /** Shown, when you control it. */
    open?: boolean;
    /** Shown at first, when it controls itself.
     * @default true */
    defaultOpen?: boolean;
    /** Called when it opens or is dismissed. */
    onOpenChange?(open: boolean): void;
    /** Where it opens beside the target; it flips when there's no room.
     * @default "bottom" */
    placement?: Placement;
    /** The button that dismisses it.
     * @default "Got it" */
    dismissLabel?: string;
    /** Moves focus into it when it opens. Leave it off for a hint that shows on load, so it doesn't pull focus away;
     * turn it on when it opens because of something the person did.
     * @default false */
    autoFocus?: boolean;
    /** The card's width: pixels, or any CSS width.
     * @default 280 */
    width?: number | string;
    className?: string;
}

/** Internal: what Tour and Coachmark pass to the card they share. */
export interface TourCardOptions {
    open: boolean;
    target: TourTarget | undefined;
    placement: Placement;
    /** Changes on every step, so focus moves into the card again. */
    stepKey: number;
    spotlight: boolean;
    spotlightPadding: number;
    autoFocus: boolean;
    width: number | string;
}

/** Internal: the card's parts. */
export interface TourCardProps {
    cardRef: RefObject<HTMLDivElement>;
    id: string;
    state: "open" | "closed";
    centred: boolean;
    style: CSSProperties;
    className?: string;
    title: ReactNode;
    content?: ReactNode;
    close?: ReactNode;
    progress?: string;
    actions: ReactNode;
    onKeyDown(event: KeyboardEvent<HTMLDivElement>): void;
}
