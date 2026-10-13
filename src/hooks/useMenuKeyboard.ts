import { useEffect, type KeyboardEvent, type RefObject } from "react";

const itemSelector =
    '[role="menuitem"]:not([disabled]):not([aria-disabled="true"]), [role="menuitemradio"]:not([disabled]), [role="menuitemcheckbox"]:not([disabled])';

function items(menu: HTMLElement | null): HTMLElement[] {
    return menu ? [...menu.querySelectorAll<HTMLElement>(itemSelector)] : [];
}

/**
 * Keyboard use for a `role="menu"` popup, as people expect from menus: opening it moves focus to its first item,
 * the arrow keys (and Home and End) move between items, wrapping round, and Escape closes it and puts focus
 * back on the button that opened it. Attach the returned handler to the menu's `onKeyDown`.
 */
export function useMenuKeyboard({
    open,
    menuRef,
    triggerRef,
    onClose,
}: {
    open: boolean;
    menuRef: RefObject<HTMLElement | null>;
    triggerRef?: RefObject<HTMLElement | null> | undefined;
    onClose(): void;
}): (event: KeyboardEvent<HTMLElement>) => void {
    useEffect(() => {
        if (!open) return;
        const frame = window.requestAnimationFrame(() => {
            const menu = menuRef.current;
            // Something inside already has focus (e.g. a field at the top of the menu): leave it there.
            if (menu?.contains(document.activeElement)) return;
            items(menu)[0]?.focus();
        });
        return () => window.cancelAnimationFrame(frame);
    }, [open, menuRef]);

    return (event) => {
        const list = items(menuRef.current);
        const index = list.indexOf(document.activeElement as HTMLElement);
        const move = (next: number) => {
            event.preventDefault();
            list[(next + list.length) % list.length]?.focus();
        };
        switch (event.key) {
            case "ArrowDown":
                move(index + 1);
                break;
            case "ArrowUp":
                move(index < 0 ? list.length - 1 : index - 1);
                break;
            case "Home":
                move(0);
                break;
            case "End":
                move(list.length - 1);
                break;
            case "Escape":
                event.preventDefault();
                event.stopPropagation();
                onClose();
                triggerRef?.current?.focus();
                break;
            case "Tab":
                // Leaving the menu closes it; focus moves on as usual.
                onClose();
                break;
        }
    };
}
