import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface NavListProps {
    /** Names the navigation for screen readers, e.g. "Settings". */
    label: string;
    /** A muted heading above the items (vertical only). */
    heading?: ReactNode;
    /** `vertical` for a sidebar; `horizontal` scrolls sideways, for narrow screens.
     * @default "vertical" */
    orientation?: "vertical" | "horizontal";
    children: ReactNode;
    className?: string;
}

export interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** A 15px lucide-react icon. */
    icon?: ReactNode;
    /** The current section: raised on a surface, its icon in the primary colour.
     * @default false */
    active?: boolean;
    /** Makes the item a link to this address instead of a button. */
    href?: string;
    /** Muted text at the right: a count, a badge. */
    end?: ReactNode;
}
