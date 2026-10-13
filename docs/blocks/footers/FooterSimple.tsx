import { Link, Text } from "@openwarelabs/ui";

import "./FooterSimple.css";

const links = ["Product", "Pricing", "Changelog", "Docs", "Blog", "Careers", "Privacy", "Terms"];

export function FooterSimple() {
    return (
        <footer className="footer-simple">
            <div className="footer-simple__inner">
                <Link href="#" className="footer-simple__logo" aria-label="Acme home">
                    <span className="footer-simple__mark" />
                </Link>
                <nav aria-label="Footer">
                    <ul className="footer-simple__links">
                        {links.map((link) => (
                            <li key={link}>
                                <Link href="#" variant="standalone">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <Text variant="caption" as="p">
                    © 2026 Acme Ltd. All rights reserved.
                </Text>
            </div>
        </footer>
    );
}
