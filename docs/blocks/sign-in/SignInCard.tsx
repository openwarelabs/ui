import { useId, useState, type FormEvent } from "react";

import { Button, Card, Field, Input, Link, Separator, Text, toast } from "@openwarelabs/ui";
import { GitBranch } from "lucide-react";

import "./SignInCard.css";

type Provider = "GitHub" | "Google";

interface Errors {
    email?: string;
    password?: string;
}

export function SignInCard() {
    const id = useId();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [busy, setBusy] = useState<Provider | "email" | null>(null);

    const fieldId = (name: string) => `${id}-${name}`;

    function continueWith(provider: Provider) {
        // The real thing sends the browser to the provider and back; here it waits a moment instead.
        setBusy(provider);
        window.setTimeout(() => {
            setBusy(null);
            toast.success(`Signed in with ${provider}`);
        }, 1200);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const found: Errors = {};
        if (!email.trim()) found.email = "Enter the email address you signed up with.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) found.email = "That doesn't look like an email address.";
        if (!password) found.password = "Enter your password.";
        setErrors(found);
        if (found.email || found.password) {
            document.getElementById(fieldId(found.email ? "email" : "password"))?.focus();
            return;
        }
        setBusy("email");
        window.setTimeout(() => {
            setBusy(null);
            toast.success(`Signed in as ${email.trim()}`);
        }, 900);
    }

    return (
        <main className="sign-in-card">
            <div className="sign-in-card__inner">
                <span className="sign-in-card__mark" aria-hidden="true" />
                <Text variant="heading" as="h1" className="sign-in-card__title">
                    Sign in to Acme
                </Text>
                <Text variant="copy" className="sign-in-card__lead">
                    Welcome back. Your team's reviews are waiting.
                </Text>

                <Card padding="lg" className="sign-in-card__card">
                    <div className="sign-in-card__providers">
                        <Button
                            fullWidth
                            startIcon={<GitBranch size={16} />}
                            loading={busy === "GitHub"}
                            disabled={busy !== null && busy !== "GitHub"}
                            onClick={() => continueWith("GitHub")}
                        >
                            Continue with GitHub
                        </Button>
                        <Button
                            fullWidth
                            startIcon={
                                <span className="sign-in-card__glyph" aria-hidden="true">
                                    G
                                </span>
                            }
                            loading={busy === "Google"}
                            disabled={busy !== null && busy !== "Google"}
                            onClick={() => continueWith("Google")}
                        >
                            Continue with Google
                        </Button>
                    </div>

                    <Separator label="or" spacing="3xl" />

                    <form className="sign-in-card__form" noValidate onSubmit={submit}>
                        <Field label="Email" error={errors.email}>
                            <Input
                                id={fieldId("email")}
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setErrors((current) => ({ ...current, email: undefined }));
                                }}
                                placeholder="maya@example.com"
                                autoComplete="email"
                            />
                        </Field>
                        {/* The link sits on the label's line but outside the label, so clicking the label still focuses the field. */}
                        <div className="sign-in-card__password">
                            <Field label="Password" error={errors.password}>
                                <Input
                                    id={fieldId("password")}
                                    type="password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setErrors((current) => ({ ...current, password: undefined }));
                                    }}
                                    autoComplete="current-password"
                                />
                            </Field>
                            <Link href="#" variant="muted" className="sign-in-card__forgot">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" variant="primary" fullWidth loading={busy === "email"} disabled={busy !== null && busy !== "email"}>
                            Sign in
                        </Button>
                    </form>
                </Card>

                <Text variant="copy" className="sign-in-card__switch">
                    New to Acme? <Link href="#">Create an account</Link>
                </Text>
            </div>
        </main>
    );
}
