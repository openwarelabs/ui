import { useRef, useState, type FormEvent } from "react";

import { Button, Input, Link, Separator, Text } from "@openwarelabs/ui";
import { ArrowRight, CircleCheck, Mail } from "lucide-react";

import "./FooterNewsletter.css";

const columns = [
    { title: "Product", links: ["Overview", "Agents", "Reviews", "Deploys", "Pricing"] },
    { title: "Developers", links: ["Documentation", "API reference", "Command line", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Resources", links: ["Changelog", "Guides", "Community", "Brand"] },
];

export function FooterNewsletter() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [sentTo, setSentTo] = useState("");
    const input = useRef<HTMLInputElement>(null);

    const subscribe = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const address = email.trim();
        if (!address) setError("Enter your email address.");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) setError("That doesn't look like an email address. Check it for a typo.");
        else {
            setError("");
            setSending(true);
            // Stands in for the request to your mailing list.
            window.setTimeout(() => {
                setSending(false);
                setSentTo(address);
            }, 700);
            return;
        }
        input.current?.focus();
    };

    const startAgain = () => {
        setSentTo("");
        setEmail("");
        window.setTimeout(() => input.current?.focus());
    };

    return (
        <footer className="footer-newsletter">
            <div className="footer-newsletter__inner">
                <section className="footer-newsletter__signup" aria-labelledby="footer-newsletter-title">
                    <div>
                        <Text variant="heading" as="h2" id="footer-newsletter-title">
                            Get the changelog by email
                        </Text>
                        <Text variant="copy" className="footer-newsletter__intro">
                            What we shipped this month, what's coming next, and one idea worth stealing from a team on Acme.
                        </Text>
                    </div>

                    {sentTo ? (
                        <div className="footer-newsletter__done" role="status">
                            <CircleCheck size={18} aria-hidden="true" />
                            <span className="footer-newsletter__done-text">
                                <Text variant="label">Check your inbox</Text>
                                <Text variant="body" as="span" tone="soft" className="footer-newsletter__done-detail">
                                    We've sent a link to {sentTo}. Open it to confirm your subscription.
                                </Text>
                            </span>
                            <Button size="sm" variant="ghost" onClick={startAgain}>
                                Change
                            </Button>
                        </div>
                    ) : (
                        <form noValidate onSubmit={subscribe}>
                            <div className="footer-newsletter__row">
                                <Input
                                    ref={input}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    aria-label="Email address"
                                    aria-describedby="footer-newsletter-note"
                                    className="footer-newsletter__email"
                                    startContent={<Mail size={16} />}
                                    isInvalid={Boolean(error)}
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        if (error) setError("");
                                    }}
                                />
                                <Button type="submit" variant="primary" shape="pill" loading={sending} endIcon={<ArrowRight size={16} />}>
                                    Subscribe
                                </Button>
                            </div>
                            <Text
                                variant="caption"
                                as="p"
                                id="footer-newsletter-note"
                                tone={error ? "danger" : undefined}
                                className="footer-newsletter__note"
                                aria-live="polite"
                            >
                                {error || "One email a month. Unsubscribe whenever you like."}
                            </Text>
                        </form>
                    )}
                </section>

                <div className="footer-newsletter__links">
                    <div className="footer-newsletter__brand">
                        <Link href="#" variant="standalone" className="footer-newsletter__logo" aria-label="Acme home">
                            <span className="footer-newsletter__mark" aria-hidden="true" />
                            <Text variant="dialog-title" as="span">
                                Acme
                            </Text>
                        </Link>
                        <Text variant="copy" className="footer-newsletter__line">
                            Plan the work, hand the routine parts to agents, and ship.
                        </Text>
                    </div>
                    {columns.map((column) => (
                        <nav key={column.title} aria-labelledby={`footer-newsletter-${column.title.toLowerCase()}`}>
                            <Text variant="label" as="h2" id={`footer-newsletter-${column.title.toLowerCase()}`} className="footer-newsletter__heading">
                                {column.title}
                            </Text>
                            <ul className="footer-newsletter__list">
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

                <Separator />

                <div className="footer-newsletter__bottom">
                    <Text variant="caption" as="p">
                        © 2026 Acme Ltd.
                    </Text>
                    <Text variant="caption" as="ul" className="footer-newsletter__legal">
                        {["Privacy", "Terms", "Cookies", "Security"].map((link) => (
                            <li key={link}>
                                <Link href="#" variant="muted">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </Text>
                </div>
            </div>
        </footer>
    );
}
