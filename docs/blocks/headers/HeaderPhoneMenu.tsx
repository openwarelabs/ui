import { Header05 } from "@openwarelabs/blocks";
import { Chip, Text } from "@openwarelabs/ui";

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

export function HeaderPhoneMenu() {
    // Opened on a phone, the preview loads with the drawer open to show it; closing it leaves the menu button.
    const phone = typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
    return (
        <div className="header-phone-menu">
            <Header05
                brand={{ name: "Acme", href: "#", logo: <span className="header-phone-menu__mark" aria-hidden="true" /> }}
                links={links}
                more={{ title: "More from Acme", links: more }}
                secondaryLink={{ label: "Sign in", href: "#sign-in" }}
                primaryAction={{ label: "Start for free", href: "#start" }}
                defaultOpen={phone}
            />

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
