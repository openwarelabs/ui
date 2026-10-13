import { useEffect, useState } from "react";

import { Badge, Button, Chip, Popover, SiteHeader } from "@openwarelabs/ui";
import { Menu as MenuIcon } from "lucide-react";

import "./HeaderFloatingPill.css";

const links = [
    { label: "Product", href: "#product" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#changelog", current: true },
    { label: "Docs", href: "#docs" },
    { label: "Company", href: "#company" },
];

// The sample page under the header: long enough to scroll beneath it.
const entries = [
    {
        date: "2026-10-09",
        day: "9 October 2026",
        kind: "New",
        tone: "active",
        title: "Agents open their own pull requests",
        text: "Assign a ticket to an agent and it branches, writes the change, runs your tests and opens a pull request with its reasoning in the description. You review it like any other.",
    },
    {
        date: "2026-10-02",
        day: "2 October 2026",
        kind: "Improved",
        tone: "neutral",
        title: "Faster reviews on large diffs",
        text: "Diffs over a thousand lines now load in under a second, and the files you've already reviewed stay folded when new commits arrive.",
    },
    {
        date: "2026-09-25",
        day: "25 September 2026",
        kind: "New",
        tone: "active",
        title: "A preview for every branch",
        text: "Each branch gets its own preview address, posted on the pull request as soon as the build is ready. Previews go to sleep after a week without visits.",
    },
    {
        date: "2026-09-18",
        day: "18 September 2026",
        kind: "Fixed",
        tone: "neutral",
        title: "Invoice dates in the EU",
        text: "Invoices for workspaces in the EU now show dates in the workspace's own format rather than the US one.",
    },
] as const;

function Brand() {
    return (
        <a href="#" className="header-floating-pill__brand">
            <span className="header-floating-pill__mark" aria-hidden="true" />
            Acme
        </a>
    );
}

export function HeaderFloatingPill() {
    const [menuOpen, setMenuOpen] = useState(false);

    // The menu button only shows on phones; close its menu if the window grows past them.
    useEffect(() => {
        const wide = window.matchMedia("(min-width: 761px)");
        const onChange = () => wide.matches && setMenuOpen(false);
        wide.addEventListener("change", onChange);
        return () => wide.removeEventListener("change", onChange);
    }, []);

    return (
        <div className="header-floating-pill">
            <div className="header-floating-pill__bar">
                <SiteHeader
                    brand={<Brand />}
                    nav={links.map((link) => (
                        <a key={link.label} href={link.href} aria-current={link.current ? "page" : undefined}>
                            {link.label}
                        </a>
                    ))}
                    actions={
                        <>
                            <a href="#sign-in" className="header-floating-pill__sign-in">
                                Sign in
                            </a>
                            <Button variant="primary" shape="pill" size="sm">
                                Start for free
                            </Button>
                            <span className="header-floating-pill__phone-menu">
                                <Popover
                                    aria-label="Menu"
                                    placement="bottom-end"
                                    width={240}
                                    open={menuOpen}
                                    onOpenChange={setMenuOpen}
                                    trigger={
                                        <Button variant="ghost" shape="pill" size="sm" iconOnly aria-label="Menu">
                                            <MenuIcon size={16} />
                                        </Button>
                                    }
                                >
                                    <nav className="header-floating-pill__menu" aria-label="Main">
                                        {links.map((link) => (
                                            <a
                                                key={link.label}
                                                href={link.href}
                                                className="header-floating-pill__menu-link"
                                                aria-current={link.current ? "page" : undefined}
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                        <a
                                            href="#sign-in"
                                            className="header-floating-pill__menu-link header-floating-pill__menu-link--sign-in"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Sign in
                                        </a>
                                    </nav>
                                </Popover>
                            </span>
                        </>
                    }
                />
            </div>

            {/* Your page */}
            <main className="header-floating-pill__page">
                <div className="header-floating-pill__intro">
                    <Chip>Changelog</Chip>
                    <h1 className="header-floating-pill__title">What's new in Acme</h1>
                    <p className="header-floating-pill__lead">Everything we shipped, week by week. Follow along in the app, or get it by email on Fridays.</p>
                </div>
                <ol className="header-floating-pill__entries">
                    {entries.map((entry) => (
                        <li key={entry.title} className="header-floating-pill__entry">
                            <time className="header-floating-pill__date" dateTime={entry.date}>
                                {entry.day}
                            </time>
                            <div className="header-floating-pill__entry-body">
                                <Badge size="sm" variant={entry.tone}>
                                    {entry.kind}
                                </Badge>
                                <h2 className="header-floating-pill__entry-title">{entry.title}</h2>
                                <p className="header-floating-pill__entry-text">{entry.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </main>
        </div>
    );
}
