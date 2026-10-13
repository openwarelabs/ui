import { useEffect, useRef, useState, type ReactNode } from "react";

import { manualPopover, useFloating } from "../../hooks/useFloating";
import { usePresence } from "../../hooks/usePresence";

export interface TooltipProps {
    /** A few words. */
    label: ReactNode;
    /** The thing it explains: usually an icon-only Button with the same words as its aria-label. */
    children: ReactNode;
    /** Which side it prefers; it flips when there's no room.
     * @default "top" */
    placement?: "top" | "bottom";
    /** Milliseconds of hovering before it shows. Moving to a neighbour while one is showing skips the wait.
     * @default 400 */
    delay?: number;
}

/** When the last tooltip closed: another one opened soon after shows at once, as people scan a toolbar. */
let lastClosedAt = 0;
const warmWindow = 500;

/**
 * A small dark label above its child on hover or keyboard focus. It's for sighted users only: the child
 * carries the same words for screen readers (an aria-label, or visually hidden text), so they aren't read twice.
 * It sits in the top layer, so scroll areas and dialogs can't clip it.
 */
export function Tooltip({ children, label, placement = "top", delay = 400 }: TooltipProps) {
    const anchorRef = useRef<HTMLSpanElement>(null);
    const bubbleRef = useRef<HTMLSpanElement>(null);
    const timer = useRef(0);
    const [open, setOpen] = useState(false);
    const { mounted, state } = usePresence(open, 100);
    const style = useFloating({ open: mounted, anchorRef, floatingRef: bubbleRef, placement, offset: 6 });

    const show = (immediately = false) => {
        window.clearTimeout(timer.current);
        if (immediately || Date.now() - lastClosedAt < warmWindow) setOpen(true);
        else timer.current = window.setTimeout(() => setOpen(true), delay);
    };
    const hide = () => {
        window.clearTimeout(timer.current);
        setOpen((current) => {
            if (current) lastClosedAt = Date.now();
            return false;
        });
    };

    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Escape hides it without moving focus, as WCAG 1.4.13 asks.
    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") hide();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <span
            ref={anchorRef}
            className="ow-tooltip"
            onPointerEnter={(event) => {
                if (event.pointerType === "mouse") show();
            }}
            onPointerLeave={hide}
            onPointerDown={hide}
            onFocus={(event) => {
                if (event.target.matches(":focus-visible")) show(true);
            }}
            onBlur={hide}
        >
            {children}
            {mounted ? (
                <span ref={bubbleRef} {...manualPopover} data-state={state} className="ow-tooltip__bubble ow-floating" style={style} aria-hidden="true">
                    {label}
                </span>
            ) : null}
        </span>
    );
}
