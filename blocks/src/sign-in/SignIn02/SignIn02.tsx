import { useId, useState, type FormEvent } from "react";

import { Button, cx, Field, Input, Separator, Text } from "@openwarelabs/ui";

import type { SignIn02Props } from "./SignIn02.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Errors {
    email?: string;
    password?: string;
}

/** Signing up: the form on one side of the window, a midnight plate with the product and a quote on the other. */
export function SignIn02({
    brand,
    title,
    description,
    providers = [],
    onProviderSelect,
    onSubmit,
    passwordMinLength = 12,
    terms,
    footer,
    eyebrow,
    headline,
    visual,
    quote,
    labels = {},
    className,
    ...props
}: SignIn02Props) {
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
        if (!address) found.email = labels.emailEmpty ?? "Enter your work email.";
        else if (!emailPattern.test(address)) found.email = labels.emailInvalid ?? "That doesn't look like an email address.";
        if (password.length < passwordMinLength) {
            const missing = passwordMinLength - password.length;
            found.password = password ? (labels.passwordShort?.(missing) ?? `Add ${missing} more characters.`) : (labels.passwordEmpty ?? "Choose a password.");
        }
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
                setErrors({ email: failure.message });
                document.getElementById(fieldId("email"))?.focus();
            }
        } finally {
            setBusy(null);
        }
    }

    return (
        <main className={cx("ow-sign-in02", className)} {...props}>
            <div className="ow-sign-in02__form-side">
                <Text variant="card-title" as="span" className="ow-sign-in02__brand">
                    {brand.logo}
                    {brand.name}
                </Text>

                <div className="ow-sign-in02__form-wrap">
                    <Text variant="heading" as="h1">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-sign-in02__lead">
                            {description}
                        </Text>
                    ) : null}

                    {providers.length ? (
                        <>
                            <div className="ow-sign-in02__providers">
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

                    <form className="ow-sign-in02__form" noValidate onSubmit={submit}>
                        <Field label={labels.email ?? "Work email"} error={errors.email}>
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
                        <Field
                            label={labels.password ?? "Password"}
                            hint={errors.password ? undefined : (labels.passwordHint ?? `At least ${passwordMinLength} characters.`)}
                            error={errors.password}
                        >
                            <Input
                                id={fieldId("password")}
                                type="password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setErrors((current) => ({ ...current, password: undefined }));
                                }}
                                autoComplete="new-password"
                            />
                        </Field>
                        <Button type="submit" variant="primary" fullWidth loading={busy === ""} disabled={busy !== null && busy !== ""}>
                            {labels.submit ?? "Create account"}
                        </Button>
                    </form>

                    {terms ? (
                        <Text variant="caption" as="p" align="center" className="ow-sign-in02__terms">
                            {terms}
                        </Text>
                    ) : null}
                </div>

                {footer ? (
                    <Text variant="copy" align="center">
                        {footer}
                    </Text>
                ) : null}
            </div>

            <aside className="ow-sign-in02__plate" aria-label={labels.plate ?? "About the product"}>
                <div className="ow-sign-in02__plate-inner">
                    {eyebrow ? (
                        <Text variant="caption" as="p" className="ow-sign-in02__eyebrow">
                            <span className="ow-sign-in02__brass" aria-hidden="true" />
                            {eyebrow}
                        </Text>
                    ) : null}
                    {headline ? (
                        <Text variant="heading" as="p" className="ow-sign-in02__headline">
                            {headline}
                        </Text>
                    ) : null}
                    {visual}
                    {quote ? (
                        <figure className="ow-sign-in02__quote">
                            <Text variant="body" as="blockquote" className="ow-sign-in02__quote-text">
                                {quote.text}
                            </Text>
                            <Text variant="caption" as="figcaption" className="ow-sign-in02__quote-by">
                                {quote.author}
                                {quote.badge ? (
                                    <>
                                        {" "}
                                        <span className="ow-sign-in02__sample">{quote.badge}</span>
                                    </>
                                ) : null}
                            </Text>
                        </figure>
                    ) : null}
                </div>
            </aside>
        </main>
    );
}
