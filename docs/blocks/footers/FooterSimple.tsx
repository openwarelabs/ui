import { Footer02 } from "@openwarelabs/blocks";

import "./FooterSimple.css";

const links = ["Product", "Pricing", "Changelog", "Docs", "Blog", "Careers", "Privacy", "Terms"];

export function FooterSimple() {
    return (
        <Footer02
            brand={{ name: "Acme", href: "#", logo: <span className="footer-simple__mark" /> }}
            links={links.map((label) => ({ label, href: "#" }))}
            legal="© 2026 Acme Ltd. All rights reserved."
        />
    );
}
