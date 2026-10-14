import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, Card, cx, Field, Input, Link, SectionHeading, Select, Text, Textarea, type SelectItem } from "@openwarelabs/ui";

import { CircleCheckIcon } from "@blocks/shared/icons";
import type { Contact01Errors, Contact01Labels, Contact01Props, Contact01Values } from "./Contact01.types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Contact01Values, labels: Contact01Labels, minMessageLength: number): Contact01Errors {
    const errors: Contact01Errors = {};
    if (!values.name.trim()) errors.name = labels.nameEmpty ?? "Enter your name.";
    if (!values.email.trim()) errors.email = labels.emailEmpty ?? "Enter your work email.";
    else if (!emailPattern.test(values.email.trim())) errors.email = labels.emailInvalid ?? "Enter an email address like name@example.com.";
    if (!values.message.trim()) errors.message = labels.messageEmpty ?? "Tell us a little about what you need.";
    else if (values.message.trim().length < minMessageLength) errors.message = labels.messageShort ?? "Add a few more words, so it reaches the right person.";
    return errors;
}

function firstValue(items: SelectItem[] = []): string {
    for (const item of items) {
        if ("options" in item) {
            const value = firstValue(item.options);
            if (value) return value;
        } else return item.value;
    }
    return "";
}

/** A short contact form in a card, beside the heading and a list of ways to reach you, with a thank-you in place of the form once it's sent. */
export function Contact01({
    eyebrow,
    title,
    description,
    details = [],
    topics,
    defaultTopic,
    sizes,
    minMessageLength = 20,
    onSubmit,
    note,
    successTitle,
    successDescription,
    labels = {},
    className,
    ...props
}: Contact01Props) {
    const empty: Contact01Values = { name: "", email: "", company: "", size: "", topic: defaultTopic ?? firstValue(topics), message: "" };
    const [values, setValues] = useState<Contact01Values>(empty);
    const [errors, setErrors] = useState<Contact01Errors>({});
    const [tried, setTried] = useState(false);
    const [sending, setSending] = useState(false);
    const [failure, setFailure] = useState<string>();
    const [sent, setSent] = useState<Contact01Values>();
    const doneRef = useRef<HTMLDivElement>(null);
    const id = useId();
    const titleId = `${id}-title`;

    useEffect(() => {
        if (sent) doneRef.current?.focus();
    }, [sent]);

    const set = (key: keyof Contact01Values, value: string) => {
        const next = { ...values, [key]: value };
        setValues(next);
        // After the first try, errors clear as each field is fixed.
        if (tried) setErrors(validate(next, labels, minMessageLength));
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTried(true);
        setFailure(undefined);
        const found = validate(values, labels, minMessageLength);
        setErrors(found);
        const first = (["name", "email", "message"] as const).find((key) => found[key]);
        if (first) {
            document.getElementById(`${id}-${first}`)?.focus();
            return;
        }
        setSending(true);
        try {
            await onSubmit(values);
            setSent(values);
        } catch (error) {
            setFailure(error instanceof Error && error.message ? error.message : (labels.failed ?? "That didn't go through. Try again in a moment."));
        } finally {
            setSending(false);
        }
    };

    const startAgain = () => {
        setValues(empty);
        setErrors({});
        setTried(false);
        setSent(undefined);
    };

    const optional = (label: string) => (
        <>
            {label}{" "}
            <Text variant="body" as="span" tone="muted">
                {labels.optional ?? "(optional)"}
            </Text>
        </>
    );

    return (
        <section className={cx("ow-contact01", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-contact01__inner">
                <div>
                    <SectionHeading eyebrow={eyebrow} title={<span id={titleId}>{title}</span>} intro={description} />
                    {details.length ? (
                        <ul className="ow-contact01__details">
                            {details.map((detail, index) => (
                                <li key={index} className="ow-contact01__detail">
                                    <span className="ow-contact01__detail-icon" aria-hidden="true">
                                        {detail.icon}
                                    </span>
                                    <div>
                                        <Text variant="caption" as="p">
                                            {detail.label}
                                        </Text>
                                        <Text variant="card-title" as="p" className="ow-contact01__detail-value">
                                            {detail.href ? <Link href={detail.href}>{detail.value}</Link> : detail.value}
                                        </Text>
                                        {detail.note ? (
                                            <Text variant="copy" className="ow-contact01__detail-note">
                                                {detail.note}
                                            </Text>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>

                <Card padding="none" className="ow-contact01__card">
                    {sent ? (
                        <div ref={doneRef} tabIndex={-1} className="ow-contact01__done" role="group" aria-labelledby={`${id}-done-title`}>
                            <span className="ow-contact01__done-icon" aria-hidden="true">
                                <CircleCheckIcon size={22} />
                            </span>
                            <Text variant="heading" as="h3" id={`${id}-done-title`} className="ow-contact01__done-title">
                                {successTitle(sent)}
                            </Text>
                            {successDescription ? (
                                <Text variant="copy" className="ow-contact01__done-text">
                                    {successDescription(sent)}
                                </Text>
                            ) : null}
                            <Button shape="pill" onClick={startAgain}>
                                {labels.again ?? "Send another message"}
                            </Button>
                        </div>
                    ) : (
                        <form className="ow-contact01__form" aria-labelledby={titleId} noValidate onSubmit={submit}>
                            <Field label={labels.name ?? "Name"} error={errors.name}>
                                <Input id={`${id}-name`} autoComplete="name" value={values.name} onChange={(event) => set("name", event.target.value)} />
                            </Field>
                            <Field label={labels.email ?? "Work email"} error={errors.email}>
                                <Input
                                    id={`${id}-email`}
                                    type="email"
                                    autoComplete="email"
                                    placeholder={labels.emailPlaceholder ?? "you@example.com"}
                                    value={values.email}
                                    onChange={(event) => set("email", event.target.value)}
                                />
                            </Field>
                            <Field label={optional(labels.company ?? "Company")}>
                                <Input autoComplete="organization" value={values.company} onChange={(event) => set("company", event.target.value)} />
                            </Field>
                            {sizes ? (
                                <Field label={optional(labels.size ?? "Team size")}>
                                    <Select
                                        value={values.size}
                                        onChange={(value) => set("size", value)}
                                        options={sizes}
                                        placeholder={labels.sizePlaceholder ?? "Choose a size"}
                                    />
                                </Field>
                            ) : null}
                            {topics ? (
                                <Field label={labels.topic ?? "What's it about?"} className="ow-contact01__wide">
                                    <Select value={values.topic} onChange={(value) => set("topic", value)} options={topics} />
                                </Field>
                            ) : null}
                            <Field
                                label={labels.message ?? "Message"}
                                hint={errors.message ? undefined : (labels.messageHint ?? "A few lines about your team and what you need.")}
                                error={errors.message}
                                className="ow-contact01__wide"
                            >
                                <Textarea id={`${id}-message`} rows={5} value={values.message} onChange={(event) => set("message", event.target.value)} />
                            </Field>
                            <div className="ow-contact01__foot">
                                <Text variant="caption" as="p" tone={failure ? "danger" : undefined} aria-live="polite">
                                    {failure ?? note}
                                </Text>
                                <Button type="submit" variant="primary" shape="pill" loading={sending}>
                                    {labels.submit ?? "Send message"}
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </section>
    );
}
