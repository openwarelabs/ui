import { Header04 } from "@openwarelabs/blocks";
import { Chip, Text } from "@openwarelabs/ui";

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
    return (
        <div className="header-announcement">
            <Header04
                announcement={{
                    title: "Acme 3.0 is out.",
                    description: "Agents now open their own pull requests.",
                    link: { label: "Read the announcement", shortLabel: "Read more", href: "#announcement" },
                }}
                brand={{ name: "Acme", href: "#", logo: <span className="header-announcement__mark" aria-hidden="true" /> }}
                links={links}
                secondaryLink={{ label: "Sign in", href: "#sign-in" }}
                primaryAction={{ label: "Start for free", href: "#start" }}
                onNavigate={go}
            />

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
