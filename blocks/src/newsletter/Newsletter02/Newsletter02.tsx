import { useId, useState, type FormEvent } from "react";

import { Avatar, AvatarGroup, Button, Card, cx, Field, Input, Link, Text, toast } from "@openwarelabs/ui";

import { ArrowRightIcon } from "@blocks/shared/icons";
import type { Newsletter02Labels, Newsletter02Props } from "./Newsletter02.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(value: string, labels: Newsletter02Labels) {
    if (!value.trim()) return labels.empty ?? "Enter your email address.";
    if (!emailPattern.test(value.trim())) return labels.invalid ?? "Enter an email address like name@example.com.";
    return undefined;
}

/** A newsletter sign-up in a card at the reading width, for the end of a post, with its writers along the foot. */
export function Newsletter02({
    icon,
    title,
    description,
    submitLabel,
    onSubmit,
    successTitle,
    successDescription,
    authors = [],
    authorsNote,
    archiveLink,
    labels = {},
    className,
    ...props
}: Newsletter02Props) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string>();
    const [touched, setTouched] = useState(false);
    const [sending, setSending] = useState(false);
    const titleId = `${useId()}-title`;

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched(true);
        const problem = emailError(email, labels);
        setError(problem);
        if (problem) return;
        const address = email.trim();
        setSending(true);
        try {
            await onSubmit(address);
            toast.success(successTitle, { description: successDescription?.(address) });
            setEmail("");
            setTouched(false);
        } catch (failure) {
            setError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
        } finally {
            setSending(false);
        }
    };

    const hasFoot = authors.length > 0 || Boolean(authorsNote) || Boolean(archiveLink);

    return (
        <section className={cx("ow-newsletter02", className)} aria-labelledby={titleId} {...props}>
            <Card padding="none" className="ow-newsletter02__card">
                <div className="ow-newsletter02__body">
                    {icon ? (
                        <span className="ow-newsletter02__icon" aria-hidden="true">
                            {icon}
                        </span>
                    ) : null}
                    <Text as="h2" variant="heading" id={titleId} className="ow-newsletter02__title">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-newsletter02__lead">
                            {description}
                        </Text>
                    ) : null}
                    <form className="ow-newsletter02__form" aria-labelledby={titleId} noValidate onSubmit={submit}>
                        <Field label={labels.email ?? "Email address"} error={error}>
                            <Input
                                type="email"
                                autoComplete="email"
                                placeholder={labels.placeholder ?? "you@example.com"}
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (touched) setError(emailError(event.target.value, labels));
                                }}
                            />
                        </Field>
                        <Button type="submit" variant="primary" shape="pill" loading={sending} className="ow-newsletter02__submit">
                            {submitLabel}
                        </Button>
                    </form>
                </div>
                {hasFoot ? (
                    <div className="ow-newsletter02__foot">
                        <div className="ow-newsletter02__authors">
                            {authors.length ? (
                                <AvatarGroup size="sm">
                                    {authors.map((name) => (
                                        <Avatar key={name} name={name} />
                                    ))}
                                </AvatarGroup>
                            ) : null}
                            {authorsNote ? (
                                <Text variant="body" tone="muted">
                                    {authorsNote}
                                </Text>
                            ) : null}
                        </div>
                        {archiveLink ? (
                            <Link href={archiveLink.href} variant="standalone" className="ow-newsletter02__past">
                                {archiveLink.label}
                                <ArrowRightIcon size={14} />
                            </Link>
                        ) : null}
                    </div>
                ) : null}
            </Card>
        </section>
    );
}
