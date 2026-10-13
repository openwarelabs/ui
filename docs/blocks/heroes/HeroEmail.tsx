import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Badge, Button, Chip, Input } from "@openwarelabs/ui";
import { Bot, Check, Mail } from "lucide-react";

import "./HeroEmail.css";

const overnight = [
    { project: "billing-api", change: "Retry failed card payments after a day", status: "Ready", tone: "success" },
    { project: "marketing-site", change: "Fix the broken links on the pricing page", status: "Ready", tone: "success" },
    { project: "mobile-app", change: "Stop the upload test timing out", status: "Needs you", tone: "warning" },
    { project: "docs", change: "Update the API examples for version 3", status: "Ready", tone: "success" },
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What an agent leaves by morning, drawn with Openware components. */
function Digest() {
    return (
        <div
            className="hero-email__digest"
            role="img"
            aria-label="A morning summary in Acme: agents opened four pull requests overnight, three ready to merge and one that needs a person."
        >
            <div className="hero-email__digest-header">
                <span className="hero-email__digest-icon">
                    <Bot size={17} />
                </span>
                <span className="hero-email__digest-titles">
                    <span className="hero-email__digest-title">While you were away</span>
                    <span className="hero-email__digest-summary">4 pull requests overnight, 3 ready to merge</span>
                </span>
                <span className="hero-email__digest-time">07:58</span>
            </div>
            <ul className="hero-email__digest-list">
                {overnight.map((item) => (
                    <li key={item.change} className="hero-email__digest-row">
                        <span className="hero-email__digest-project">{item.project}</span>
                        <span className="hero-email__digest-change">{item.change}</span>
                        <Badge size="sm" variant={item.tone}>
                            {item.status}
                        </Badge>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function HeroEmail() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [joined, setJoined] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const doneRef = useRef<HTMLDivElement>(null);
    const touched = useRef(false);
    const id = useId();

    // Moving between the form and the confirmation, take focus along so it isn't lost with the element that had it.
    useEffect(() => {
        if (!touched.current) return;
        if (joined) doneRef.current?.focus();
        else inputRef.current?.focus();
    }, [joined]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = email.trim();
        const problem = !value
            ? "Enter your work email to join the waitlist."
            : !emailPattern.test(value)
              ? "That doesn't look like an email address. Try one like maya@example.com."
              : null;
        setError(problem);
        if (problem) {
            inputRef.current?.focus();
            return;
        }
        setSending(true);
        // Stands in for the request to your waitlist.
        window.setTimeout(() => {
            touched.current = true;
            setSending(false);
            setJoined(value);
        }, 700);
    };

    return (
        <section className="hero-email" aria-labelledby="hero-email-title">
            <div className="hero-email__inner">
                <Chip>Early access: Acme Agents</Chip>
                <h1 id="hero-email-title" className="hero-email__title">
                    Your backlog, handled overnight
                </h1>
                <p className="hero-email__lead">
                    Agents pick up the routine tickets after your team logs off and leave a pull request for each by morning, with their reasoning written down.
                    We're letting new teams in every week.
                </p>

                {joined ? (
                    <div ref={doneRef} className="hero-email__done" tabIndex={-1}>
                        <span className="hero-email__done-icon" aria-hidden="true">
                            <Check size={16} />
                        </span>
                        <span className="hero-email__done-text">
                            <span className="hero-email__done-title">You're on the list</span>
                            <span className="hero-email__done-detail">We'll write to {joined} when your team's place is ready.</span>
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                touched.current = true;
                                setJoined(null);
                            }}
                        >
                            Change email
                        </Button>
                    </div>
                ) : (
                    <form className="hero-email__form" noValidate onSubmit={submit}>
                        <div className="hero-email__row">
                            <Input
                                ref={inputRef}
                                className="hero-email__input"
                                type="email"
                                autoComplete="email"
                                aria-label="Work email"
                                aria-describedby={error ? `${id}-error` : `${id}-note`}
                                placeholder="you@company.com"
                                startContent={<Mail size={16} />}
                                value={email}
                                isInvalid={Boolean(error)}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (error) setError(null);
                                }}
                            />
                            <Button type="submit" variant="primary" shape="pill" size="lg" loading={sending}>
                                Join the waitlist
                            </Button>
                        </div>
                        {error ? (
                            <p id={`${id}-error`} className="hero-email__error" role="alert">
                                {error}
                            </p>
                        ) : null}
                        <p id={`${id}-note`} className="hero-email__note">
                            One email when your place is ready. Nothing else.
                        </p>
                    </form>
                )}

                <Digest />
            </div>
        </section>
    );
}
