import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { manualPopover, useFloating, type Placement } from "@/hooks/useFloating";
import { usePresence } from "@/hooks/usePresence";
import { cx } from "@/utils/cx";
import { Button } from "@/components/Button/Button";
import { CloseButton } from "@/components/Button/ButtonGroup";
import type { CoachmarkProps, TourCardOptions, TourCardProps, TourProps, TourTarget } from "./Tour.types";

export type { CoachmarkProps, TourLabels, TourProps, TourStep, TourTarget } from "./Tour.types";

function resolveTarget(target: TourTarget | undefined): HTMLElement | null {
    if (!target || typeof document === "undefined") return null;
    if (typeof target === "string") return document.querySelector<HTMLElement>(target);
    if (typeof target === "function") return target() ?? null;
    return target.current;
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function showLayer(element: HTMLElement | null) {
    try {
        if (element && !element.matches(":popover-open")) element.showPopover();
    } catch {
        // Without popover support it still shows as a fixed element.
    }
}

function hideLayer(element: HTMLElement | null) {
    try {
        if (element?.matches(":popover-open")) element.hidePopover();
    } catch {
        // Already hidden.
    }
}

/**
 * The card both Tour and Coachmark show: in the top layer beside its target (or centred when there's none), with an
 * optional spotlight under it, the target scrolled into view, focus moved in on each step and back out when it closes.
 */
function useTourCard({ open, target, placement, stepKey, spotlight, spotlightPadding, autoFocus, width }: TourCardOptions) {
    const cardRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    const { mounted, state } = usePresence(open);
    const [element, setElement] = useState<HTMLElement | null>(null);

    // Find the target while open; keep the last one while the card animates out.
    useLayoutEffect(() => {
        if (open) setElement(resolveTarget(target));
    }, [open, target, stepKey]);

    const centred = element === null;
    // A new ref object for each target, so useFloating places the card again when the target changes.
    const anchorRef = useMemo(() => ({ current: element }), [element]);

    // The spotlight goes into the top layer first, so the card sits above it.
    const showSpotlight = mounted && spotlight;
    useLayoutEffect(() => {
        const layer = spotlightRef.current;
        if (!showSpotlight || !layer) return undefined;
        showLayer(layer);
        // Turned on while the card was already up: lift the card back above it.
        const card = cardRef.current;
        if (card?.matches(":popover-open")) {
            hideLayer(card);
            showLayer(card);
        }
        return () => hideLayer(layer);
    }, [showSpotlight]);

    const floating = useFloating({ open: mounted && !centred, anchorRef, floatingRef: cardRef, placement, offset: 12, maxHeight: 640 });

    // Without a target the card shows in the middle of the window, where the browser puts a popover by itself.
    useLayoutEffect(() => {
        const card = cardRef.current;
        if (!mounted || !centred || !card) return undefined;
        showLayer(card);
        return () => hideLayer(card);
    }, [mounted, centred]);

    // The hole in the spotlight follows the target as the page scrolls and resizes.
    const [rect, setRect] = useState<DOMRect | null>(null);
    // It glides from one target to the next, but tracks scrolling without lag.
    const [moving, setMoving] = useState(false);
    const lastElementRef = useRef<HTMLElement | null>(null);
    useLayoutEffect(() => {
        const previous = lastElementRef.current;
        lastElementRef.current = element;
        if (!previous || !element || previous === element) return undefined;
        setMoving(true);
        const timer = window.setTimeout(() => setMoving(false), 400);
        return () => window.clearTimeout(timer);
    }, [element]);
    useLayoutEffect(() => {
        if (!showSpotlight || !element) {
            setRect(null);
            return undefined;
        }
        const update = () => setRect(element.getBoundingClientRect());
        update();
        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(update);
        observer?.observe(element);
        window.addEventListener("scroll", update, true);
        window.addEventListener("resize", update);
        return () => {
            observer?.disconnect();
            window.removeEventListener("scroll", update, true);
            window.removeEventListener("resize", update);
        };
    }, [showSpotlight, element]);

    // Bring the target into view when it's not wholly on screen.
    useEffect(() => {
        if (!open || !element) return;
        const box = element.getBoundingClientRect();
        const inView = box.top >= 0 && box.left >= 0 && box.bottom <= window.innerHeight && box.right <= window.innerWidth;
        if (!inView) element.scrollIntoView({ block: "center", inline: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
    }, [open, element]);

    // Focus goes to the card on each step, so its title and text are read out, and back where it was afterwards.
    useEffect(() => {
        if (!open || !autoFocus) return undefined;
        if (!returnFocusRef.current) {
            const active = document.activeElement as HTMLElement | null;
            if (active && active !== document.body && !cardRef.current?.contains(active)) returnFocusRef.current = active;
        }
        const frame = requestAnimationFrame(() => cardRef.current?.focus({ preventScroll: true }));
        return () => cancelAnimationFrame(frame);
    }, [open, autoFocus, stepKey, element]);

    useEffect(() => {
        if (open) return;
        const back = returnFocusRef.current;
        returnFocusRef.current = null;
        const active = document.activeElement;
        if (back?.isConnected && (!active || active === document.body || cardRef.current?.contains(active))) back.focus();
    }, [open]);

    const pad = spotlightPadding;
    const spotlightNode = showSpotlight ? (
        <div ref={spotlightRef} {...manualPopover} data-state={state} aria-hidden="true" className="ow-tour-spotlight">
            {rect ? (
                <div
                    className="ow-tour-spotlight__hole"
                    data-moving={moving || undefined}
                    style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + 2 * pad, height: rect.height + 2 * pad }}
                />
            ) : (
                <div className="ow-tour-spotlight__dim" />
            )}
        </div>
    ) : null;

    const style: CSSProperties = centred ? { width } : { ...floating, width };
    return { mounted, state, cardRef, centred, style, spotlightNode };
}

const isEditable = (target: EventTarget) => target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * A guided tour: a card beside each part of the page in turn, with what it's for, Back and Next. Steps without a
 * target show in the middle, for a welcome. It's non-modal, so the page stays usable; `spotlight` dims the rest of it.
 */
export function Tour({
    steps,
    open,
    defaultOpen = false,
    onOpenChange,
    step,
    defaultStep = 0,
    onStepChange,
    onComplete,
    onSkip,
    spotlight = false,
    spotlightPadding = 6,
    width = 320,
    labels = {},
    className,
}: TourProps) {
    const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
    const [rawIndex, setIndex] = useControllableState(step, defaultStep, onStepChange);
    const total = steps.length;
    const index = Math.min(Math.max(0, rawIndex), Math.max(0, total - 1));
    const current = steps[index];
    const id = useId();
    const { mounted, state, cardRef, centred, style, spotlightNode } = useTourCard({
        open: isOpen && current !== undefined,
        target: current?.target,
        placement: current?.placement ?? "bottom",
        stepKey: index,
        spotlight,
        spotlightPadding,
        autoFocus: true,
        width,
    });

    const last = index === total - 1;
    const skip = () => {
        setOpen(false);
        onSkip?.(index);
    };
    const back = () => {
        if (index > 0) setIndex(index - 1);
    };
    const next = () => {
        if (!last) {
            setIndex(index + 1);
            return;
        }
        setOpen(false);
        onComplete?.();
    };

    // Escape anywhere leaves the tour, unless something on the page used it first.
    const skipRef = useRef(skip);
    skipRef.current = skip;
    useEffect(() => {
        if (!isOpen) return undefined;
        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key !== "Escape" || event.defaultPrevented) return;
            event.preventDefault();
            skipRef.current();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen]);

    // Once it has closed, a tour that keeps its own step starts from the beginning next time.
    useEffect(() => {
        if (!mounted && step === undefined) setIndex(defaultStep);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only when it unmounts.
    }, [mounted]);

    if (!mounted || !current) return null;

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.altKey || event.ctrlKey || event.metaKey || isEditable(event.target)) return;
        if (event.key === "ArrowRight" && !last) {
            event.preventDefault();
            next();
        } else if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            back();
        }
    };

    const progress = labels.progress ?? ((n: number, of: number) => `Step ${n} of ${of}`);

    return (
        <>
            {spotlightNode}
            <TourCard
                cardRef={cardRef}
                id={id}
                state={state}
                centred={centred}
                style={style}
                className={className}
                title={current.title}
                content={current.content}
                onKeyDown={onKeyDown}
                close={<CloseButton size="sm" label={labels.skip ?? "Skip tour"} onClick={skip} />}
                progress={total > 1 ? progress(index + 1, total) : undefined}
                actions={
                    <>
                        {index > 0 ? (
                            <Button size="sm" variant="ghost" onClick={back}>
                                {labels.back ?? "Back"}
                            </Button>
                        ) : null}
                        <Button size="sm" variant="primary" onClick={next}>
                            {last ? (labels.done ?? "Done") : (labels.next ?? "Next")}
                        </Button>
                    </>
                }
            />
        </>
    );
}

