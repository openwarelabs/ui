import { useId, useState } from "react";

import { Form03 } from "@openwarelabs/blocks";
import { Checkbox, CheckboxGroup, Field, Input, Radio, RadioGroup, Select, Textarea, toast } from "@openwarelabs/ui";

import "./FormSteps.css";

// Each step's name in the progress strip, and the heading over its fields.
const steps = [
    { title: "Team", description: "Name and lead", heading: "Name the team" },
    { title: "People", description: "Who to invite", heading: "Invite people" },
    { title: "Access", description: "Projects and agents", heading: "Choose what they work on" },
    { title: "Review", description: "Check and create", heading: "Check and create" },
];

const people = ["Maya Chen", "Tomás Reyes", "Clara Novak", "Jonas Berg", "Aiko Tanaka"];

const roles = [
    { value: "member", label: "Member", description: "Works in the team's projects and reviews changes." },
    { value: "admin", label: "Admin", description: "Also manages the team's people and settings." },
    { value: "guest", label: "Guest", description: "Sees only what they're invited to. Good for contractors." },
];

const projects = [
    { id: "marketing-site", detail: "Live · deployed 4 min ago" },
    { id: "billing-api", detail: "Building · fix/invoice-dates" },
    { id: "mobile-app", detail: "Live · release 2.4" },
    { id: "docs", detail: "Live · deployed yesterday" },
    { id: "design-system", detail: "Live · deployed 3 days ago" },
];

const agentModes = [
    { value: "pull-requests", label: "Open pull requests", description: "Agents push a branch and ask the team for a review." },
    { value: "suggestions", label: "Suggest changes only", description: "Agents comment on reviews but never push code." },
];

interface Values {
    name: string;
    identifier: string;
    lead: string;
    emails: string;
    role: string;
    projects: string[];
    agents: string;
}

type Errors = Partial<Record<"name" | "identifier" | "emails" | "projects", string>>;

const emptyValues: Values = { name: "", identifier: "", lead: "Maya Chen", emails: "", role: "member", projects: [], agents: "pull-requests" };

/** "tomas@example.com, clara@example.com" → ["tomas@example.com", "clara@example.com"] */
function parseEmails(text: string) {
    return [
        ...new Set(
            text
                .split(/[\s,;]+/)
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean),
        ),
    ];
}

/** "Platform tools" → "PLAT" */
function identifierFor(name: string) {
    return name
        .replace(/[^a-z]/gi, "")
        .slice(0, 4)
        .toUpperCase();
}

function validateStep(step: number, values: Values): Errors {
    const errors: Errors = {};
    if (step === 0) {
        if (!values.name.trim()) errors.name = "Give the team a name.";
        if (!/^[A-Z]{2,5}$/.test(values.identifier)) errors.identifier = "Use 2 to 5 capital letters, like PLAT.";
    }
    if (step === 1) {
        const emails = parseEmails(values.emails);
        const wrong = emails.find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
        if (!emails.length) errors.emails = "Add at least one email address. You can invite more people later.";
        else if (wrong) errors.emails = `${wrong} isn't a complete email address.`;
    }
    if (step === 2 && !values.projects.length) errors.projects = "Pick at least one project for the team.";
    return errors;
}

