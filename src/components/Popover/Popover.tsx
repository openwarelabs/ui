import {
    cloneElement,
    isValidElement,
    useCallback,
    useEffect,
    useId,
    useRef,
    type HTMLAttributes,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { manualPopover, useDismiss, useFloating, type Placement } from "../../hooks/useFloating";
import { usePresence } from "../../hooks/usePresence";
import { cx } from "../../utils/cx";

export interface PopoverProps {
    /** The button that opens it. Popover adds the click handler and aria attributes. */
    trigger: ReactElement;
    children: ReactNode;
    open?: boolean;
    /** @default false */
    defaultOpen?: boolean;
    onOpenChange?(open: boolean): void;
    /** Where it opens relative to the trigger; it flips when there's no room.
     * @default "bottom-start" */
    placement?: Placement;
    /** A heading at the top that also names the popover for screen readers. */
    title?: ReactNode;
    /** Names the popover when there's no title. */
    "aria-label"?: string;
    /** Pixels, or any CSS width.
     * @default 280 */
    width?: number | string;
    /** Moves focus into the popover when it opens.
     * @default true */
    autoFocus?: boolean;
    className?: string;
}

/**
 * A small panel attached to a button, for a few controls or details that don't need a dialog.
 * Escape, a click outside or the trigger closes it, and focus goes back to the trigger.
 */
export function Popover({
    trigger,
    children,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = "bottom-start",
    title,
    "aria-label": ariaLabel,
    width = 280,
    autoFocus = true,
    className,
}: PopoverProps) {
    const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
    const triggerRef = useRef<HTMLElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLSpanElement>(null);
    const id = useId();
    const { mounted, state } = usePresence(isOpen);
    const style = useFloating({ open: mounted, anchorRef, floatingRef: panelRef, placement, offset: 8, maxHeight: 640 });

    const close = useCallback(
        (reason?: "outside" | "escape") => {
            setOpen(false);
            if (reason !== "outside") triggerRef.current?.focus();
        },
        [setOpen],
    );
    useDismiss(isOpen, [panelRef, anchorRef], close);

    useEffect(() => {
        triggerRef.current = anchorRef.current?.firstElementChild as HTMLElement | null;
    });

    useEffect(() => {
        if (!isOpen || !autoFocus) return;
        const frame = requestAnimationFrame(() => {
            const panel = panelRef.current;
            // The first control Tab would reach: not one taken out of the tab order (a radio group's other options), a
            // hidden input or anything disabled, so a group lands on its chosen option.
            const first = panel?.querySelector<HTMLElement>(
                [
                    'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"])',
                    'select:not([disabled]):not([tabindex="-1"])',
                    'textarea:not([disabled]):not([tabindex="-1"])',
                    'button:not([disabled]):not([tabindex="-1"])',
                    '[href]:not([tabindex="-1"])',
                    '[tabindex]:not([tabindex="-1"])',
                ].join(", "),
            );
            (first ?? panel)?.focus();
        });
        return () => cancelAnimationFrame(frame);
    }, [isOpen, autoFocus]);

    const triggerElement = isValidElement<HTMLAttributes<HTMLElement>>(trigger)
        ? cloneElement(trigger, {
              "aria-haspopup": "dialog",
              "aria-expanded": isOpen,
              "aria-controls": isOpen ? id : undefined,
              onClick: (event: MouseEvent<HTMLElement>) => {
                  trigger.props.onClick?.(event);
                  if (!event.defaultPrevented) setOpen(!isOpen);
              },
          })
        : trigger;

    return (
        <>
            <span ref={anchorRef} className="ow-popover-anchor">
                {triggerElement}
            </span>
            {mounted ? (
                <div
                    ref={panelRef}
                    {...manualPopover}
                    data-state={state}
                    id={id}
                    role="dialog"
                    aria-label={title ? undefined : ariaLabel}
                    aria-labelledby={title ? `${id}-title` : undefined}
                    tabIndex={-1}
                    className={cx("ow-popover", "ow-floating", className)}
                    style={{ ...style, width }}
                    // Focus leaving for anything but the trigger (Tab past the last control) closes it.
                    onBlur={(event) => {
                        const next = event.relatedTarget as Node | null;
                        if (next && !panelRef.current?.contains(next) && !anchorRef.current?.contains(next)) setOpen(false);
                    }}
                >
                    {title ? (
                        <div id={`${id}-title`} className="ow-popover__title">
                            {title}
                        </div>
                    ) : null}
                    {children}
                </div>
            ) : null}
        </>
    );
}
