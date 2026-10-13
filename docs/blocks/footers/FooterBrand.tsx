import { Button, Link, Text } from "@openwarelabs/ui";
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
                        <Text variant="heading" as="p">
                            Plan it, hand it off, review it, ship it.{" "}
                            <Text variant="heading" as="span" tone="muted">
                                All in one place.
                            </Text>
                        </Text>
                        <Button variant="primary" shape="pill" endIcon={<ArrowRight size={16} />}>
                            Start for free
                        </Button>
                    </div>
                    <div className="footer-brand__columns">
                        {columns.map((column) => (
                            <nav key={column.title} aria-labelledby={`footer-brand-${column.title.toLowerCase()}`}>
                                <Text variant="label" as="h2" id={`footer-brand-${column.title.toLowerCase()}`} className="footer-brand__heading">
                                    {column.title}
                                </Text>
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
                    <Text variant="caption" as="p">
                        © 2026 Acme Ltd.
                    </Text>
                    <Text variant="caption" as="ul" className="footer-brand__legal-links">
                        {["Privacy", "Terms", "Security"].map((link) => (
                            <li key={link}>
                                <Link href="#" variant="muted">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </Text>
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
