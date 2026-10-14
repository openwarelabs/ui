import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, Chip, cx, Input, Text } from "@openwarelabs/ui";

import { CheckIcon, MailIcon } from "@blocks/shared/icons";
import type { Hero03Props } from "./Hero03.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A hero with an email field: join a waitlist or start a trial in one step, with a confirmation in place of the form. */
export function Hero03({
    eyebrow,
    title,
    description,
    submitLabel,
    onSubmit,
    note,
    successTitle,
    successDescription,
    visual,
    labels = {},
    className,
    ...props
}: Hero03Props) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [joined, setJoined] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const doneRef = useRef<HTMLDivElement>(null);
    const touched = useRef(false);
    const id = useId();
    const titleId = `${id}-title`;

    // Moving between the form and the confirmation, take focus along so it isn't lost with the element that had it.
    useEffect(() => {
        if (!touched.current) return;
        if (joined) doneRef.current?.focus();
        else inputRef.current?.focus();
    }, [joined]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = email.trim();
        const problem = !value
            ? (labels.empty ?? "Enter your work email to join the waitlist.")
            : !emailPattern.test(value)
              ? (labels.invalid ?? "That doesn't look like an email address. Try one like maya@example.com.")
              : null;
        setError(problem);
        if (problem) {
            inputRef.current?.focus();
            return;
        }
        setSending(true);
        try {
            await onSubmit(value);
            touched.current = true;
            setJoined(value);
        } catch (failure) {
            setError(failure instanceof Error && failure.message ? failure.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
            inputRef.current?.focus();
        } finally {
            setSending(false);
        }
    };

    return (
        <section className={cx("ow-hero03", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-hero03__inner">
                {eyebrow ? <Chip>{eyebrow}</Chip> : null}
                <Text variant="hero" align="center" id={titleId} className="ow-hero03__title">
                    {title}
                </Text>
                <Text variant="lead" align="center" className="ow-hero03__lead">
                    {description}
                </Text>

                {joined ? (
                    <div ref={doneRef} className="ow-hero03__done" tabIndex={-1}>
                        <span className="ow-hero03__done-icon" aria-hidden="true">
                            <CheckIcon size={16} />
                        </span>
                        <div className="ow-hero03__done-text">
                            <Text variant="label">{successTitle}</Text>
                            {successDescription ? (
                                <Text variant="caption" as="p" className="ow-hero03__done-detail">
                                    {successDescription(joined)}
                                </Text>
                            ) : null}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                touched.current = true;
                                setJoined(null);
                            }}
                        >
                            {labels.change ?? "Change email"}
                        </Button>
                    </div>
                ) : (
                    <form className="ow-hero03__form" noValidate onSubmit={submit}>
                        <div className="ow-hero03__row">
                            <Input
                                ref={inputRef}
                                className="ow-hero03__input"
                                type="email"
                                autoComplete="email"
                                aria-label={labels.email ?? "Work email"}
                                aria-describedby={error ? `${id}-error` : note ? `${id}-note` : undefined}
                                placeholder={labels.placeholder ?? "you@company.com"}
                                startContent={<MailIcon size={16} />}
                                value={email}
                                isInvalid={Boolean(error)}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (error) setError(null);
                                }}
                            />
                            <Button type="submit" variant="primary" shape="pill" size="lg" loading={sending}>
                                {submitLabel}
                            </Button>
                        </div>
                        {error ? (
                            <Text tone="danger" id={`${id}-error`} className="ow-hero03__error" role="alert">
                                {error}
                            </Text>
                        ) : null}
                        {note ? (
                            <Text variant="caption" as="p" id={`${id}-note`} className="ow-hero03__note">
                                {note}
                            </Text>
                        ) : null}
                    </form>
                )}

                {visual}
            </div>
        </section>
    );
}
