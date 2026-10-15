import { forwardRef, useContext, type AnchorHTMLAttributes, type Ref } from "react";

import { cx } from "../../utils/cx";
import { AppShellContext } from "../AppShell/AppShell.context";
import { Tooltip } from "../Tooltip/Tooltip";
import type { NavItemProps, NavListProps } from "./NavList.types";

export type { NavItemProps, NavListProps } from "./NavList.types";

/** A list of places to go, the way a settings dialog's sidebar lists its sections. Place it on ow-canvas. */
export function NavList({ label, heading, orientation = "vertical", children, className }: NavListProps) {
    return (
        <nav aria-label={label} className={cx("ow-nav", `ow-nav--${orientation}`, className)}>
            {heading && orientation === "vertical" ? <span className="ow-nav__heading">{heading}</span> : null}
            {children}
        </nav>
    );
}

/**
 * One place in a NavList: a button, or a link when given an href. In a folded AppShell sidebar it shows only its
 * icon, with its label as a tooltip (and still read out by screen readers).
 */
export const NavItem = forwardRef<HTMLElement, NavItemProps>(function NavItem(
    { icon, active = false, className, children, type = "button", href, end, ...buttonProps },
    ref,
) {
    const collapsed = useContext(AppShellContext)?.collapsed ?? false;
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
    const item =
        href !== undefined ? (
            <a ref={ref as Ref<HTMLAnchorElement>} href={href} {...shared} {...(buttonProps as AnchorHTMLAttributes<HTMLAnchorElement>)}>
                {content}
            </a>
        ) : (
            <button ref={ref as Ref<HTMLButtonElement>} type={type} {...shared} {...buttonProps}>
                {content}
            </button>
        );
    return collapsed ? (
        <Tooltip label={children} placement="right">
            {item}
        </Tooltip>
    ) : (
        item
    );
});
