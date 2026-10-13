import { useId, useState, type FormEvent } from "react";

import { Button, Checkbox, Field, Input, Link, Radio, RadioGroup, Select, Text, Textarea, toast } from "@openwarelabs/ui";
import { ArrowLeft, GitBranch } from "lucide-react";

import "./FormSingle.css";

const repositories = [
    { value: "acme/billing-worker", label: "acme/billing-worker", description: "Updated 2 hours ago" },
    { value: "acme/status-page", label: "acme/status-page", description: "Updated yesterday" },
    { value: "acme/data-pipeline", label: "acme/data-pipeline", description: "Updated 4 days ago" },
    { value: "acme/cli", label: "acme/cli", description: "Updated 3 weeks ago" },
];

// Names already in use in the workspace.
const takenNames = ["marketing-site", "billing-api", "mobile-app", "docs", "design-system"];

const descriptionLimit = 200;

interface Values {
    name: string;
    repository: string;
    branch: string;
    description: string;
    visibility: string;
    agents: boolean;
}

type Errors = Partial<Record<"name" | "repository" | "branch" | "description", string>>;

// The order fields appear in, so the first wrong one gets focus.
const fieldOrder = ["name", "repository", "branch", "description"] as const;

const emptyValues: Values = { name: "", repository: "", branch: "main", description: "", visibility: "workspace", agents: true };

function validate(values: Values): Errors {
    const errors: Errors = {};
    const name = values.name.trim();
    if (!name) errors.name = "Give the project a name.";
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) errors.name = "Use lowercase letters, numbers and single dashes, like billing-worker.";
    else if (takenNames.includes(name)) errors.name = `There's already a project called ${name}.`;
    if (!values.repository) errors.repository = "Choose the repository Acme deploys from.";
    if (!values.branch.trim()) errors.branch = "Name the branch that deploys to production.";
    if (values.description.length > descriptionLimit) {
        errors.description = `Keep it to ${descriptionLimit} characters; it's ${values.description.length} now.`;
    }
    return errors;
}

export function FormSingle() {
    const id = useId();
    const [values, setValues] = useState<Values>(emptyValues);
    const [errors, setErrors] = useState<Errors>({});
    const [saving, setSaving] = useState(false);

    const fieldId = (name: string) => `${id}-${name}`;

    function update<K extends keyof Values>(key: K, value: Values[K]) {
        setValues((current) => ({ ...current, [key]: value }));
        // An error goes once the person starts fixing it; it comes back, if it must, on the next submit.
        if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
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
            toast.success(`Created ${values.name.trim()}`, { description: `Its first deploy starts when you push to ${values.branch.trim()}.` });
            setValues(emptyValues);
        }, 900);
    }

    return (
        <div className="form-single">
            <div className="form-single__inner">
                <Link href="#" variant="standalone" className="form-single__back">
                    <ArrowLeft size={15} aria-hidden="true" />
                    Projects
                </Link>
                <header className="form-single__header">
                    <Text variant="heading" as="h1" id={fieldId("title")}>
                        New project
                    </Text>
                    <Text variant="copy" className="form-single__lead">
                        A project deploys one repository. Its agents, reviews and deploys all live inside it.
                    </Text>
                </header>

                <form className="form-single__card" noValidate onSubmit={submit} aria-labelledby={fieldId("title")}>
                    <div className="form-single__fields">
                        <Field label="Project name" hint="Lowercase letters, numbers and dashes. It appears in every deploy URL." error={errors.name}>
                            <Input
                                id={fieldId("name")}
                                value={values.name}
                                onChange={(event) => update("name", event.target.value)}
                                placeholder="billing-worker"
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </Field>

                        <Field label="Repository" hint="Only repositories the Acme app can see on GitHub are listed." error={errors.repository}>
                            <Select
                                id={fieldId("repository")}
                                value={values.repository}
                                onChange={(value) => update("repository", value)}
                                options={repositories}
                                placeholder="Choose a repository"
                            />
                        </Field>

                        <Field label="Production branch" hint="Pushes here deploy to production. Every other branch gets a preview." error={errors.branch}>
                            <Input
                                id={fieldId("branch")}
                                value={values.branch}
                                onChange={(event) => update("branch", event.target.value)}
                                startContent={<GitBranch size={16} />}
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </Field>

                        <Field
                            label={
                                <>
                                    Description{" "}
                                    <Text variant="caption" className="form-single__optional">
                                        Optional
                                    </Text>
                                </>
                            }
                            hint={`Shown on the project's card, and given to agents as context. ${values.description.length} of ${descriptionLimit}.`}
                            error={errors.description}
                        >
                            <Textarea
                                id={fieldId("description")}
                                value={values.description}
                                onChange={(event) => update("description", event.target.value)}
                                placeholder="Sends invoices and payment reminders for the billing API."
                                rows={3}
                            />
                        </Field>

                        <RadioGroup label="Who can see it" value={values.visibility} onChange={(value) => update("visibility", value)}>
                            <Radio value="workspace" description="All 8 members of Acme can open it and review its changes.">
                                Everyone in Acme
                            </Radio>
                            <Radio value="private" description="Admins still see it in billing and the audit log.">
                                Only people you add
                            </Radio>
                        </RadioGroup>

                        <Checkbox
                            checked={values.agents}
                            onChange={(event) => update("agents", event.target.checked)}
                            description="They push branches and open pull requests. Nothing merges until a person approves it."
                        >
                            Let agents open pull requests
                        </Checkbox>
                    </div>

                    <div className="form-single__footer">
                        <Text variant="caption" as="p" className="form-single__note">
                            You can change all of this later in the project's settings.
                        </Text>
                        <Button type="submit" variant="primary" loading={saving}>
                            Create project
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
