import { Footer04, type FooterColumn } from "@openwarelabs/blocks";
import { ArrowRight } from "lucide-react";

const columns: FooterColumn[] = [
    { title: "Product", links: ["Agents", "Reviews", "Deploys", "Pricing", "Changelog"] },
    { title: "Developers", links: ["Documentation", "API reference", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
].map((column) => ({ title: column.title, links: column.links.map((label) => ({ label, href: "#" })) }));

export function FooterBrand() {
    return (
        <Footer04
            title="Plan it, hand it off, review it, ship it."
            titleMuted="All in one place."
            primaryAction={{ label: "Start for free", href: "#start", endIcon: <ArrowRight size={16} /> }}
            columns={columns}
            legal="© 2026 Acme Ltd."
            legalLinks={["Privacy", "Terms", "Security"].map((label) => ({ label, href: "#" }))}
            wordmark="Acme"
        />
    );
}
