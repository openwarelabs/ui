import { useRef, useState, type FormEvent } from "react";

import { Button, Input, Link, Separator } from "@openwarelabs/ui";
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
                        <h2 id="footer-newsletter-title" className="footer-newsletter__title">
                            Get the changelog by email
                        </h2>
                        <p className="footer-newsletter__intro">
                            What we shipped this month, what's coming next, and one idea worth stealing from a team on Acme.
                        </p>
                    </div>

                    {sentTo ? (
                        <div className="footer-newsletter__done" role="status">
                            <CircleCheck size={18} aria-hidden="true" />
                            <span className="footer-newsletter__done-text">
                                <strong>Check your inbox</strong>
                                <span>We've sent a link to {sentTo}. Open it to confirm your subscription.</span>
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
                            <p
                                id="footer-newsletter-note"
                                className={`footer-newsletter__note${error ? " footer-newsletter__note--error" : ""}`}
                                aria-live="polite"
                            >
                                {error || "One email a month. Unsubscribe whenever you like."}
                            </p>
                        </form>
                    )}
                </section>

                <div className="footer-newsletter__links">
                    <div className="footer-newsletter__brand">
                        <a className="footer-newsletter__logo" href="#" aria-label="Acme home">
                            <span className="footer-newsletter__mark" aria-hidden="true" />
                            Acme
                        </a>
                        <p>Plan the work, hand the routine parts to agents, and ship.</p>
                    </div>
                    {columns.map((column) => (
                        <nav key={column.title} aria-labelledby={`footer-newsletter-${column.title.toLowerCase()}`}>
                            <h2 id={`footer-newsletter-${column.title.toLowerCase()}`} className="footer-newsletter__heading">
                                {column.title}
                            </h2>
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
                    <p>© 2026 Acme Ltd.</p>
                    <ul className="footer-newsletter__legal">
                        {["Privacy", "Terms", "Cookies", "Security"].map((link) => (
                            <li key={link}>
                                <Link href="#" variant="muted">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
