import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, cx, Field, Input, SectionHeading, Text } from "@openwarelabs/ui";

import { CircleCheckIcon } from "@blocks/shared/icons";
import type { Newsletter01Labels, Newsletter01Props } from "./Newsletter01.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(value: string, labels: Newsletter01Labels) {
    if (!value.trim()) return labels.empty ?? "Enter your email address.";
    if (!emailPattern.test(value.trim())) return labels.invalid ?? "Enter an email address like name@example.com.";
    return undefined;
}

/** A newsletter sign-up in one row: the heading on the left, the field and button on the right, a confirmation in place of the form. */
export function Newsletter01({
    eyebrow,
    title,
    description,
    submitLabel,
    onSubmit,
    note,
    successTitle,
    successDescription,
    labels = {},
    className,
    ...props
}: Newsletter01Props) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string>();
    const [touched, setTouched] = useState(false);
    const [sending, setSending] = useState(false);
    const [subscribed, setSubscribed] = useState<string>();
    const doneRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const resetting = useRef(false);
    const id = useId();
    const titleId = `${id}-title`;

    // Move focus with the change, so keyboard and screen reader users land on the confirmation, and back on the field.
    useEffect(() => {
        if (subscribed) doneRef.current?.focus();
        else if (resetting.current) inputRef.current?.focus();
        resetting.current = false;
    }, [subscribed]);

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
            setSubscribed(address);
        } catch (failure) {
            setError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
            inputRef.current?.focus();
        } finally {
            setSending(false);
        }
    };

    const reset = () => {
        resetting.current = true;
        setSubscribed(undefined);
        setEmail("");
        setTouched(false);
        setError(undefined);
    };

    return (
        <section className={cx("ow-newsletter01", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-newsletter01__inner">
                <SectionHeading eyebrow={eyebrow} title={<span id={titleId}>{title}</span>} intro={description} />

                <div>
                    {subscribed ? (
                        <div
                            ref={doneRef}
                            tabIndex={-1}
                            role="group"
                            aria-labelledby={`${id}-done-title`}
                            aria-describedby={successDescription ? `${id}-done-text` : undefined}
                            className="ow-newsletter01__done"
                        >
                            <CircleCheckIcon size={20} />
                            <div>
                                <Text as="p" variant="label" id={`${id}-done-title`}>
                                    {successTitle}
                                </Text>
                                {successDescription ? (
                                    <Text variant="copy" tone="soft" id={`${id}-done-text`} className="ow-newsletter01__done-text">
                                        {successDescription(subscribed)}
                                    </Text>
                                ) : null}
                                <Button variant="ghost" size="sm" className="ow-newsletter01__reset" onClick={reset}>
                                    {labels.change ?? "Use a different email"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form className="ow-newsletter01__form" aria-labelledby={titleId} noValidate onSubmit={submit}>
                            <Field label={labels.email ?? "Email address"} error={error}>
                                <Input
                                    ref={inputRef}
                                    type="email"
                                    autoComplete="email"
                                    placeholder={labels.placeholder ?? "you@example.com"}
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        // Once they've tried to send, say as they type whether it's fixed.
                                        if (touched) setError(emailError(event.target.value, labels));
                                    }}
                                />
                            </Field>
                            <Button type="submit" variant="primary" shape="pill" loading={sending} className="ow-newsletter01__submit">
                                {submitLabel}
                            </Button>
                            {note ? (
                                <Text as="p" variant="caption" className="ow-newsletter01__fine">
                                    {note}
                                </Text>
                            ) : null}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
