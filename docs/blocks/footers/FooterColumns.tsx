import { Footer01, type FooterColumn } from "@openwarelabs/blocks";

import "./FooterColumns.css";

const columns: FooterColumn[] = [
    { title: "Product", links: ["Overview", "Agents", "Reviews", "Deploys", "Pricing", "Changelog"] },
    { title: "Developers", links: ["Documentation", "API reference", "Command line", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Customers", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "Data processing"] },
].map((column) => ({
    title: column.title,
    links: column.links.map((label) => ({ label, href: "#", badge: label === "Agents" ? "New" : undefined })),
}));

export function FooterColumns() {
    return (
        <Footer01
            brand={{ name: "Acme", href: "#", logo: <span className="footer-columns__mark" aria-hidden="true" /> }}
            description="The workspace where software teams plan the work, hand the routine parts to agents, and ship."
            status={{ label: "All systems normal", href: "#" }}
            columns={columns}
            legal="© 2026 Acme Ltd. Registered in Ireland, no. 712345."
            legalLinks={[{ label: "Cookie settings", href: "#" }]}
            themeSwitch
        />
    );
}
