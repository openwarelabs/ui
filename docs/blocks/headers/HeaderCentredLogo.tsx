import { Header03 } from "@openwarelabs/blocks";
import { Chip, Text } from "@openwarelabs/ui";

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

export function HeaderCentredLogo() {
    return (
        <div className="header-centred-logo">
            <Header03
                brand={{ name: "Acme", href: "#", logo: <span className="header-centred-logo__mark" aria-hidden="true" /> }}
                start={start}
                end={end}
                secondaryLink={{ label: "Sign in", href: "#sign-in" }}
                primaryAction={{ label: "Start for free", href: "#start" }}
                labels={{ start: "Product", end: "Resources" }}
            />

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
