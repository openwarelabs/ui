import { Button, Chip, Link, ScrollShadow, Text } from "@openwarelabs/ui";

import "./HeaderCentredLogo.css";

const start = [
    { label: "Product", href: "#product" },
    { label: "Customers", href: "#customers" },
    { label: "Pricing", href: "#pricing" },
];

const end = [
    { label: "Journal", href: "#journal", current: true },
    { label: "Docs", href: "#docs" },
];

function NavLink({ link }: { link: { label: string; href: string; current?: boolean } }) {
    return (
        <Link href={link.href} variant="standalone" className="header-centred-logo__link" aria-current={link.current ? "page" : undefined}>
            {link.label}
        </Link>
    );
}

export function HeaderCentredLogo() {
    return (
        <div className="header-centred-logo">
            <header className="header-centred-logo__bar">
                <div className="header-centred-logo__inner">
                    <nav className="header-centred-logo__nav" aria-label="Product">
                        {start.map((link) => (
                            <NavLink key={link.label} link={link} />
                        ))}
                    </nav>
                    <Link href="#sign-in" variant="standalone" className="header-centred-logo__link header-centred-logo__phone-only">
                        Sign in
                    </Link>

                    <Link href="#" variant="standalone" className="header-centred-logo__brand">
                        <span className="header-centred-logo__mark" aria-hidden="true" />
                        Acme
                    </Link>

                    <div className="header-centred-logo__end">
                        <nav className="header-centred-logo__nav" aria-label="Resources">
                            {end.map((link) => (
                                <NavLink key={link.label} link={link} />
                            ))}
                        </nav>
                        <div className="header-centred-logo__actions">
                            <Link href="#sign-in" variant="standalone" className="header-centred-logo__link">
                                Sign in
                            </Link>
                            <Button variant="primary" shape="pill" size="sm">
                                Start for free
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tablets and phones: every link on a line of its own, scrolling sideways when it runs out of room. */}
                <ScrollShadow orientation="horizontal" size={24} className="header-centred-logo__phone-only header-centred-logo__phone-nav">
                    <nav aria-label="Main">
                        <ul className="header-centred-logo__phone-links">
                            {[...start, ...end].map((link) => (
                                <li key={link.label}>
                                    <NavLink link={link} />
                                </li>
                            ))}
                        </ul>
                    </nav>
                </ScrollShadow>
            </header>

            {/* Your page */}
            <main className="header-centred-logo__page">
                <Chip>Journal</Chip>
                <Text variant="page-title" align="center" className="header-centred-logo__title">
                    Notes from a team that ships every day
                </Text>
                <Text variant="lead" align="center" className="header-centred-logo__lead">
                    How we plan, what we hand to agents, and what we've learned from reviewing four thousand of their pull requests.
                </Text>
            </main>
        </div>
    );
}
