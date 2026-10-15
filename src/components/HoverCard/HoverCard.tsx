import { useCallback, useEffect, useRef, type FocusEvent } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "@/hooks/useFloating";
import { usePresence } from "@/hooks/usePresence";
import { cx } from "@/utils/cx";
import type { HoverCardProps } from "./HoverCard.types";

export type { HoverCardProps } from "./HoverCard.types";

/**
 * A preview card that opens when the pointer rests on its trigger (a link to a person or a page) or the trigger gets
 * keyboard focus, and closes when the pointer leaves both, on Escape, or when focus moves away. It's extra: whatever
 * it shows must also be reachable through the trigger, as touch screens never open it.
 */
export function HoverCard({
    trigger,
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = "bottom",
    openDelay = 500,
    closeDelay = 250,
    width = 320,
    className,
}: HoverCardProps) {
    const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const timer = useRef(0);
    /** The pointer is over the trigger or the card. */
    const hovering = useRef(false);
    /** Focus is going back to the trigger after Escape: don't reopen for it. */
    const returning = useRef(false);
    const { mounted, state } = usePresence(isOpen);
    const style = useFloating({ open: mounted, anchorRef, floatingRef: cardRef, placement, offset: 8, maxHeight: 640 });

    const inside = (node: Node | null) => Boolean(node && (anchorRef.current?.contains(node) || cardRef.current?.contains(node)));

    const openSoon = (delay: number) => {
        window.clearTimeout(timer.current);
        if (delay <= 0) setOpen(true);
        else timer.current = window.setTimeout(() => setOpen(true), delay);
    };
    const closeSoon = () => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
            // Someone clicked or tabbed into the card: it stays until they leave it.
            if (!cardRef.current?.contains(document.activeElement)) setOpen(false);
        }, closeDelay);
    };

    const close = useCallback(
        (reason: "outside" | "escape") => {
            window.clearTimeout(timer.current);
            setOpen(false);
            if (reason === "escape" && cardRef.current?.contains(document.activeElement)) {
                returning.current = true;
                (anchorRef.current?.firstElementChild as HTMLElement | null)?.focus();
                returning.current = false;
            }
        },
        [setOpen],
    );
    useDismiss(isOpen, [anchorRef, cardRef], close);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const pointerHandlers = (isTrigger: boolean) => ({
        onPointerEnter: (event: { pointerType: string }) => {
            // Touch has no hover: a tap follows the link.
            if (event.pointerType === "touch") return;
            hovering.current = true;
            if (isTrigger && !isOpen) openSoon(openDelay);
            else window.clearTimeout(timer.current);
        },
        onPointerLeave: (event: { pointerType: string }) => {
            if (event.pointerType === "touch") return;
            hovering.current = false;
            closeSoon();
        },
    });

    const onBlur = (event: FocusEvent) => {
        if (inside(event.relatedTarget as Node | null) || hovering.current) return;
        window.clearTimeout(timer.current);
        setOpen(false);
    };

    return (
        <>
            <span
                ref={anchorRef}
                className="ow-hover-card-anchor"
                {...pointerHandlers(true)}
                onPointerDown={(event) => {
                    if (event.pointerType === "touch") window.clearTimeout(timer.current);
                }}
                onFocus={(event) => {
                    if (!returning.current && event.target.matches(":focus-visible")) openSoon(0);
                }}
                onBlur={onBlur}
            >
                {trigger}
            </span>
            {mounted ? (
                <div
                    ref={cardRef}
                    {...manualPopover}
                    data-state={state}
                    className={cx("ow-hover-card", "ow-floating", className)}
                    style={{ ...style, width }}
                    {...pointerHandlers(false)}
                    onBlur={onBlur}
                >
                    {children}
                </div>
            ) : null}
        </>
    );
}
