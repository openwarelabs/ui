import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, Card, cx, Field, Input, Link, Text, VisuallyHidden } from "@openwarelabs/ui";

import { ArrowLeftIcon, CheckIcon, CircleCheckIcon, EyeIcon, EyeOffIcon, KeyRoundIcon } from "@blocks/shared/icons";
import type { SignIn05Props, SignIn05Rule } from "./SignIn05.types";

type Step = "email" | "password" | "done";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultRules: SignIn05Rule[] = [
    { label: "At least 12 characters", missing: "at least 12 characters", test: (value) => value.length >= 12 },
    { label: "Upper and lower case letters", missing: "upper and lower case letters", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { label: "At least one number", missing: "a number", test: (value) => /\d/.test(value) },
];

const counts = ["", "one", "two", "three", "four", "five", "six"];

/** ["a", "b", "c"] → "a, b and c" */
function joinWithAnd(items: string[]) {
    return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

/** Resetting a password on one card: ask for the email, then a new password with what it needs, then done. */
export function SignIn05({
    brand,
    backLink,
    title,
    description,
    onRequestLink,
    onSavePassword,
    rules = defaultRules,
    doneDescription,
    onContinue,
    labels = {},
    className,
    ...props
}: SignIn05Props) {
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

    /** Runs the callback with the button spinning, then moves on, or shows why it couldn't. */
    async function run(work: (() => void | Promise<void>) | undefined, next: Step, field: string) {
        setBusy(true);
        try {
            await work?.();
        } catch (failure) {
            setError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
            document.getElementById(field)?.focus();
            return;
        } finally {
            setBusy(false);
        }
        setStep(next);
    }

    function sendLink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = email.trim();
        const found = !address
            ? (labels.emailEmpty ?? "Enter the email you use to sign in.")
            : !emailPattern.test(address)
              ? (labels.emailInvalid ?? "That doesn't look like an email address.")
              : "";
        setError(found);
        if (found) {
            document.getElementById(emailId)?.focus();
            return;
        }
        void run(onRequestLink && (() => onRequestLink(address)), "password", emailId);
    }

    function savePassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const missing = rules.filter((rule) => !rule.test(password)).map((rule) => rule.missing);
        const found = !password
            ? (labels.passwordEmpty ?? "Choose a new password.")
            : missing.length === rules.length && rules.length > 1
              ? (labels.passwordNeedsAll?.(rules.length) ?? `Your password needs all ${counts[rules.length] ?? rules.length} things below.`)
              : missing.length
                ? (labels.passwordNeeds?.(joinWithAnd(missing)) ?? `Your password still needs ${joinWithAnd(missing)}.`)
                : "";
        setError(found);
        if (found) {
            document.getElementById(passwordId)?.focus();
            return;
        }
        void run(onSavePassword && (() => onSavePassword({ email: email.trim(), password })), "done", passwordId);
    }

    const icon = (
        <span className="ow-sign-in05__icon" aria-hidden="true">
            <KeyRoundIcon size={20} />
        </span>
    );
    const address = (
        <Text variant="label" as="strong" tone="default" className="ow-sign-in05__email">
            {email.trim()}
        </Text>
    );

    return (
        <main className={cx("ow-sign-in05", className)} {...props}>
            <header className="ow-sign-in05__bar">
                <Text variant="card-title" as="span" className="ow-sign-in05__brand">
                    {brand.logo}
                    {brand.name}
                </Text>
                {backLink ? (
                    <Link href={backLink.href} variant="standalone" className="ow-sign-in05__back">
                        <ArrowLeftIcon size={15} />
                        {backLink.label}
                    </Link>
                ) : null}
            </header>

            <div className="ow-sign-in05__body">
                <Card padding="lg" className="ow-sign-in05__card">
                    {step === "email" ? (
                        <form noValidate onSubmit={sendLink} className="ow-sign-in05__form">
                            {icon}
                            <Text variant="heading" as="h1" className="ow-sign-in05__title">
                                {title}
                            </Text>
                            {description ? (
                                <Text variant="copy" className="ow-sign-in05__lead">
                                    {description}
                                </Text>
                            ) : null}
                            <Field label={labels.email ?? "Email"} error={error}>
                                <Input
                                    id={emailId}
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        setError("");
                                    }}
                                    placeholder={labels.emailPlaceholder ?? "maya@example.com"}
                                    autoComplete="email"
                                />
                            </Field>
                            <Button type="submit" variant="primary" fullWidth loading={busy}>
                                {labels.sendLink ?? "Email me a reset link"}
                            </Button>
                        </form>
                    ) : null}

                    {step === "password" ? (
                        <form noValidate onSubmit={savePassword} className="ow-sign-in05__form">
                            {icon}
                            <Text variant="heading" as="h1" className="ow-sign-in05__title">
                                {labels.chooseTitle ?? "Choose a new password"}
                            </Text>
                            <Text variant="copy" className="ow-sign-in05__lead">
                                {labels.chooseDescription ? labels.chooseDescription(address) : <>For {address}. You'll be signed in as soon as it's saved.</>}
                            </Text>
                            {/* A hidden username lets password managers save the new password against the right account. */}
                            <Input type="email" name="username" value={email.trim()} autoComplete="username" readOnly hidden />
                            <Field label={labels.password ?? "New password"} error={error}>
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
                                            aria-label={shown ? (labels.hidePassword ?? "Hide password") : (labels.showPassword ?? "Show password")}
                                            onClick={() => setShown((current) => !current)}
                                        >
                                            {shown ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                                        </Button>
                                    }
                                />
                            </Field>
                            <ul id={rulesId} className="ow-sign-in05__rules" aria-label={labels.rules ?? "Your password needs"}>
                                {rules.map((rule) => {
                                    const met = rule.test(password);
                                    return (
                                        <Text
                                            key={rule.label}
                                            variant="caption"
                                            as="li"
                                            tone={met ? "default" : "muted"}
                                            className="ow-sign-in05__rule"
                                            data-met={met || undefined}
                                        >
                                            <span className="ow-sign-in05__rule-mark" aria-hidden="true">
                                                <CheckIcon size={11} strokeWidth={3} />
                                            </span>
                                            {rule.label}
                                            <VisuallyHidden>{met ? (labels.ruleMet ?? " (done)") : (labels.ruleNotMet ?? " (not yet)")}</VisuallyHidden>
                                        </Text>
                                    );
                                })}
                            </ul>
                            <Button type="submit" variant="primary" fullWidth loading={busy}>
                                {labels.save ?? "Save password and sign in"}
                            </Button>
                        </form>
                    ) : null}

                    {step === "done" ? (
                        <div className="ow-sign-in05__form ow-sign-in05__form--done">
                            <span className="ow-sign-in05__icon ow-sign-in05__icon--done" aria-hidden="true">
                                <CircleCheckIcon size={20} />
                            </span>
                            <Text variant="heading" as="h1" id={doneTitleId} tabIndex={-1} className="ow-sign-in05__title">
                                {labels.doneTitle ?? "Password changed"}
                            </Text>
                            {doneDescription ? (
                                <Text variant="copy" className="ow-sign-in05__lead">
                                    {doneDescription}
                                </Text>
                            ) : null}
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => {
                                    if (onContinue) {
                                        onContinue();
                                        return;
                                    }
                                    setPassword("");
                                    setShown(false);
                                    setStep("email");
                                }}
                            >
                                {labels.continue ?? "Continue"}
                            </Button>
                        </div>
                    ) : null}
                </Card>
            </div>
        </main>
    );
}
