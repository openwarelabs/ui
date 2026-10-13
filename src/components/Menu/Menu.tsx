import {
    cloneElement,
    createContext,
    forwardRef,
    isValidElement,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from "react";

import { manualPopover, useFloating } from "../../hooks/useFloating";
import { useMenuKeyboard } from "../../hooks/useMenuKeyboard";
import { usePresence } from "../../hooks/usePresence";
import { cx } from "../../utils/cx";

const MenuContext = createContext<{ close(): void } | null>(null);

export interface MenuProps {
    /** The button that opens it, usually a Button. Menu adds the click handler and the aria attributes. */
    trigger: ReactElement;
    /** MenuItem, MenuLabel and MenuSeparator. */
    children: ReactNode;
    /** Names the menu for screen readers. */
    label: string;
    /** Which edge of the trigger it lines up with.
     * @default "start" */
    align?: "start" | "end";
    /** Prefers opening upward. Either way it flips when there's no room.
     * @default false */
    above?: boolean;
    /** CSS width; default fits the items, at least 200px. */
    width?: number | string;
    /** Starts open, for documentation and tests. */
    defaultOpen?: boolean;
    className?: string;
}

/**
 * A dropdown menu of actions under a button. Opening it focuses the first item; the arrow keys, Home and End
 * move; Escape closes it and returns focus to the button; a click outside or Tab closes it.
 */
export function Menu({ trigger, children, label, align = "start", above = false, width, defaultOpen = false, className }: MenuProps) {
    const [open, setOpen] = useState(defaultOpen);
    const rootRef = useRef<HTMLSpanElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement | null>(null);
    const menuId = useId();
    const close = () => setOpen(false);
    const onMenuKeyDown = useMenuKeyboard({ open, menuRef, triggerRef, onClose: close });
    const { mounted, state } = usePresence(open);
    const floatingStyle = useFloating({
        open: mounted,
        anchorRef: rootRef,
        floatingRef: menuRef,
        placement: `${above ? "top" : "bottom"}-${align}`,
        offset: 8,
    });

    useEffect(() => {
        triggerRef.current = rootRef.current?.firstElementChild as HTMLElement | null;
    });

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [open]);

    const triggerElement = isValidElement<ButtonHTMLAttributes<HTMLElement>>(trigger)
        ? cloneElement(trigger, {
              "aria-haspopup": "menu",
              "aria-expanded": open,
              "aria-controls": open ? menuId : undefined,
              onClick: (event: MouseEvent<HTMLElement>) => {
                  trigger.props.onClick?.(event);
                  if (!event.defaultPrevented) setOpen((current) => !current);
              },
          })
        : trigger;

    return (
        <span ref={rootRef} className="ow-menu">
            {triggerElement}
            {mounted ? (
                <MenuContext.Provider
                    value={{
                        close() {
                            setOpen(false);
                            triggerRef.current?.focus();
                        },
                    }}
                >
                    <div
                        ref={menuRef}
                        {...manualPopover}
                        data-state={state}
                        id={menuId}
                        role="menu"
                        aria-label={label}
                        className={cx("ow-menu__panel", "ow-floating", className)}
                        style={width === undefined ? floatingStyle : { ...floatingStyle, width }}
                        onKeyDown={onMenuKeyDown}
                    >
                        {children}
                    </div>
                </MenuContext.Provider>
            ) : null}
        </span>
    );
}

export interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
    /** A 15px lucide-react icon before the label. */
    icon?: ReactNode;
    /** Runs the action; the menu then closes. */
    onSelect?(): void;
    /** Red, for actions that delete or can't be undone. */
    destructive?: boolean;
    /** Shown on the right, e.g. "⌘,". Only a shortcut that actually works. */
    shortcut?: string;
}

/** One action in a Menu. */
export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
    { icon, onSelect, destructive = false, shortcut, className, children, onClick, ...buttonProps },
    ref,
) {
    const menu = useContext(MenuContext);
    return (
        <button
            ref={ref}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={cx("ow-menu__item", destructive && "ow-menu__item--destructive", className)}
            onClick={(event) => {
                onClick?.(event);
                if (event.defaultPrevented) return;
                menu?.close();
                onSelect?.();
            }}
            {...buttonProps}
        >
            {icon ? <span className="ow-menu__icon">{icon}</span> : null}
            <span className="ow-menu__label">{children}</span>
            {shortcut ? <kbd className="ow-menu__shortcut">{shortcut}</kbd> : null}
        </button>
    );
});

/** A small uppercase heading for a group of items. */
export function MenuLabel({ children }: { children: ReactNode }) {
    return (
        <div className="ow-menu__group-label" role="presentation">
            {children}
        </div>
    );
}

/** A hairline between groups of items. */
export function MenuSeparator() {
    return <div className="ow-menu__separator" role="separator" />;
}
