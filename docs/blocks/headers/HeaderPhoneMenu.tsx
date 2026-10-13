import { useEffect, useState } from "react";

import { Button, Chip, Drawer, Link, Text } from "@openwarelabs/ui";
import { ChevronRight, Menu as MenuIcon } from "lucide-react";

import "./HeaderPhoneMenu.css";

const links = [
    { label: "Product", href: "#product", current: true },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#changelog" },
    { label: "Docs", href: "#docs" },
    { label: "Company", href: "#company" },
];

const more = [
    { label: "Guides", href: "#guides" },
    { label: "API reference", href: "#api" },
    { label: "Customers", href: "#customers" },
    { label: "Contact sales", href: "#sales" },
];

// Under this width the links fold into the drawer (the same width as the media query in the CSS).
const narrow = "(max-width: 1024px)";

export function HeaderPhoneMenu() {
    // Opened on a phone, the preview loads with the drawer open to show it; closing it leaves the menu button.
    const [open, setOpen] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches);

    useEffect(() => {
        const query = window.matchMedia(narrow);
        const onChange = () => !query.matches && setOpen(false);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    const close = () => setOpen(false);

    return (
        <div className="header-phone-menu">
            <header className="header-phone-menu__bar">
                <div className="header-phone-menu__inner">
                    <Link href="#" variant="standalone" className="header-phone-menu__brand">
                        <span className="header-phone-menu__mark" aria-hidden="true" />
                        Acme
                    </Link>
                    <nav className="header-phone-menu__nav" aria-label="Main">
                        {links.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                variant="standalone"
                                className="header-phone-menu__link"
                                aria-current={link.current ? "page" : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="header-phone-menu__actions">
                        <Link href="#sign-in" variant="standalone" className="header-phone-menu__link">
                            Sign in
                        </Link>
                        <Button variant="primary" shape="pill" size="sm">
                            Start for free
                        </Button>
                        <Button
                            className="header-phone-menu__open"
                            variant="ghost"
                            size="sm"
                            iconOnly
                            aria-label="Open menu"
                            aria-haspopup="dialog"
                            aria-expanded={open}
                            onClick={() => setOpen(true)}
                        >
                            <MenuIcon size={18} />
                        </Button>
                    </div>
                </div>
            </header>

            <Drawer
                className="header-phone-menu__drawer"
                open={open}
                onClose={close}
                title="Menu"
                side="right"
                size={320}
                footer={
                    <>
                        <Button shape="pill" onClick={close}>
                            Sign in
                        </Button>
                        <Button variant="primary" shape="pill" onClick={close}>
                            Start for free
                        </Button>
                    </>
                }
            >
                <nav aria-label="Main">
                    <ul className="header-phone-menu__drawer-list">
                        {links.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    variant="standalone"
                                    className="header-phone-menu__drawer-link"
                                    aria-current={link.current ? "page" : undefined}
                                    onClick={close}
                                >
                                    {link.label}
                                    {link.current ? <span className="header-phone-menu__current" aria-hidden="true" /> : null}
                                    <ChevronRight size={16} aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="header-phone-menu__more">
                        <Text variant="overline" as="p" className="header-phone-menu__more-label" id="header-phone-menu-more">
                            More from Acme
                        </Text>
                        <ul className="header-phone-menu__more-list" aria-labelledby="header-phone-menu-more">
                            {more.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} variant="standalone" className="header-phone-menu__more-link" onClick={close}>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </Drawer>

            {/* Your page */}
            <main className="header-phone-menu__page">
                <Chip>Product</Chip>
                <Text variant="page-title" className="header-phone-menu__title">
                    Plan it, hand it off, review it, ship it
                </Text>
                <Text variant="lead" className="header-phone-menu__lead">
                    One workspace from the first ticket to the deploy, with agents taking the routine steps and your team keeping the final say.
                </Text>
            </main>
        </div>
    );
}
