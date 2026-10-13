import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";

import { cx } from "../../utils/cx";

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

/** A list of places to go, the way a settings dialog's sidebar lists its sections. Place it on ow-canvas. */
export function NavList({ label, heading, orientation = "vertical", children, className }: NavListProps) {
    return (
        <nav aria-label={label} className={cx("ow-nav", `ow-nav--${orientation}`, className)}>
            {heading && orientation === "vertical" ? <span className="ow-nav__heading">{heading}</span> : null}
            {children}
        </nav>
    );
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

/** One place in a NavList: a button, or a link when given an href. */
export const NavItem = forwardRef<HTMLElement, NavItemProps>(function NavItem(
    { icon, active = false, className, children, type = "button", href, end, ...buttonProps },
    ref,
) {
    const content = (
        <>
            {icon ? <span className="ow-nav__icon">{icon}</span> : null}
            <span className="ow-nav__label">{children}</span>
            {end !== undefined ? <span className="ow-nav__end">{end}</span> : null}
        </>
    );
    const shared = {
        "aria-current": active ? ("page" as const) : undefined,
        className: cx("ow-nav__item", active && "ow-nav__item--active", className),
    };
    if (href !== undefined) {
        return (
            <a
                ref={ref as Ref<HTMLAnchorElement>}
                href={href}
                {...shared}
                {...(buttonProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
                {content}
            </a>
        );
    }
    return (
        <button ref={ref as Ref<HTMLButtonElement>} type={type} {...shared} {...buttonProps}>
            {content}
        </button>
    );
});
