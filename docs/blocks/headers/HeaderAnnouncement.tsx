import { useRef, useState } from "react";

import { Button, Chip, CloseButton, Link, Menu, MenuItem, MenuSeparator, Text } from "@openwarelabs/ui";
import { ArrowRight, Menu as MenuIcon } from "lucide-react";

import "./HeaderAnnouncement.css";

const links = [
    { label: "Product", href: "#product" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#changelog" },
    { label: "Docs", href: "#docs" },
    { label: "Company", href: "#company" },
];

/** Menu items are buttons, so send them where a link would go. Swap in your router's navigate(). */
function go(href: string) {
    window.location.hash = href;
}

export function HeaderAnnouncement() {
    // Remember the dismissal (in a cookie or localStorage) if it should stay closed on the next visit.
    const [closed, setClosed] = useState(false);
    const brandRef = useRef<HTMLAnchorElement>(null);

    const dismiss = () => {
        setClosed(true);
        // The close button is going away; leave focus at the top of the header rather than nowhere.
        brandRef.current?.focus();
    };

    return (
        <div className="header-announcement">
            <aside className="header-announcement__notice" aria-label="Announcement" data-closed={closed || undefined} aria-hidden={closed || undefined}>
                <div className="header-announcement__clip">
                    <div className="header-announcement__notice-inner">
                        <Text className="header-announcement__message">
                            <span className="header-announcement__dot" aria-hidden="true" />
                            <strong>Acme 3.0 is out.</strong> <span className="header-announcement__detail">Agents now open their own pull requests.</span>
                            <Link href="#announcement" className="header-announcement__link">
                                <span className="header-announcement__link-wide">Read the announcement</span>
                                <span className="header-announcement__link-narrow">Read more</span>
                                <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                        </Text>
                        <CloseButton size="sm" label="Dismiss the announcement" onClick={dismiss} />
                    </div>
                </div>
            </aside>

            <header className="header-announcement__header">
                <div className="header-announcement__inner">
                    <Link ref={brandRef} href="#" variant="standalone" className="header-announcement__brand">
                        <span className="header-announcement__mark" aria-hidden="true" />
                        Acme
                    </Link>
                    <nav className="header-announcement__nav" aria-label="Main">
                        {links.map((link) => (
                            <Link key={link.label} href={link.href} variant="standalone" className="header-announcement__link-plain">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="header-announcement__actions">
                        <Link href="#sign-in" variant="standalone" className="header-announcement__link-plain">
                            Sign in
                        </Link>
                        <Button variant="primary" shape="pill" size="sm">
                            Start for free
                        </Button>
                        <span className="header-announcement__phone-menu">
                            <Menu
                                label="Menu"
                                align="end"
                                width={220}
                                trigger={
                                    <Button variant="ghost" size="sm" iconOnly aria-label="Menu">
                                        <MenuIcon size={18} />
                                    </Button>
                                }
                            >
                                {links.map((link) => (
                                    <MenuItem key={link.label} onSelect={() => go(link.href)}>
                                        {link.label}
                                    </MenuItem>
                                ))}
                                <MenuSeparator />
                                <MenuItem onSelect={() => go("#sign-in")}>Sign in</MenuItem>
                            </Menu>
                        </span>
                    </div>
                </div>
            </header>

            {/* Your page */}
            <main className="header-announcement__page">
                <Chip>Acme 3.0</Chip>
                <Text variant="page-title" className="header-announcement__title">
                    Agents that open their own pull requests
                </Text>
                <Text variant="lead" className="header-announcement__lead">
                    Assign a ticket to an agent and it branches, writes the change, runs your tests and asks for your review, reasoning included.
                </Text>
            </main>
        </div>
    );
}
