import { useId, useState, type FormEvent, type ReactNode } from "react";

import { Button, Card, Checkbox, Field, Input, NumberField, Radio, RadioGroup, Select, toast } from "@openwarelabs/ui";

import "./FormSections.css";

const timeZones = [
    { value: "Europe/Dublin", label: "Dublin (GMT+1)" },
    { value: "Europe/London", label: "London (GMT+1)" },
    { value: "Europe/Berlin", label: "Berlin (GMT+2)" },
    { value: "Europe/Zurich", label: "Zürich (GMT+2)" },
    { value: "America/New_York", label: "New York (GMT−4)" },
    { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
];

const countries = [
    { value: "AT", label: "Austria" },
    { value: "DE", label: "Germany" },
    { value: "IE", label: "Ireland" },
    { value: "NL", label: "Netherlands" },
    { value: "ES", label: "Spain" },
    { value: "CH", label: "Switzerland" },
];

interface Values {
    name: string;
    slug: string;
    timeZone: string;
    billingEmail: string;
    legalName: string;
    country: string;
    vat: string;
    whoCanRun: string;
    runLimit: number | null;
    reviewBeforeMerge: boolean;
}

type FieldName = "name" | "slug" | "billingEmail" | "legalName" | "vat";
type Errors = Partial<Record<FieldName, string>>;

// The order fields appear in, so the first wrong one gets focus.
const fieldOrder: FieldName[] = ["name", "slug", "billingEmail", "legalName", "vat"];

const saved: Values = {
    name: "Acme",
    slug: "acme",
    timeZone: "Europe/Berlin",
    billingEmail: "finance@example.com",
    legalName: "Acme Software GmbH",
    country: "DE",
    vat: "DE 318 442 907",
    whoCanRun: "members",
    runLimit: 200,
    reviewBeforeMerge: true,
};

function validate(values: Values): Errors {
    const errors: Errors = {};
    if (!values.name.trim()) errors.name = "The workspace needs a name.";
    if (!values.slug.trim()) errors.slug = "The workspace needs an address.";
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(values.slug)) errors.slug = "Use lowercase letters, numbers and single dashes.";
    else if (values.slug.length < 3) errors.slug = "Make it at least 3 characters long.";
    if (!values.billingEmail.trim()) errors.billingEmail = "Invoices need somewhere to go.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.billingEmail.trim())) errors.billingEmail = "That doesn't look like an email address.";
    if (!values.legalName.trim()) errors.legalName = "Invoices need the name your company is registered under.";
    const vat = values.vat.replace(/[\s.-]/g, "").toUpperCase();
    if (vat && !/^[A-Z]{2,3}[0-9A-Z]{8,12}$/.test(vat)) errors.vat = "A VAT number starts with the country code, like DE318442907.";
    return errors;
}

/** One section: its title and purpose on the left, its fields on a card on the right. */
function Section({ id, title, description, children }: { id: string; title: string; description: ReactNode; children: ReactNode }) {
    return (
        <section className="form-sections__section" aria-labelledby={id}>
            <div className="form-sections__intro">
                <h2 id={id} className="form-sections__section-title">
                    {title}
                </h2>
                <p className="form-sections__section-text">{description}</p>
            </div>
            <Card padding="none" className="form-sections__card">
                {children}
            </Card>
        </section>
    );
}

