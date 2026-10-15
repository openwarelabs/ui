import type { ReactNode, RefObject } from "react";

export interface ContextMenuProps {
    /** The area that opens the menu: one element or several. Give it something focusable, so the keyboard can reach it. */
    children: ReactNode;
    /** The menu: MenuItem, MenuLabel and MenuSeparator, as in a Menu. */
    menu: ReactNode;
    /** Names the menu for screen readers, e.g. "File actions". */
    label: string;
    /** CSS width; default fits the items, at least 200px. */
    width?: number | string;
    /** Leaves the browser's own context menu in place and opens nothing.
     * @default false */
    disabled?: boolean;
    /** Called when it opens or closes, e.g. to highlight the row it's for. */
    onOpenChange?(open: boolean): void;
    /** Classes for the menu panel. */
    className?: string;
}

/** The panel inside a ContextMenu, remade for each opening. Internal. */
export interface ContextMenuPanelProps extends Pick<ContextMenuProps, "label" | "width" | "className"> {
    /** Where it opens: a point for the pointer, the focused element's box for the keyboard. */
    anchor: () => DOMRect;
    open: boolean;
    state: "open" | "closed";
    menuRef: RefObject<HTMLDivElement>;
    /** The element to return focus to on Escape. */
    restoreRef: RefObject<HTMLElement | null>;
    id: string;
    /** Escape or Tab in the menu. */
    onClose(): void;
    children: ReactNode;
}