/** A single hint beside one control, with a button that dismisses it: for pointing out something new. */
export function Coachmark({
    target,
    title,
    content,
    open,
    defaultOpen = true,
    onOpenChange,
    placement = "bottom",
    dismissLabel = "Got it",
    autoFocus = false,
    width = 280,
    className,
}: CoachmarkProps) {
    const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
    const id = useId();
    const { mounted, state, cardRef, centred, style } = useTourCard({
        open: isOpen,
        target,
        placement,
        stepKey: 0,
        spotlight: false,
        spotlightPadding: 0,
        autoFocus,
        width,
    });

    if (!mounted) return null;

    return (
        <TourCard
            cardRef={cardRef}
            id={id}
            state={state}
            centred={centred}
            style={style}
            className={cx("ow-tour--coachmark", className)}
            title={title}
            content={content}
            onKeyDown={(event) => {
                if (event.key !== "Escape") return;
                event.preventDefault();
                setOpen(false);
            }}
            actions={
                <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
                    {dismissLabel}
                </Button>
            }
        />
    );
}

function TourCard({ cardRef, id, state, centred, style, className, title, content, close, progress, actions, onKeyDown }: TourCardProps) {
    const described = [content ? `${id}-content` : "", progress ? `${id}-progress` : ""].filter(Boolean).join(" ");
    return (
        <div
            ref={cardRef}
            {...manualPopover}
            data-state={state}
            role="dialog"
            aria-labelledby={`${id}-title`}
            aria-describedby={described || undefined}
            tabIndex={-1}
            className={cx("ow-tour", "ow-floating", centred && "ow-tour--centred", className)}
            style={style}
            onKeyDown={onKeyDown}
        >
            <div className="ow-tour__header">
                <div id={`${id}-title`} className="ow-tour__title">
                    {title}
                </div>
                {close}
            </div>
            {content ? (
                <div id={`${id}-content`} className="ow-tour__content">
                    {content}
                </div>
            ) : null}
            <div className="ow-tour__footer">
                {progress ? (
                    <span id={`${id}-progress`} className="ow-tour__progress">
                        {progress}
                    </span>
                ) : null}
                <div className="ow-tour__actions">{actions}</div>
            </div>
        </div>
    );
}
