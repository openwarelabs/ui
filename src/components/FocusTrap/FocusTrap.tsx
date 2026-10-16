import { cloneElement, forwardRef, isValidElement, useCallback, useRef, type Ref } from "react";

import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cx } from "@/utils/cx";
import type { FocusTrapProps } from "./FocusTrap.types";
export type { FocusTrapProps } from "./FocusTrap.types";

function assign<T>(ref: Ref<T> | undefined, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) (ref as { current: T | null }).current = value;
}

/**
 * Keeps keyboard focus inside its children while `active`: Tab and Shift+Tab loop at the edges, focus that leaves
 * is pulled back, and when it lets go, focus returns to where it was. The library's Dialog and Drawer already trap
 * focus through the native `<dialog>`, so this is for overlays that aren't one: a custom side panel, an inline edit
 * mode, a toolbar that takes over the keyboard for a moment.
 */
export const FocusTrap = forwardRef<HTMLElement, FocusTrapProps>(function FocusTrap(
    {
        active = true,
        initialFocus,
        returnFocus,
        loop,
        escapeDeactivates,
        onEscape,
        clickOutsideDeactivates,
        onDeactivate,
        fallbackFocus,
        as: Element = "div",
        asChild = false,
        className,
        children,
        ...props
    },
    forwardedRef,
) {
    const containerRef = useRef<HTMLElement | null>(null);
    const setContainer = useCallback(
        (node: HTMLElement | null) => {
            containerRef.current = node;
            assign(forwardedRef, node);
        },
        [forwardedRef],
    );

    useFocusTrap(containerRef, {
        active,
        initialFocus,
        returnFocus,
        loop,
        escapeDeactivates,
        onEscape,
        clickOutsideDeactivates,
        onDeactivate,
        fallbackFocus,
    });

    if (asChild) {
        if (!isValidElement<{ className?: string }>(children)) return null;
        return cloneElement(children, {
            ...props,
            ref: setContainer,
            className: cx("ow-focus-trap", children.props.className, className),
        } as Partial<typeof children.props> & { ref: Ref<HTMLElement> });
    }

    return (
        <Element ref={setContainer} tabIndex={-1} className={cx("ow-focus-trap", className)} {...props}>
            {children}
        </Element>
    );
});