export function FormSections() {
    const id = useId();
    const [values, setValues] = useState<Values>(saved);
    const [lastSaved, setLastSaved] = useState<Values>(saved);
    const [errors, setErrors] = useState<Errors>({});
    const [saving, setSaving] = useState(false);

    const fieldId = (name: string) => `${id}-${name}`;
    const dirty = JSON.stringify(values) !== JSON.stringify(lastSaved);

    function update<K extends keyof Values>(key: K, value: Values[K]) {
        setValues((current) => ({ ...current, [key]: value }));
        if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
    }

    function discard() {
        setValues(lastSaved);
        setErrors({});
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const found = validate(values);
        setErrors(found);
        const first = fieldOrder.find((key) => found[key]);
        if (first) {
            document.getElementById(fieldId(first))?.focus();
            return;
        }
        setSaving(true);
        window.setTimeout(() => {
            setSaving(false);
            setLastSaved(values);
            toast.success("Workspace saved", {
                description: values.slug === lastSaved.slug ? "Everyone sees the changes now." : `It now lives at app.example.com/${values.slug}.`,
            });
        }, 800);
    }

    return (
        <div className="form-sections">
            <form className="form-sections__inner" noValidate onSubmit={submit} aria-labelledby={fieldId("title")}>
                <header className="form-sections__header">
                    <h1 id={fieldId("title")} className="form-sections__title">
                        Workspace
                    </h1>
                    <p className="form-sections__lead">
                        What everyone in {lastSaved.name} sees, where the invoices go, and how far agents can go on their own.
                    </p>
                </header>

                <Section id={fieldId("general")} title="General" description="How the workspace appears to your team, in emails and in every link to it.">
                    <div className="form-sections__fields">
                        <Field label="Workspace name" error={errors.name}>
                            <Input
                                id={fieldId("name")}
                                value={values.name}
                                onChange={(event) => update("name", event.target.value)}
                                autoComplete="organization"
                            />
                        </Field>
                        <Field label="Workspace address" hint="Changing it breaks links people have saved." error={errors.slug}>
                            <Input
                                id={fieldId("slug")}
                                value={values.slug}
                                onChange={(event) => update("slug", event.target.value.toLowerCase())}
                                startContent="app.example.com/"
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </Field>
                        <Field label="Time zone" hint="Deploy windows and the morning digest follow it.">
                            <Select value={values.timeZone} onChange={(value) => update("timeZone", value)} options={timeZones} />
                        </Field>
                    </div>
                </Section>

                <Section id={fieldId("billing")} title="Billing" description="Who gets the invoices, and what's printed on them. Only admins see this.">
                    <div className="form-sections__fields">
                        <Field label="Billing email" hint="Invoices and payment receipts go here, not to you." error={errors.billingEmail}>
                            <Input
                                id={fieldId("billingEmail")}
                                type="email"
                                value={values.billingEmail}
                                onChange={(event) => update("billingEmail", event.target.value)}
                                autoComplete="email"
                            />
                        </Field>
                        <Field label="Legal name" error={errors.legalName}>
                            <Input id={fieldId("legalName")} value={values.legalName} onChange={(event) => update("legalName", event.target.value)} />
                        </Field>
                        <div className="form-sections__pair">
                            <Field label="Country">
                                <Select value={values.country} onChange={(value) => update("country", value)} options={countries} />
                            </Field>
                            <Field label="VAT number" hint="Printed on every invoice." error={errors.vat}>
                                <Input
                                    id={fieldId("vat")}
                                    value={values.vat}
                                    onChange={(event) => update("vat", event.target.value)}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </Field>
                        </div>
                    </div>
                </Section>

                <Section
                    id={fieldId("agents")}
                    title="Agents"
                    description="Defaults for agent runs in every project. A project can tighten them, never loosen them."
                >
                    <div className="form-sections__fields">
                        <RadioGroup label="Who can start a run" value={values.whoCanRun} onChange={(value) => update("whoCanRun", value)}>
                            <Radio value="members" description="Guests can watch runs but not start them.">
                                Members and admins
                            </Radio>
                            <Radio value="admins">Admins only</Radio>
                        </RadioGroup>
                        <Field label="Runs a day" hint="Past the limit, runs wait until midnight in your time zone. Leave it empty for no limit.">
                            <NumberField value={values.runLimit} onChange={(value) => update("runLimit", value)} min={0} max={1000} step={10} />
                        </Field>
                        <Checkbox
                            checked={values.reviewBeforeMerge}
                            onChange={(event) => update("reviewBeforeMerge", event.target.checked)}
                            description="An agent can't merge its own pull request, even when every check passes."
                        >
                            Ask a person to review before merging
                        </Checkbox>
                    </div>
                </Section>

                <div className="form-sections__actions">
                    <p className="form-sections__status" aria-live="polite">
                        {dirty ? "You have unsaved changes." : "Everything is saved."}
                    </p>
                    <Button type="button" disabled={!dirty || saving} onClick={discard}>
                        Discard
                    </Button>
                    <Button type="submit" variant="primary" disabled={!dirty} loading={saving}>
                        Save changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
