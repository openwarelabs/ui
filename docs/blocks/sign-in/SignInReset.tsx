import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, Card, Field, Input, Link, Text, VisuallyHidden } from "@openwarelabs/ui";
import { ArrowLeft, Check, CircleCheck, Eye, EyeOff, KeyRound } from "lucide-react";

import "./SignInReset.css";

type Step = "email" | "password" | "done";

const rules = [
    { label: "At least 12 characters", missing: "at least 12 characters", test: (value: string) => value.length >= 12 },
    { label: "Upper and lower case letters", missing: "upper and lower case letters", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: "At least one number", missing: "a number", test: (value: string) => /\d/.test(value) },
];

/** ["a", "b", "c"] → "a, b and c" */
function joinWithAnd(items: string[]) {
    return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

export function SignInReset() {
    const id = useId();
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [shown, setShown] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const shownStep = useRef(step);

    const emailId = `${id}-email`;
    const passwordId = `${id}-password`;
    const rulesId = `${id}-rules`;
    const doneTitleId = `${id}-done-title`;

    // A new step moves focus: into the password field, or onto the title of the last page. Not on first load.
    useEffect(() => {
        if (shownStep.current === step) return;
        shownStep.current = step;
        if (step === "password") document.getElementById(passwordId)?.focus();
        else if (step === "done") document.getElementById(doneTitleId)?.focus();
        else document.getElementById(emailId)?.focus();
    }, [step, emailId, passwordId, doneTitleId]);

    function wait(then: () => void) {
        setBusy(true);
        window.setTimeout(() => {
            setBusy(false);
            then();
        }, 800);
    }

    function sendLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = email.trim();
        const found = !address
            ? "Enter the email you use for Acme."
            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)
              ? "That doesn't look like an email address."
              : "";
        setError(found);
        if (found) {
            document.getElementById(emailId)?.focus();
            return;
        }
        // The real flow emails a link, and the link opens the next page. Here the next page follows straight on.
        wait(() => setStep("password"));
    }

    function savePassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const missing = rules.filter((rule) => !rule.test(password)).map((rule) => rule.missing);
        const found = !password
            ? "Choose a new password."
            : missing.length === rules.length
              ? "Your password needs all three things below."
              : missing.length
                ? `Your password still needs ${joinWithAnd(missing)}.`
                : "";
        setError(found);
        if (found) {
            document.getElementById(passwordId)?.focus();
            return;
        }
        wait(() => setStep("done"));
    }

    return (
        <main className="sign-in-reset">
            <header className="sign-in-reset__bar">
                <Text variant="card-title" as="span" className="sign-in-reset__brand">
                    <span className="sign-in-reset__mark" aria-hidden="true" />
                    Acme
                </Text>
                <Link href="#" variant="standalone" className="sign-in-reset__back">
                    <ArrowLeft size={15} aria-hidden="true" />
                    Back to sign in
                </Link>
            </header>

            <div className="sign-in-reset__body">
                <Card padding="lg" className="sign-in-reset__card">
                    {step === "email" ? (
                        <form noValidate onSubmit={sendLink} className="sign-in-reset__form">
                            <span className="sign-in-reset__icon" aria-hidden="true">
                                <KeyRound size={20} />
                            </span>
                            <Text variant="heading" as="h1" className="sign-in-reset__title">
                                Reset your password
                            </Text>
                            <Text variant="copy" className="sign-in-reset__lead">
                                Enter the email you use for Acme, and we'll send you a link to choose a new password.
                            </Text>
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
                            <Button type="submit" variant="primary" fullWidth loading={busy}>
                                Email me a reset link
                            </Button>
                        </form>
                    ) : null}

                    {step === "password" ? (
                        <form noValidate onSubmit={savePassword} className="sign-in-reset__form">
                            <span className="sign-in-reset__icon" aria-hidden="true">
                                <KeyRound size={20} />
                            </span>
                            <Text variant="heading" as="h1" className="sign-in-reset__title">
                                Choose a new password
                            </Text>
                            <Text variant="copy" className="sign-in-reset__lead">
                                For{" "}
                                <Text variant="label" as="strong" tone="default" className="sign-in-reset__email">
                                    {email.trim()}
                                </Text>
                                . You'll be signed in as soon as it's saved.
                            </Text>
                            {/* A hidden username lets password managers save the new password against the right account. */}
                            <Input type="email" name="username" value={email.trim()} autoComplete="username" readOnly hidden />
                            <Field label="New password" error={error}>
                                <Input
                                    id={passwordId}
                                    type={shown ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setError("");
                                    }}
                                    autoComplete="new-password"
                                    aria-describedby={rulesId}
                                    endContent={
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            iconOnly
                                            aria-label={shown ? "Hide password" : "Show password"}
                                            onClick={() => setShown((current) => !current)}
                                        >
                                            {shown ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </Button>
                                    }
                                />
                            </Field>
                            <ul id={rulesId} className="sign-in-reset__rules" aria-label="Your password needs">
                                {rules.map((rule) => {
                                    const met = rule.test(password);
                                    return (
                                        <Text
                                            key={rule.label}
                                            variant="caption"
                                            as="li"
                                            tone={met ? "default" : "muted"}
                                            className="sign-in-reset__rule"
                                            data-met={met || undefined}
                                        >
                                            <span className="sign-in-reset__rule-mark" aria-hidden="true">
                                                <Check size={11} strokeWidth={3} />
                                            </span>
                                            {rule.label}
                                            <VisuallyHidden>{met ? " (done)" : " (not yet)"}</VisuallyHidden>
                                        </Text>
                                    );
                                })}
                            </ul>
                            <Button type="submit" variant="primary" fullWidth loading={busy}>
                                Save password and sign in
                            </Button>
                        </form>
                    ) : null}

                    {step === "done" ? (
                        <div className="sign-in-reset__form sign-in-reset__form--done">
                            <span className="sign-in-reset__icon sign-in-reset__icon--done" aria-hidden="true">
                                <CircleCheck size={20} />
                            </span>
                            <Text variant="heading" as="h1" id={doneTitleId} tabIndex={-1} className="sign-in-reset__title">
                                Password changed
                            </Text>
                            <Text variant="copy" className="sign-in-reset__lead">
                                You're signed in. To be safe, we've signed you out of Acme on every other device.
                            </Text>
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => {
                                    // In an app this opens the workspace; here it starts the sample again.
                                    setPassword("");
                                    setShown(false);
                                    setStep("email");
                                }}
                            >
                                Continue to Acme
                            </Button>
                        </div>
                    ) : null}
                </Card>
            </div>
        </main>
    );
}
