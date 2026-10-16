import {
    cloneElement,
    createContext,
    isValidElement,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type HTMLAttributes,
    type MouseEvent,
    type TransitionEvent,
} from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";
import type { CollapsibleContentProps, CollapsibleProps, CollapsibleState, CollapsibleTriggerProps } from "./Collapsible.types";

export type { CollapsibleContentProps, CollapsibleProps, CollapsibleState, CollapsibleTriggerProps } from "./Collapsible.types";

interface CollapsibleContextValue extends CollapsibleState {
    contentId: string;
    disabled: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(part: string) {
    const context = useContext(CollapsibleContext);
    if (!context) throw new Error(`${part} must be inside <Collapsible>.`);
    return context;
}

/** Shows and hides content under any trigger you give it: "Show more" text, a filter panel, a form's extra fields.
 * It animates the content and wires up the ARIA; the trigger's look is yours. */
export function Collapsible({ open, defaultOpen = false, onOpenChange, disabled = false, children, className, ...props }: CollapsibleProps) {
    const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
    const id = useId();
    const state: CollapsibleState = { open: isOpen, toggle: () => setOpen(!isOpen) };
    return (
        <CollapsibleContext.Provider value={{ ...state, contentId: `${id}-content`, disabled }}>
            <div className={cx("ow-collapsible", className)} data-open={isOpen} data-disabled={disabled || undefined} {...props}>
                {typeof children === "function" ? children(state) : children}
            </div>
        </CollapsibleContext.Provider>
    );
}

/** Opens and closes the content. On its own it's a bare button; with `asChild` it hands its props to your element. */
export function CollapsibleTrigger({ asChild = false, children, className, onClick, disabled, ...props }: CollapsibleTriggerProps) {
    const { open, toggle, contentId, disabled: allDisabled } = useCollapsibleContext("CollapsibleTrigger");
    const isDisabled = disabled || allDisabled;
    const shared = {
        "aria-expanded": open,
        "aria-controls": contentId,
        "data-state": open ? "open" : "closed",
        disabled: isDisabled,
    };

    if (asChild) {
        if (!isValidElement<HTMLAttributes<HTMLElement> & { disabled?: boolean }>(children)) {
            throw new Error("CollapsibleTrigger with asChild needs a single element as its child.");
        }
        const child = children;
        return cloneElement(child, {
            ...props,
            ...shared,
            className: cx(child.props.className, className),
            onClick: (event: MouseEvent<HTMLElement>) => {
                child.props.onClick?.(event);
                (onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
                if (!event.defaultPrevented && !isDisabled) toggle();
            },
        });
    }

    return (
        <button
            type="button"
            className={cx("ow-collapsible__trigger", className)}
            {...shared}
            {...props}
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) toggle();
            }}
        >
            {children}
        </button>
    );
}

/** How long to wait for the closing transition before taking the content out, if its end never arrives (a hidden parent). */
const fallbackMs = 400;

/** The region that opens and closes. Closed, it's inert and leaves the DOM once the animation ends, unless `forceMount`. */
export function CollapsibleContent({ forceMount = false, children, className, onTransitionEnd, ...props }: CollapsibleContentProps) {
    const { open, contentId } = useCollapsibleContext("CollapsibleContent");
    const ref = useRef<HTMLDivElement>(null);
    // Lags `open` both ways: the content mounts closed and then opens, so the opening animates, and it stays in the
    // DOM through the closing animation.
    const [present, setPresent] = useState(open);

    useEffect(() => {
        if (open) {
            setPresent(true);
            return;
        }
        const timer = window.setTimeout(() => setPresent(false), fallbackMs);
        return () => window.clearTimeout(timer);
    }, [open]);

    const shown = open && present;

    // Closed content can't be tabbed into or read out.
    useEffect(() => {
        if (ref.current) ref.current.inert = !shown;
    }, [shown]);

    if (!open && !present && !forceMount) return null;

    const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
        onTransitionEnd?.(event);
        if (event.target === event.currentTarget && event.propertyName === "grid-template-rows" && !open) setPresent(false);
    };

    return (
        <div
            ref={ref}
            id={contentId}
            className={cx("ow-collapsible__content", className)}
            data-open={shown}
            onTransitionEnd={handleTransitionEnd}
            {...props}
        >
            <div className="ow-collapsible__clip">
                <div className="ow-collapsible__inner">{children}</div>
            </div>
        </div>
    );
}
