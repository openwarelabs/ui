import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button, Field, Input, SectionHeading } from "@openwarelabs/ui";
import { CircleCheck } from "lucide-react";

import "./NewsletterInline.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(value: string) {
    if (!value.trim()) return "Enter your email address.";
    if (!emailPattern.test(value.trim())) return "Enter an email address like name@example.com.";
    return undefined;
}

/** The changelog goes out on the first Tuesday of each month. */
function nextIssueDate(from = new Date()) {
    for (let offset = 0; offset < 2; offset += 1) {
        const date = new Date(from.getFullYear(), from.getMonth() + offset, 1);
        while (date.getDay() !== 2) date.setDate(date.getDate() + 1);
        if (date > from) {
            const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });
            return `${weekday} ${date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
        }
    }
    return "";
}

export function NewsletterInline() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string>();
    const [touched, setTouched] = useState(false);
    const [sending, setSending] = useState(false);
    const [subscribed, setSubscribed] = useState<string>();
    const doneRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const resetting = useRef(false);

    // Move focus with the change, so keyboard and screen reader users land on the confirmation, and back on the field.
    useEffect(() => {
        if (subscribed) doneRef.current?.focus();
        else if (resetting.current) inputRef.current?.focus();
        resetting.current = false;
    }, [subscribed]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched(true);
        const problem = emailError(email);
        setError(problem);
        if (problem) return;
        setSending(true);
        // Stands in for the request to your mailing list.
        window.setTimeout(() => {
            setSending(false);
            setSubscribed(email.trim());
        }, 700);
    };

    const reset = () => {
        resetting.current = true;
        setSubscribed(undefined);
        setEmail("");
        setTouched(false);
        setError(undefined);
    };

    return (
        <section className="newsletter-inline" aria-labelledby="newsletter-inline-title">
            <div className="newsletter-inline__inner">
                <SectionHeading
                    eyebrow="Changelog"
                    title={<span id="newsletter-inline-title">What shipped this month</span>}
                    intro="One email on the first Tuesday of the month: what's new in Acme, what's coming next, and one longer note on working with agents."
                />

                <div>
                    {subscribed ? (
                        <div
                            ref={doneRef}
                            tabIndex={-1}
                            role="group"
                            aria-labelledby="newsletter-inline-done-title"
                            aria-describedby="newsletter-inline-done-text"
                            className="newsletter-inline__done"
                        >
                            <CircleCheck size={20} className="newsletter-inline__done-icon" aria-hidden="true" />
                            <div>
                                <p id="newsletter-inline-done-title" className="newsletter-inline__done-title">
                                    You're on the list
                                </p>
                                <p id="newsletter-inline-done-text" className="newsletter-inline__done-text">
                                    The next changelog goes to {subscribed} on {nextIssueDate()}.
                                </p>
                                <button type="button" className="newsletter-inline__reset" onClick={reset}>
                                    Use a different email
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form className="newsletter-inline__form" aria-labelledby="newsletter-inline-title" noValidate onSubmit={submit}>
                            <Field label="Email address" error={error}>
                                <Input
                                    ref={inputRef}
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        // Once they've tried to send, say as they type whether it's fixed.
                                        if (touched) setError(emailError(event.target.value));
                                    }}
                                />
                            </Field>
                            <Button type="submit" variant="primary" shape="pill" loading={sending} className="newsletter-inline__submit">
                                Subscribe
                            </Button>
                            <p className="newsletter-inline__fine">Unsubscribe in one click. We never share your address.</p>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
