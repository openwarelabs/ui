import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

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

export interface MenuLabelProps {
    /** The heading's text. */
    children: ReactNode;
}

/** What a MenuItem reaches for to close the menu it's in (a Menu or a ContextMenu). */
export interface MenuContextValue {
    /** Closes the menu and puts focus back where it was before it opened. */
    close(): void;
}
