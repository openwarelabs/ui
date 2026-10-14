import { useId, useState, type FormEvent } from "react";

import { Button, Card, cx, Field, Input, Link, Separator, Text } from "@openwarelabs/ui";

import type { SignIn01Props } from "./SignIn01.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Errors {
    email?: string;
    password?: string;
}

/** One card in the middle of the window: the mark and heading above it, other accounts and the email form on it. */
export function SignIn01({
    title,
    description,
    logo,
    providers = [],
    onProviderSelect,
    onSubmit,
    forgotPasswordHref,
    footer,
    labels = {},
    className,
    ...props
}: SignIn01Props) {
    const id = useId();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    // The provider's id, or "" for the form, while it's working.
    const [busy, setBusy] = useState<string | null>(null);

    const fieldId = (name: string) => `${id}-${name}`;

    async function continueWith(provider: string) {
        setBusy(provider);
        try {
            await onProviderSelect?.(provider);
        } finally {
            setBusy(null);
        }
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = email.trim();
        const found: Errors = {};
        if (!address) found.email = labels.emailEmpty ?? "Enter the email address you signed up with.";
        else if (!emailPattern.test(address)) found.email = labels.emailInvalid ?? "That doesn't look like an email address.";
        if (!password) found.password = labels.passwordEmpty ?? "Enter your password.";
        setErrors(found);
        if (found.email || found.password) {
            document.getElementById(fieldId(found.email ? "email" : "password"))?.focus();
            return;
        }
        setBusy("");
        try {
            await onSubmit?.({ email: address, password });
        } catch (failure) {
            if (failure instanceof Error && failure.message) {
                setErrors({ password: failure.message });
                document.getElementById(fieldId("password"))?.focus();
            }
        } finally {
            setBusy(null);
        }
    }

    return (
        <main className={cx("ow-sign-in01", className)} {...props}>
            <div className="ow-sign-in01__inner">
                {logo}
                <Text variant="heading" as="h1" className="ow-sign-in01__title">
                    {title}
                </Text>
                {description ? (
                    <Text variant="copy" className="ow-sign-in01__lead">
                        {description}
                    </Text>
                ) : null}

                <Card padding="lg" className="ow-sign-in01__card">
                    {providers.length ? (
                        <>
                            <div className="ow-sign-in01__providers">
                                {providers.map((provider) => (
                                    <Button
                                        key={provider.id}
                                        fullWidth
                                        startIcon={provider.icon}
                                        loading={busy === provider.id}
                                        disabled={busy !== null && busy !== provider.id}
                                        onClick={() => void continueWith(provider.id)}
                                    >
                                        {provider.label}
                                    </Button>
                                ))}
                            </div>

                            <Separator label={labels.separator ?? "or"} spacing="3xl" />
                        </>
                    ) : null}

                    <form className="ow-sign-in01__form" noValidate onSubmit={submit}>
                        <Field label={labels.email ?? "Email"} error={errors.email}>
                            <Input
                                id={fieldId("email")}
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setErrors((current) => ({ ...current, email: undefined }));
                                }}
                                placeholder={labels.emailPlaceholder ?? "maya@example.com"}
                                autoComplete="email"
                            />
                        </Field>
                        {/* The link sits on the label's line but outside the label, so clicking the label still focuses the field. */}
                        <div className="ow-sign-in01__password">
                            <Field label={labels.password ?? "Password"} error={errors.password}>
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
                            {forgotPasswordHref !== undefined ? (
                                <Link href={forgotPasswordHref} variant="muted" className="ow-sign-in01__forgot">
                                    {labels.forgotPassword ?? "Forgot password?"}
                                </Link>
                            ) : null}
                        </div>
                        <Button type="submit" variant="primary" fullWidth loading={busy === ""} disabled={busy !== null && busy !== ""}>
                            {labels.submit ?? "Sign in"}
                        </Button>
                    </form>
                </Card>

                {footer ? (
                    <Text variant="copy" className="ow-sign-in01__switch">
                        {footer}
                    </Text>
                ) : null}
            </div>
        </main>
    );
}
