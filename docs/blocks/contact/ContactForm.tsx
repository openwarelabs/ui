import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button, Card, Field, Input, Link, SectionHeading, Select, Textarea } from "@openwarelabs/ui";
import { CircleCheck, Clock, LifeBuoy, Mail } from "lucide-react";

import "./ContactForm.css";

const topics = [
    { value: "plans", label: "Plans and pricing", team: "sales" },
    { value: "security", label: "A security review", team: "security" },
    { value: "migration", label: "Moving from another tool", team: "onboarding" },
    { value: "partners", label: "Partnerships", team: "partnerships" },
    { value: "other", label: "Something else", team: "support" },
];

const sizes = ["1 to 5", "6 to 20", "21 to 100", "101 to 500", "Over 500"].map((size) => ({ value: size, label: `${size} people` }));

interface Values {
    name: string;
    email: string;
    company: string;
    size: string;
    topic: string;
    message: string;
}

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const empty: Values = { name: "", email: "", company: "", size: "", topic: "plans", message: "" };

function validate(values: Values): Errors {
    const errors: Errors = {};
    if (!values.name.trim()) errors.name = "Enter your name.";
    if (!values.email.trim()) errors.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter an email address like name@example.com.";
    if (!values.message.trim()) errors.message = "Tell us a little about what you need.";
    else if (values.message.trim().length < 20) errors.message = "Add a few more words, so it reaches the right person.";
    return errors;
}

const details = [
    { icon: Mail, label: "Sales", value: "sales@example.com", href: "mailto:sales@example.com", note: "Plans, invoices and security reviews" },
    { icon: LifeBuoy, label: "Support", value: "support@example.com", href: "mailto:support@example.com", note: "Help with a workspace you already have" },
    { icon: Clock, label: "Reply time", value: "Within one working day", note: "Usually the same morning. Monday to Friday, 08:00 to 18:00 CET." },
];

export function ContactForm() {
    const [values, setValues] = useState<Values>(empty);
    const [errors, setErrors] = useState<Errors>({});
    const [tried, setTried] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState<Values>();
    const doneRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sent) doneRef.current?.focus();
    }, [sent]);

    const set = (key: keyof Values, value: string) => {
        const next = { ...values, [key]: value };
        setValues(next);
        // After the first try, errors clear as each field is fixed.
        if (tried) setErrors(validate(next));
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTried(true);
        const found = validate(values);
        setErrors(found);
        const first = (["name", "email", "message"] as const).find((key) => found[key]);
        if (first) {
            document.getElementById(`contact-form-${first}`)?.focus();
            return;
        }
        setSending(true);
        // Stands in for the request to your backend.
        window.setTimeout(() => {
            setSending(false);
            setSent(values);
        }, 900);
    };

    const startAgain = () => {
        setValues(empty);
        setErrors({});
        setTried(false);
        setSent(undefined);
    };

    const team = topics.find((topic) => topic.value === sent?.topic)?.team ?? "support";

    return (
        <section className="contact-form" aria-labelledby="contact-form-title">
            <div className="contact-form__inner">
                <div>
                    <SectionHeading
                        eyebrow="Contact"
                        title={<span id="contact-form-title">Talk to the Acme team</span>}
                        intro="A question about plans, a security review or moving your team across? Tell us a little and the right person will reply."
                    />
                    <ul className="contact-form__details">
                        {details.map(({ icon: Icon, label, value, href, note }) => (
                            <li key={label} className="contact-form__detail">
                                <span className="contact-form__detail-icon" aria-hidden="true">
                                    <Icon size={16} />
                                </span>
                                <div>
                                    <p className="contact-form__detail-label">{label}</p>
                                    <p className="contact-form__detail-value">{href ? <Link href={href}>{value}</Link> : value}</p>
                                    <p className="contact-form__detail-note">{note}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <Card padding="none" className="contact-form__card">
                    {sent ? (
                        <div ref={doneRef} tabIndex={-1} className="contact-form__done" role="group" aria-labelledby="contact-form-done-title">
                            <span className="contact-form__done-icon" aria-hidden="true">
                                <CircleCheck size={22} />
                            </span>
                            <h3 id="contact-form-done-title" className="contact-form__done-title">
                                Thanks, {sent.name.trim().split(" ")[0]}
                            </h3>
                            <p className="contact-form__done-text">
                                Your message is with our {team} team. We'll reply to {sent.email.trim()} within one working day.
                            </p>
                            <Button shape="pill" onClick={startAgain}>
                                Send another message
                            </Button>
                        </div>
                    ) : (
                        <form className="contact-form__form" aria-labelledby="contact-form-title" noValidate onSubmit={submit}>
                            <Field label="Name" error={errors.name}>
                                <Input id="contact-form-name" autoComplete="name" value={values.name} onChange={(event) => set("name", event.target.value)} />
                            </Field>
                            <Field label="Work email" error={errors.email}>
                                <Input
                                    id="contact-form-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={values.email}
                                    onChange={(event) => set("email", event.target.value)}
                                />
                            </Field>
                            <Field
                                label={
                                    <>
                                        Company <span className="contact-form__optional">(optional)</span>
                                    </>
                                }
                            >
                                <Input autoComplete="organization" value={values.company} onChange={(event) => set("company", event.target.value)} />
                            </Field>
                            <Field
                                label={
                                    <>
                                        Team size <span className="contact-form__optional">(optional)</span>
                                    </>
                                }
                            >
                                <Select value={values.size} onChange={(value) => set("size", value)} options={sizes} placeholder="Choose a size" />
                            </Field>
                            <Field label="What's it about?" className="contact-form__wide">
                                <Select value={values.topic} onChange={(value) => set("topic", value)} options={topics} />
                            </Field>
                            <Field
                                label="Message"
                                hint={errors.message ? undefined : "A few lines about your team and what you need."}
                                error={errors.message}
                                className="contact-form__wide"
                            >
                                <Textarea id="contact-form-message" rows={5} value={values.message} onChange={(event) => set("message", event.target.value)} />
                            </Field>
                            <div className="contact-form__foot">
                                <p className="contact-form__privacy">We use your details only to reply to you.</p>
                                <Button type="submit" variant="primary" shape="pill" loading={sending}>
                                    Send message
                                </Button>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </section>
    );
}
