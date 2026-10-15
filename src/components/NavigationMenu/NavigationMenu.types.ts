import type { AnchorHTMLAttributes, ReactNode } from "react";

export interface NavigationMenuProps {
    /** Names the navigation for screen readers, such as "Main". */
    label?: string;
    /** Renders a `<nav>` landmark. Turn it off when it already sits in one, like SiteHeader's `nav` slot, so screen
     * readers don't hear two.
     * @default true */
    landmark?: boolean;
    /** The open item's `value`, or null when every panel is closed, when you control it. */
    value?: string | null;
    /** The item open at first, when it controls itself.
     * @default null */
    defaultValue?: string | null;
    /** Called with the item that opens, or null when its panel closes. */
    onValueChange?(value: string | null): void;
    /** How wide panels are: as wide as their content (`"auto"`), or as wide as the header the menu sits in (or the
     * menu itself, outside a header) for mega-menus (`"full"`). An item's own `width` wins.
     * @default "auto" */
    panelWidth?: "auto" | "full";
    /** How long the pointer rests on a trigger before its panel opens, in milliseconds.
     * @default 150 */
    openDelay?: number;
    /** How long a panel opened by hovering stays after the pointer leaves, so it can cross the gap into it.
     * @default 300 */
    closeDelay?: number;
    /** The NavigationMenuItems. */
    children: ReactNode;
    className?: string;
}

export interface NavigationMenuItemProps {
    /** The words on the top-level button, or on the link when there's an `href`. */
    trigger: ReactNode;
    /** Names the item for `value` and `onValueChange`. Defaults to a generated id. */
    value?: string;
    /** Makes it a plain top-level link instead of a button with a panel. */
    href?: string;
    /** Marks a plain link (or a trigger whose panel holds the current page) as where the person is. */
    active?: boolean;
    /** The panel's columns, side by side; they stack on narrow screens.
     * @default 1 */
    columns?: number;
    /** This panel's width: pixels, any CSS width, or `"full"` to match the header. Defaults to the menu's `panelWidth`. */
    width?: number | string;
    /** The panel's content: NavigationMenuLinks, NavigationMenuGroups, or anything else. */
    children?: ReactNode;
    className?: string;
}

export interface NavigationMenuLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "title"> {
    href: string;
    /** The link's name. */
    title: ReactNode;
    /** A line under the title on what's there. */
    description?: ReactNode;
    /** An icon before the title, such as a lucide-react icon at size 18. */
    icon?: ReactNode;
    /** The page the person is on: sets aria-current="page". */
    active?: boolean;
    /** Shows it as a tinted card that fills its column, to feature one page in a mega-menu. */
    featured?: boolean;
}

export interface NavigationMenuGroupProps {
    /** A few words over the column, such as "Resources". */
    title: ReactNode;
    /** Its NavigationMenuLinks. */
    children: ReactNode;
    className?: string;
}
