import { Link } from "@openwarelabs/ui";

import "./FooterSimple.css";

const links = ["Product", "Pricing", "Changelog", "Docs", "Blog", "Careers", "Privacy", "Terms"];

export function FooterSimple() {
    return (
        <footer className="footer-simple">
            <div className="footer-simple__inner">
                <a className="footer-simple__logo" href="#" aria-label="Acme home">
                    <span className="footer-simple__mark" />
                </a>
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
                <p className="footer-simple__legal">© 2026 Acme Ltd. All rights reserved.</p>
            </div>
        </footer>
    );
}
