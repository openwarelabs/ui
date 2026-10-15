import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";

import { MenuContext } from "@/components/Menu/Menu.context";
import { manualPopover, useDismiss, useFloating } from "@/hooks/useFloating";
import { useMenuKeyboard } from "@/hooks/useMenuKeyboard";
import { usePresence } from "@/hooks/usePresence";
import { cx } from "@/utils/cx";
import type { ContextMenuPanelProps, ContextMenuProps } from "./ContextMenu.types";
export type { ContextMenuProps } from "./ContextMenu.types";

/** How long a finger rests before the menu opens, and how far it may drift meanwhile. */
const longPressMs = 500;
const longPressSlop = 10;
/** After a long press or a key opens it, the contextmenu event the browser may send as well is ignored. */
const echoMs = 800;
/** Touches a ContextMenu has already started timing, so one around it leaves them be. */
const pressed = new WeakSet<Event>();

/**
 * A menu of actions for an area, opened where you right-click it, with a long press on a touch screen, or with
 * Shift+F10 or the context menu key when focus is inside it. It uses Menu's items and keyboard, and looks the same.
 */
export function ContextMenu({ children, menu, label, width, disabled = false, onOpenChange, className }: ContextMenuProps) {
    const [open, setOpen] = useState(false);
    // Each opening gets a new count, so the panel is made afresh at the new place.
    const [opening, setOpening] = useState<{ anchor: () => DOMRect; count: number } | null>(null);
    const { mounted, state } = usePresence(open);
    const menuRef = useRef<HTMLDivElement>(null);
    const restoreRef = useRef<HTMLElement | null>(null);
    const pressRef = useRef<{ timer: number; x: number; y: number } | null>(null);
    const openedAt = useRef(0);
    const longPressed = useRef(false);
    const changeRef = useRef(onOpenChange);
    changeRef.current = onOpenChange;
    const menuId = useId();

    const show = (anchor: () => DOMRect) => {
        if (!open) {
            const active = document.activeElement;
            restoreRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
        }
        setOpening((current) => ({ anchor, count: (current?.count ?? 0) + 1 }));
        setOpen(true);
    };

    const close = useCallback((reason?: "outside" | "escape" | "select") => {
        setOpen(false);
        // A click outside moves focus by itself.
        if (reason !== "outside") restoreRef.current?.focus();
    }, []);
    useDismiss(open, [menuRef], close);

    const reported = useRef(open);
    useEffect(() => {
        if (reported.current === open) return;
        reported.current = open;
        changeRef.current?.(open);
    }, [open]);

    // The menu stays put on the screen, so scrolling the page would leave it behind: close it, as browsers do.
    useEffect(() => {
        if (!open) return;
        const onScroll = (event: Event) => {
            if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
        };
        window.addEventListener("scroll", onScroll, true);
        return () => window.removeEventListener("scroll", onScroll, true);
    }, [open]);

    const cancelPress = useCallback(() => {
        if (pressRef.current) window.clearTimeout(pressRef.current.timer);
        pressRef.current = null;
    }, []);
    useEffect(() => cancelPress, [cancelPress]);

    // Inside this menu, or a Menu in the area: those handle their own keys and clicks.
    const inMenu = (target: EventTarget) => target instanceof Element && target.closest('[role="menu"]') !== null;
    const openAt = (x: number, y: number) => show(() => new DOMRect(x, y, 0, 0));

    const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
        // A ContextMenu inside this one has already handled it.
        if (disabled || event.defaultPrevented) return;
        event.preventDefault();
        if (inMenu(event.target) || Date.now() - openedAt.current < echoMs) return;
        cancelPress();
        openAt(event.clientX, event.clientY);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled || event.defaultPrevented || inMenu(event.target)) return;
        if (event.key !== "ContextMenu" && !(event.key === "F10" && event.shiftKey)) return;
        event.preventDefault();
        openedAt.current = Date.now();
        const target = event.target as HTMLElement;
        show(() => target.getBoundingClientRect());
    };

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        longPressed.current = false;
        if (disabled || event.pointerType !== "touch" || inMenu(event.target) || pressed.has(event.nativeEvent)) return;
        // The innermost ContextMenu takes the press.
        pressed.add(event.nativeEvent);
        // A second finger means a pinch, not a long press.
        if (pressRef.current) return cancelPress();
        const { clientX: x, clientY: y } = event;
        const timer = window.setTimeout(() => {
            pressRef.current = null;
            longPressed.current = true;
            openedAt.current = Date.now();
            openAt(x, y);
        }, longPressMs);
        pressRef.current = { timer, x, y };
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const press = pressRef.current;
        if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > longPressSlop) cancelPress();
    };

    // Lifting the finger after a long press would otherwise click whatever was under it.
    const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
        if (!longPressed.current || inMenu(event.target)) return;
        longPressed.current = false;
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div
            className="ow-context-menu"
            onContextMenu={onContextMenu}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={cancelPress}
            onPointerCancel={cancelPress}
            onClickCapture={onClickCapture}
        >
            {children}
            {mounted && opening ? (
                <MenuContext.Provider value={{ close: () => close("select") }}>
                    <ContextMenuPanel
                        key={opening.count}
                        anchor={opening.anchor}
                        open={open}
                        state={state}
                        menuRef={menuRef}
                        restoreRef={restoreRef}
                        id={menuId}
                        label={label}
                        width={width}
                        className={className}
                        onClose={() => setOpen(false)}
                    >
                        {menu}
                    </ContextMenuPanel>
                </MenuContext.Provider>
            ) : null}
        </div>
    );
}

/** Menu's panel, placed at the anchor: below and to the right of it, flipped up and kept on screen when there's no room. */
function ContextMenuPanel({ anchor, open, state, menuRef, restoreRef, id, label, width, className, onClose, children }: ContextMenuPanelProps) {
    // useFloating measures an anchor element; a stand-in that reports the point (or the focused element's box) will do.
    const anchorRef = useRef({ getBoundingClientRect: anchor } as unknown as HTMLElement);
    const style = useFloating({ open: true, anchorRef, floatingRef: menuRef, placement: "bottom-start", offset: 2 });
    // Escape puts focus back on restoreRef; Tab closes it and moves on.
    const onKeyDown = useMenuKeyboard({ open, menuRef, triggerRef: restoreRef, onClose });
    return (
        <div
            ref={menuRef}
            {...manualPopover}
            data-state={state}
            id={id}
            role="menu"
            aria-label={label}
            className={cx("ow-menu__panel", "ow-floating", className)}
            style={width === undefined ? style : { ...style, width }}
            onKeyDown={onKeyDown}
        >
            {children}
        </div>
    );
}
