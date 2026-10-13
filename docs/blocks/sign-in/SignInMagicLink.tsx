import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, Field, Input, Link, toast } from "@openwarelabs/ui";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";

import "./SignInMagicLink.css";

// Seconds to wait before another link can be sent.
const cooldown = 30;

export function SignInMagicLink() {
    const emailId = useId();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [wait, setWait] = useState(0);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const shown = useRef<string | null>(null);

    // Count the resend wait down a second at a time.
    useEffect(() => {
        if (wait <= 0) return undefined;
        const timer = window.setTimeout(() => setWait((current) => current - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [wait]);

    // When the page changes, move focus to its title so it's read out; going back puts it in the email field.
    useEffect(() => {
        if (shown.current === sentTo) return;
        shown.current = sentTo;
        if (sentTo) titleRef.current?.focus();
        else document.getElementById(emailId)?.focus();
    }, [sentTo, emailId]);

    function send(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = email.trim();
        const found = !address ? "Enter your email address." : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? "That doesn't look like an email address." : "";
        setError(found);
        if (found) {
            document.getElementById(emailId)?.focus();
            return;
        }
        setSending(true);
        window.setTimeout(() => {
            setSending(false);
            setSentTo(address);
            setWait(cooldown);
        }, 800);
    }

    function resend() {
        setWait(cooldown);
        toast.success("Sent another link", { description: `To ${sentTo}. The first one still works too.` });
    }

    return (
        <main className="sign-in-magic-link">
            <div className="sign-in-magic-link__panel">
                <header className="sign-in-magic-link__bar">
                    <span className="sign-in-magic-link__brand">
                        <span className="sign-in-magic-link__mark" aria-hidden="true" />
                        Acme
                    </span>
                    <Link href="#" variant="muted" className="sign-in-magic-link__bar-link">
                        Sign in with a password
                    </Link>
                </header>

                <div className="sign-in-magic-link__body">
                    {sentTo ? (
                        <div className="sign-in-magic-link__content" key="sent">
                            <span className="sign-in-magic-link__icon sign-in-magic-link__icon--sent" aria-hidden="true">
                                <MailCheck size={22} />
                            </span>
                            <h1 ref={titleRef} tabIndex={-1} className="sign-in-magic-link__title">
                                Check your email
                            </h1>
                            <p className="sign-in-magic-link__lead">
                                We sent a sign-in link to
                                <strong className="sign-in-magic-link__email">{sentTo}</strong>
                                It works once, for the next 15 minutes, on any device.
                            </p>
                            <div className="sign-in-magic-link__actions">
                                <Button fullWidth disabled={wait > 0} onClick={resend}>
                                    {wait > 0 ? `Send again in ${wait} s` : "Send the link again"}
                                </Button>
                                <Button fullWidth variant="ghost" startIcon={<ArrowLeft size={16} />} onClick={() => setSentTo(null)}>
                                    Use a different email
                                </Button>
                            </div>
                            <p className="sign-in-magic-link__note">Can't see it? Look in your spam folder, or search your inbox for “Acme”.</p>
                        </div>
                    ) : (
                        <form className="sign-in-magic-link__content" key="ask" noValidate onSubmit={send}>
                            <span className="sign-in-magic-link__icon" aria-hidden="true">
                                <Mail size={22} />
                            </span>
                            <h1 className="sign-in-magic-link__title">Sign in with email</h1>
                            <p className="sign-in-magic-link__lead">We'll email you a link that signs you in. There's no password to remember.</p>
                            <div className="sign-in-magic-link__fields">
                                <Field label="Email" error={error}>
                                    <Input
                                        id={emailId}
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="maya@example.com"
                                        autoComplete="email"
                                    />
                                </Field>
                                <Button type="submit" variant="primary" fullWidth loading={sending}>
                                    Email me a link
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
