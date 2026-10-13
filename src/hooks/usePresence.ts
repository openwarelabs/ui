import { useEffect, useState } from "react";

/** How long a closing layer stays mounted for its exit animation (base.css: ow-floating-out). */
export const exitDuration = 140;

export interface Presence {
    /** Render the element while this is true: it stays true through the exit animation. */
    mounted: boolean;
    /** Put this on the element as data-state, so CSS can run the enter or the exit animation. */
    state: "open" | "closed";
}

/**
 * Keeps an element mounted for a moment after `open` turns false, so it can animate out instead of vanishing.
 * With reduced motion it unmounts at once.
 */
export function usePresence(open: boolean, exitMs = exitDuration): Presence {
    const [mounted, setMounted] = useState(open);
    if (open && !mounted) setMounted(true);

    useEffect(() => {
        if (open || !mounted) return undefined;
        const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const timer = window.setTimeout(() => setMounted(false), reduceMotion ? 0 : exitMs);
        return () => window.clearTimeout(timer);
    }, [open, mounted, exitMs]);

    return { mounted: open || mounted, state: open ? "open" : "closed" };
}
