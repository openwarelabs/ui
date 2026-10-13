import { Button, Link } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import "./FooterBrand.css";

const columns = [
    { title: "Product", links: ["Agents", "Reviews", "Deploys", "Pricing", "Changelog"] },
    { title: "Developers", links: ["Documentation", "API reference", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
];

export function FooterBrand() {
    return (
        <footer className="footer-brand">
            <div className="footer-brand__inner">
                <div className="footer-brand__top">
                    <div className="footer-brand__pitch">
                        <p className="footer-brand__line">
                            Plan it, hand it off, review it, ship it. <span>All in one place.</span>
                        </p>
                        <Button variant="primary" shape="pill" endIcon={<ArrowRight size={16} />}>
                            Start for free
                        </Button>
                    </div>
                    <div className="footer-brand__columns">
                        {columns.map((column) => (
                            <nav key={column.title} aria-labelledby={`footer-brand-${column.title.toLowerCase()}`}>
                                <h2 id={`footer-brand-${column.title.toLowerCase()}`} className="footer-brand__heading">
                                    {column.title}
                                </h2>
                                <ul className="footer-brand__list">
                                    {column.links.map((link) => (
                                        <li key={link}>
                                            <Link href="#" variant="standalone">
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                <div className="footer-brand__legal">
                    <p>© 2026 Acme Ltd.</p>
                    <ul>
                        {["Privacy", "Terms", "Security"].map((link) => (
                            <li key={link}>
                                <Link href="#" variant="muted">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-brand__name" aria-hidden="true">
                    <div className="footer-brand__crop">
                        <span>Acme</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
