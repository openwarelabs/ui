import { Footer03, type FooterColumn } from "@openwarelabs/blocks";
import { ArrowRight } from "lucide-react";

import "./FooterNewsletter.css";

const columns: FooterColumn[] = [
    { title: "Product", links: ["Overview", "Agents", "Reviews", "Deploys", "Pricing"] },
    { title: "Developers", links: ["Documentation", "API reference", "Command line", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Resources", links: ["Changelog", "Guides", "Community", "Brand"] },
].map((column) => ({ title: column.title, links: column.links.map((label) => ({ label, href: "#" })) }));

export function FooterNewsletter() {
    return (
        <Footer03
            newsletter={{
                title: "Get the changelog by email",
                description: "What we shipped this month, what's coming next, and one idea worth stealing from a team on Acme.",
                submitLabel: "Subscribe",
                submitIcon: <ArrowRight size={16} />,
                // Stands in for the request to your mailing list.
                onSubmit: () => new Promise((resolve) => window.setTimeout(resolve, 700)),
                note: "One email a month. Unsubscribe whenever you like.",
                successTitle: "Check your inbox",
                successDescription: (email) => `We've sent a link to ${email}. Open it to confirm your subscription.`,
            }}
            brand={{ name: "Acme", href: "#", logo: <span className="footer-newsletter__mark" aria-hidden="true" /> }}
            description="Plan the work, hand the routine parts to agents, and ship."
            columns={columns}
            legal="© 2026 Acme Ltd."
            legalLinks={["Privacy", "Terms", "Cookies", "Security"].map((label) => ({ label, href: "#" }))}
        />
    );
}
