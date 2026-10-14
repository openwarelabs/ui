import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, cx, Field, Input, Link, Text } from "@openwarelabs/ui";

import { ArrowLeftIcon, MailCheckIcon, MailIcon } from "@blocks/shared/icons";
import type { SignIn03Props } from "./SignIn03.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Signing in with a link by email: one field, then a page saying where the link went, with a way to send it again. */
export function SignIn03({
    brand,
    link,
    title,
    description,
    onSubmit,
    onResend,
    cooldown = 30,
    sentDescription,
    sentNote,
    labels = {},
    className,
    ...props
}: SignIn03Props) {
    const emailId = useId();
    const titleId = useId();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [wait, setWait] = useState(0);
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
        if (sentTo) document.getElementById(titleId)?.focus();
        else document.getElementById(emailId)?.focus();
    }, [sentTo, emailId, titleId]);

    async function send(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const address = email.trim();
        const found = !address
            ? (labels.emailEmpty ?? "Enter your email address.")
            : !emailPattern.test(address)
              ? (labels.emailInvalid ?? "That doesn't look like an email address.")
              : "";
        setError(found);
        if (found) {
            document.getElementById(emailId)?.focus();
            return;
        }
        setSending(true);
        try {
            await onSubmit?.(address);
        } catch (failure) {
            setError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
            document.getElementById(emailId)?.focus();
            return;
        } finally {
            setSending(false);
        }
        setSentTo(address);
        setWait(cooldown);
    }

    function resend() {
        if (!sentTo) return;
        setWait(cooldown);
        void onResend?.(sentTo);
    }

    const address = sentTo ? (
        <Text variant="label" as="strong" tone="default" className="ow-sign-in03__email">
            {sentTo}
        </Text>
    ) : null;

    return (
        <main className={cx("ow-sign-in03", className)} {...props}>
            <div className="ow-sign-in03__panel">
                <header className="ow-sign-in03__bar">
                    <Text variant="card-title" as="span" className="ow-sign-in03__brand">
                        {brand.logo}
                        {brand.name}
                    </Text>
                    {link ? (
                        <Link href={link.href} variant="muted">
                            {link.label}
                        </Link>
                    ) : null}
                </header>

                <div className="ow-sign-in03__body">
                    {sentTo ? (
                        <div className="ow-sign-in03__content" key="sent">
                            <span className="ow-sign-in03__icon ow-sign-in03__icon--sent" aria-hidden="true">
                                <MailCheckIcon size={22} />
                            </span>
                            <Text variant="heading" as="h1" id={titleId} tabIndex={-1} className="ow-sign-in03__title">
                                {labels.sentTitle ?? "Check your email"}
                            </Text>
                            <Text variant="copy" className="ow-sign-in03__lead">
                                {sentDescription ? (
                                    sentDescription(address)
                                ) : (
                                    <>
                                        We sent a sign-in link to
                                        {address}
                                        It works once, for the next 15 minutes, on any device.
                                    </>
                                )}
                            </Text>
                            <div className="ow-sign-in03__actions">
                                <Button fullWidth disabled={wait > 0} onClick={resend}>
                                    {wait > 0 ? (labels.resendIn?.(wait) ?? `Send again in ${wait} s`) : (labels.resend ?? "Send the link again")}
                                </Button>
                                <Button fullWidth variant="ghost" startIcon={<ArrowLeftIcon size={16} />} onClick={() => setSentTo(null)}>
                                    {labels.back ?? "Use a different email"}
                                </Button>
                            </div>
                            {sentNote ? (
                                <Text variant="caption" as="p" className="ow-sign-in03__note">
                                    {sentNote}
                                </Text>
                            ) : null}
                        </div>
                    ) : (
                        <form className="ow-sign-in03__content" key="ask" noValidate onSubmit={send}>
                            <span className="ow-sign-in03__icon" aria-hidden="true">
                                <MailIcon size={22} />
                            </span>
                            <Text variant="heading" as="h1" className="ow-sign-in03__title">
                                {title}
                            </Text>
                            {description ? (
                                <Text variant="copy" className="ow-sign-in03__lead">
                                    {description}
                                </Text>
                            ) : null}
                            <div className="ow-sign-in03__fields">
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
                                <Button type="submit" variant="primary" fullWidth loading={sending}>
                                    {labels.submit ?? "Email me a link"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
