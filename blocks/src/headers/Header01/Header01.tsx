import { useEffect, useState } from "react";

import { Button, cx, Link, Popover, SiteHeader } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { BlockBrandLink } from "@blocks/shared/BlockBrandLink";
import { MenuIcon } from "@blocks/shared/icons";
import type { Header01Props } from "./Header01.types";

/**
 * A blurred pill that floats above the page and follows it down: the logo, the links in the middle and one call
 * to action. On phones the links fold into a menu behind a button. Put it first inside the page's scrolling area.
 */
export function Header01({ brand, links, primaryAction, secondaryLink, labels = {}, className, ...props }: Header01Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuLabel = labels.menu ?? "Menu";

    // The menu button only shows on phones; close its menu if the window grows past them.
    useEffect(() => {
        const wide = window.matchMedia("(min-width: 761px)");
        const onChange = () => wide.matches && setMenuOpen(false);
        wide.addEventListener("change", onChange);
        return () => wide.removeEventListener("change", onChange);
    }, []);

    return (
        <div className={cx("ow-header01", className)} {...props}>
            <SiteHeader
                brand={<BlockBrandLink brand={brand} className="ow-header01__brand" />}
                nav={links.map((link, index) => (
                    <Link key={index} href={link.href} variant="standalone" aria-current={link.current ? "page" : undefined}>
                        {link.label}
                    </Link>
                ))}
                actions={
                    <>
                        {secondaryLink ? (
                            <Link
                                href={secondaryLink.href}
                                variant="standalone"
                                className="ow-header01__sign-in"
                                aria-current={secondaryLink.current ? "page" : undefined}
                            >
                                {secondaryLink.label}
                            </Link>
                        ) : null}
                        <BlockActionButton action={primaryAction} variant="primary" size="sm" />
                        <span className="ow-header01__phone-menu">
                            <Popover
                                aria-label={menuLabel}
                                placement="bottom-end"
                                width={240}
                                open={menuOpen}
                                onOpenChange={setMenuOpen}
                                trigger={
                                    <Button variant="ghost" shape="pill" size="sm" iconOnly aria-label={menuLabel}>
                                        <MenuIcon size={16} />
                                    </Button>
                                }
                            >
                                <nav className="ow-header01__menu" aria-label="Main">
                                    {links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.href}
                                            variant="standalone"
                                            className="ow-header01__menu-link"
                                            aria-current={link.current ? "page" : undefined}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    {secondaryLink ? (
                                        <Link
                                            href={secondaryLink.href}
                                            variant="standalone"
                                            className="ow-header01__menu-link ow-header01__menu-link--sign-in"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {secondaryLink.label}
                                        </Link>
                                    ) : null}
                                </nav>
                            </Popover>
                        </span>
                    </>
                }
            />
        </div>
    );
}
