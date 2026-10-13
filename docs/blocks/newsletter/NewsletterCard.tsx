import { useState, type FormEvent } from "react";

import { Avatar, AvatarGroup, Button, Card, Field, Input, Link, toast } from "@openwarelabs/ui";
import { ArrowRight, Mail } from "lucide-react";

import "./NewsletterCard.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(value: string) {
    if (!value.trim()) return "Enter your email address.";
    if (!emailPattern.test(value.trim())) return "Enter an email address like name@example.com.";
    return undefined;
}

const authors = ["Clara Novak", "Jonas Berg", "Sam Okafor"];

export function NewsletterCard() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string>();
    const [touched, setTouched] = useState(false);
    const [sending, setSending] = useState(false);

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
            toast.success("Check your inbox", { description: `We've sent a link to ${email.trim()}. Open it to confirm, and the next post comes to you.` });
            setEmail("");
            setTouched(false);
        }, 700);
    };

    return (
        <section className="newsletter-card" aria-labelledby="newsletter-card-title">
            <Card padding="none" className="newsletter-card__card">
                <div className="newsletter-card__body">
                    <span className="newsletter-card__icon" aria-hidden="true">
                        <Mail size={20} />
                    </span>
                    <h2 id="newsletter-card-title" className="newsletter-card__title">
                        Get the next post by email
                    </h2>
                    <p className="newsletter-card__lead">
                        Field notes on shipping software with agents, from the people who build Acme. A new post every other Thursday, about a six-minute read.
                    </p>
                    <form className="newsletter-card__form" aria-labelledby="newsletter-card-title" noValidate onSubmit={submit}>
                        <Field label="Email address" error={error}>
                            <Input
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (touched) setError(emailError(event.target.value));
                                }}
                            />
                        </Field>
                        <Button type="submit" variant="primary" shape="pill" loading={sending} className="newsletter-card__submit">
                            Subscribe
                        </Button>
                    </form>
                </div>
                <div className="newsletter-card__foot">
                    <div className="newsletter-card__authors">
                        <AvatarGroup size="sm">
                            {authors.map((name) => (
                                <Avatar key={name} name={name} />
                            ))}
                        </AvatarGroup>
                        <span>
                            <strong>Clara, Jonas and Sam</strong> write it for 9,400 readers.
                        </span>
                    </div>
                    <Link href="#" variant="standalone" className="newsletter-card__past">
                        Read past posts
                        <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>
            </Card>
        </section>
    );
}
