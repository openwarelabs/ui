import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { Button } from "@/components/Button/Button";
import { useControllableState } from "@/hooks/useControllableState";
import { PauseIcon, PlayIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { MarqueeProps } from "./Marquee.types";

export type { MarqueeDirection, MarqueeLabels, MarqueeProps } from "./Marquee.types";

const motionQuery = "(prefers-reduced-motion: reduce)";

/** The most times the items are repeated to fill the strip, so a one-item list can't make hundreds of copies. */
const maxCopies = 12;

/** Whether the system asks for reduced motion, kept up to date. False until it's known, and on a server. */
function useReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const media = window.matchMedia?.(motionQuery);
        if (!media) return undefined;
        const update = () => setReduced(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    return reduced;
}

/** Copies after the first are hidden from screen readers and can't be tabbed to, so each link is reached once. */
function hide(element: HTMLDivElement | null) {
    if (element) element.inert = true;
}

/**
 * A strip of items that travel endlessly in one direction: a row of customers' logos, a ticker of figures, a tape
 * of tags. It holds still under the pointer and while focus is inside, and has a button to stop it. With reduced
 * motion nothing moves: the items stand in a row that wraps.
 */
export function Marquee({
    children,
    speed = 40,
    direction = "left",
    pauseOnHover = true,
    pauseOnFocus = true,
    gap = "2xl",
    fade = true,
    autoFill = true,
    controls = true,
    paused,
    defaultPaused = false,
    onPausedChange,
    label,
    labels = {},
    className,
    style,
    ...props
}: MarqueeProps) {
    const reduced = useReducedMotion();
    const [stopped, setStopped] = useControllableState(paused, defaultPaused, onPausedChange);
    const horizontal = direction === "left" || direction === "right";
    const viewportRef = useRef<HTMLDivElement>(null);
    const groupRef = useRef<HTMLDivElement>(null);
    const [copies, setCopies] = useState(1);
    const [distance, setDistance] = useState(0);

    // How many times the items repeat to fill the strip, and how far one loop travels (half the track), measured
    // again whenever the strip or the items change size.
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const group = groupRef.current;
        if (reduced || !viewport || !group || typeof ResizeObserver === "undefined") {
            setCopies(1);
            setDistance(0);
            return undefined;
        }
        const measure = () => {
            const groupSize = horizontal ? group.getBoundingClientRect().width : group.getBoundingClientRect().height;
            const viewportSize = horizontal ? viewport.clientWidth : viewport.clientHeight;
            const needed = autoFill && groupSize > 0 ? Math.min(maxCopies, Math.ceil(viewportSize / groupSize)) : 1;
            const count = Math.max(1, needed);
            setCopies(count);
            setDistance(groupSize * count);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        observer.observe(group);
        return () => observer.disconnect();
    }, [reduced, autoFill, horizontal]);

    const duration = distance > 0 && speed > 0 ? distance / speed : 0;
    const vars = {
        "--ow-marquee-gap": typeof gap === "number" ? `${gap}px` : gap === "none" ? "0px" : `var(--ow-space-${gap})`,
        ...(duration > 0 ? { "--ow-marquee-duration": `${duration}s` } : {}),
        ...style,
    } as CSSProperties;

    // The first group is the one screen readers get; the rest are copies that make the loop seamless.
    const groups = reduced ? 1 : copies * 2;
    const toggleLabel = stopped ? (labels.play ?? "Play") : (labels.pause ?? "Pause");

    return (
        <div
            role={label ? "region" : undefined}
            aria-label={label}
            className={cx(
                "ow-marquee",
                `ow-marquee--${direction}`,
                horizontal ? "ow-marquee--horizontal" : "ow-marquee--vertical",
                fade && "ow-marquee--fade",
                pauseOnHover && "ow-marquee--pause-hover",
                pauseOnFocus && "ow-marquee--pause-focus",
                reduced && "ow-marquee--static",
                className,
            )}
            style={vars}
            data-paused={stopped || undefined}
            data-ready={duration > 0 || undefined}
            {...props}
        >
            <div ref={viewportRef} className="ow-marquee__viewport">
                <div className="ow-marquee__track">
                    <div ref={groupRef} className="ow-marquee__group">
                        {children}
                    </div>
                    {Array.from({ length: groups - 1 }, (_, index) => (
                        <div key={index} ref={hide} className="ow-marquee__group ow-marquee__group--copy" aria-hidden="true">
                            {children}
                        </div>
                    ))}
                </div>
            </div>
            {controls && !reduced ? (
                <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    className="ow-marquee__control"
                    aria-label={toggleLabel}
                    onClick={() => setStopped((value) => !value)}
                >
                    {stopped ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
                </Button>
            ) : null}
        </div>
    );
}