export function FormSteps() {
    const id = useId();
    const [step, setStep] = useState(0);
    const [values, setValues] = useState<Values>(emptyValues);
    const [errors, setErrors] = useState<Errors>({});

    const fieldId = (name: string) => `${id}-${name}`;
    const emails = parseEmails(values.emails);

    function update<K extends keyof Values>(key: K, value: Values[K]) {
        setValues((current) => ({ ...current, [key]: value }));
        if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
    }

    /** Checks the step's fields, says what's wrong and puts focus on the first one. */
    function validate() {
        const found = validateStep(step, values);
        setErrors(found);
        const first = (["name", "identifier", "emails", "projects"] as const).find((key) => found[key]);
        if (first) document.getElementById(fieldId(first))?.focus();
        return !first;
    }

    const role = roles.find((option) => option.value === values.role);
    const agentMode = agentModes.find((option) => option.value === values.agents);

    return (
        <Form03
            title="Create a team"
            description="A team shares projects, a review queue and its own agents."
            steps={[
                {
                    ...steps[0]!,
                    validate,
                    content: (
                        <>
                            <Field label="Team name" error={errors.name}>
                                <Input
                                    id={fieldId("name")}
                                    value={values.name}
                                    onChange={(event) => {
                                        const name = event.target.value;
                                        // Follow the name with the identifier until the person types one of their own.
                                        if (values.identifier === identifierFor(values.name)) update("identifier", identifierFor(name));
                                        update("name", name);
                                    }}
                                    placeholder="Platform"
                                    autoComplete="off"
                                />
                            </Field>
                            <div className="form-steps__pair">
                                <Field label="Identifier" hint={`Starts every issue's ID, like ${values.identifier || "PLAT"}-142.`} error={errors.identifier}>
                                    <Input
                                        id={fieldId("identifier")}
                                        value={values.identifier}
                                        onChange={(event) => update("identifier", event.target.value.toUpperCase())}
                                        maxLength={5}
                                        placeholder="PLAT"
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                </Field>
                                <Field label="Team lead" hint="Gets the review queue's daily summary.">
                                    <Select
                                        value={values.lead}
                                        onChange={(value) => update("lead", value)}
                                        options={people.map((name) => ({ value: name, label: name }))}
                                    />
                                </Field>
                            </div>
                        </>
                    ),
                },
                {
                    ...steps[1]!,
                    validate,
                    content: (
                        <>
                            <Field
                                label="Email addresses"
                                hint={
                                    emails.length
                                        ? `${emails.length} ${emails.length === 1 ? "address" : "addresses"}. People already in Acme join straight away.`
                                        : "Separate them with commas or new lines."
                                }
                                error={errors.emails}
                            >
                                <Textarea
                                    id={fieldId("emails")}
                                    value={values.emails}
                                    onChange={(event) => update("emails", event.target.value)}
                                    placeholder={"tomas@example.com, clara@example.com"}
                                    rows={4}
                                    spellCheck={false}
                                />
                            </Field>
                            <Field label="Role" hint={role?.description}>
                                <Select
                                    value={values.role}
                                    onChange={(value) => update("role", value)}
                                    options={roles.map(({ value, label }) => ({ value, label }))}
                                />
                            </Field>
                        </>
                    ),
                },
                {
                    ...steps[2]!,
                    validate,
                    content: (
                        <>
                            <CheckboxGroup
                                label="Projects"
                                description="The team sees these in its sidebar and gets their reviews."
                                value={values.projects}
                                onChange={(value) => update("projects", value)}
                                error={errors.projects}
                            >
                                {projects.map((project, index) => (
                                    <Checkbox
                                        key={project.id}
                                        id={index === 0 ? fieldId("projects") : undefined}
                                        value={project.id}
                                        description={project.detail}
                                    >
                                        {project.id}
                                    </Checkbox>
                                ))}
                            </CheckboxGroup>
                            <RadioGroup label="The team's agents can" value={values.agents} onChange={(value) => update("agents", value)}>
                                {agentModes.map((mode) => (
                                    <Radio key={mode.value} value={mode.value} description={mode.description}>
                                        {mode.label}
                                    </Radio>
                                ))}
                            </RadioGroup>
                        </>
                    ),
                },
                {
                    ...steps[3]!,
                    review: [
                        { label: "Team", value: `${values.name.trim()} · ${values.identifier} · led by ${values.lead}`, step: 0 },
                        { label: "People", value: `${emails.join(", ")} as ${role?.label.toLowerCase()}s`, step: 1 },
                        { label: "Projects", value: values.projects.join(", "), step: 2 },
                        { label: "Agents", value: agentMode?.label, step: 2 },
                    ],
                },
            ]}
            submitLabel={<>Create team and invite {emails.length}</>}
            onSubmit={async () => {
                await new Promise((resolve) => window.setTimeout(resolve, 900));
                toast.success(`${values.name.trim()} team created`, {
                    description: `Invites went to ${emails.length} ${emails.length === 1 ? "person" : "people"}.`,
                });
                setValues(emptyValues);
            }}
            onStepChange={(next) => {
                // An error goes when the step changes; it comes back, if it must, on the next Continue.
                setErrors({});
                setStep(next);
            }}
        />
    );
}
