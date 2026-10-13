import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

import { ArrowUpRightIcon, ChevronRightIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface BreadcrumbItem {
    label: ReactNode;
    /** Where it goes. The last item is the current page and isn't a link. */
    href?: string;
    onClick?(event: MouseEvent<HTMLElement>): void;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    /** @default "chevron" */
    separator?: "chevron" | "slash";
    /** Names the trail for screen readers.
     * @default "Breadcrumb" */
    label?: string;
    className?: string;
}

/** Where the current page sits: a trail of links from the top level down. */
export function Breadcrumbs({ items, separator = "chevron", label = "Breadcrumb", className }: BreadcrumbsProps) {
    return (
        <nav aria-label={label} className={cx("ow-breadcrumbs", className)}>
            <ol className="ow-breadcrumbs__list">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={index} className="ow-breadcrumbs__item">
                            {isLast ? (
                                <span className="ow-breadcrumbs__current" aria-current="page">
                                    {item.label}
                                </span>
                            ) : item.href ? (
                                <a className="ow-breadcrumbs__link" href={item.href} onClick={item.onClick}>
                                    {item.label}
                                </a>
                            ) : (
                                <button type="button" className="ow-breadcrumbs__link" onClick={item.onClick}>
                                    {item.label}
                                </button>
                            )}
                            {isLast ? null : (
                                <span className="ow-breadcrumbs__separator" aria-hidden="true">
                                    {separator === "slash" ? "/" : <ChevronRightIcon size={14} />}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export interface LinkStyleOptions {
    /** `default` underlines in a hairline and turns brass on hover; `muted` is quieter, for footnotes; `standalone` has no underline until hovered, for lists of links.
     * @default "default" */
    variant?: "default" | "muted" | "standalone";
}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkStyleOptions {
    /** Opens in a new tab with an ↗ arrow, for links that leave your site.
     * @default false */
    external?: boolean;
    children?: ReactNode;
}

/** The class names of a link, for a router's own <Link>: `<RouterLink className={linkClassName()}>`. */
export function linkClassName({ variant = "default" }: LinkStyleOptions = {}): string {
    return cx("ow-link", `ow-link--${variant}`);
}

/** A text link. Its hover turns brass, the one place brass is text on a light ground. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    { variant = "default", external = false, className, children, target, rel, ...props },
    ref,
) {
    return (
        <a
            ref={ref}
            className={cx(linkClassName({ variant }), className)}
            target={external ? (target ?? "_blank") : target}
            rel={external ? (rel ?? "noopener noreferrer") : rel}
            {...props}
        >
            {children}
            {external ? (
                <>
                    <ArrowUpRightIcon size={13} className="ow-link__external" />
                    <span className="ow-visually-hidden"> (opens in a new tab)</span>
                </>
            ) : null}
        </a>
    );
});
