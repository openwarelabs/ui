import { useRef, useState } from "react";

import {
    Button,
    Checkbox,
    CheckboxGroup,
    Field,
    Form,
    FormError,
    Input,
    Radio,
    RadioGroup,
    Select,
    Textarea,
    toast,
    useFormStatus,
    type FormErrors,
} from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Form",
    category: "Inputs",
    description:
        "A form that checks its fields when it's submitted, shows each error under its Field and focuses the first, and calls onSubmit with the values once everything passes.",
    source: "components/Form/Form.tsx",
    imports: ["Form", "FormError", "useFormStatus"],
    props: ["FormProps", "FormStatus"],
    keyboard: [
        [
            "Enter",
            "In a text field, submits the form. If a check fails, focus goes to the first field with an error.",
        ],
        ["Tab", "After the first submit, leaving a field checks it again."],
    ],
    notes: [
        "Form runs the browser's own checks (required, type, minLength, pattern, min, max) and shows them as Field errors, not as the browser's bubbles.",
        "Errors appear on submit, not while someone types. After that, a field is checked again when focus leaves it, and its error goes as soon as it's fixed.",
        "Field shows the Form's error for its control's name. Give it errorMessages to say what's wrong in your words; the browser's message is the fallback.",
        "Select, Combobox, Switch and DatePicker have no input of their own: give their Field a name and it submits the value in a hidden input.",
        "RadioGroup and CheckboxGroup show their own errors: pass them errors[name] from the render function.",
        "While onSubmit's promise is pending the form has aria-busy and ignores another submit. Values are strings, or a string[] when a name repeats.",
    ],
    related: ["Field", "Fieldset", "Input", "Alert"],
    since: "0.4.0",
};

const plans = [
    { value: "free", label: "Free", description: "Up to 3 people and 50 agent runs a month" },
    { value: "team", label: "Team", description: "€12 per person a month, unlimited runs" },
    {
        value: "business",
        label: "Business",
        description: "€24 per person a month, with SSO and audit logs",
    },
];

/** A sign-up form. Submit it empty: the browser's checks run, each message in Acme's words, and focus goes to the first. */
export function SignUp() {
    const [plan, setPlan] = useState("");
    return (
        <Form
            style={{ width: 380, maxWidth: "100%" }}
            validate={(values) =>
                values.plan ? undefined : { plan: "Choose a plan. You can change it later." }
            }
            onSubmit={(values) =>
                toast.success("Account created", {
                    description: `We sent a sign-in link to ${values.email}.`,
                })
            }
        >
            <Field label="Name" errorMessages="Enter your name.">
                <Input name="name" autoComplete="name" required />
            </Field>
            <Field
                label="Work email"
                errorMessages={{
                    valueMissing: "Enter your work email.",
                    typeMismatch: "Enter a whole email address, like maya@acme.dev.",
                }}
            >
                <Input name="email" type="email" autoComplete="email" required />
            </Field>
            <Field
                label="Password"
                hint="At least 12 characters."
                errorMessages={{
                    valueMissing: "Choose a password.",
                    tooShort: "Use at least 12 characters.",
                }}
            >
                <Input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                />
            </Field>
            <Field label="Plan" name="plan">
                <Select
                    value={plan}
                    onChange={setPlan}
                    options={plans}
                    placeholder="Choose a plan"
                />
            </Field>
            <Field errorMessages="Accept the terms to create an account.">
                <Checkbox name="terms" required>
                    I agree to Acme's terms of service
                </Checkbox>
            </Field>
            <Button type="submit" variant="primary" fullWidth>
                Create account
            </Button>
        </Form>
    );
}
SignUp.layout = { align: "start" as const };

/** validate() checks what the browser can't, like two passwords that must match. The error goes once they do, whichever one changes. */
export function MatchingPasswords() {
    return (
        <Form
            style={{ width: 360, maxWidth: "100%" }}
            validate={(values) =>
                values.confirm && values.confirm !== values.password
                    ? { confirm: "The passwords don't match. Type the new one again." }
                    : undefined
            }
            onSubmit={() =>
                toast.success("Password changed", {
                    description: "Your other devices are signed out.",
                })
            }
        >
            <Field
                label="New password"
                hint="At least 12 characters."
                errorMessages={{
                    valueMissing: "Choose a new password.",
                    tooShort: "Use at least 12 characters.",
                }}
            >
                <Input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                />
            </Field>
            <Field label="Type it again" errorMessages="Type the new password again.">
                <Input name="confirm" type="password" autoComplete="new-password" required />
            </Field>
            <Button type="submit" variant="primary">
                Change password
            </Button>
        </Form>
    );
}
MatchingPasswords.layout = { align: "start" as const };

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** validationErrors from the server show under their fields and take focus. Each goes when that field is edited. */
export function ServerErrors() {
    const [serverErrors, setServerErrors] = useState<FormErrors>({});
    return (
        <Form
            style={{ width: 380, maxWidth: "100%" }}
            validationErrors={serverErrors}
            onSubmit={async (values) => {
                await wait(800);
                const errors: FormErrors = {};
                if (values.workspace === "acme")
                    errors.workspace = "That address is taken. Try acme-platform, or another name.";
                if (values.email === "maya@acme.dev") {
                    errors.email =
                        "That email is already in a workspace. Sign in, or use another address.";
                }
                setServerErrors(errors);
                if (!Object.keys(errors).length) toast.success(`Created ${values.workspace}`);
            }}
        >
            {({ isSubmitting }) => (
                <>
                    <Field
                        label="Workspace address"
                        errorMessages="Choose an address for the workspace."
                    >
                        <Input
                            name="workspace"
                            startContent="acme.dev/"
                            defaultValue="acme"
                            required
                        />
                    </Field>
                    <Field label="Your work email" errorMessages="Enter your work email.">
                        <Input name="email" type="email" defaultValue="maya@acme.dev" required />
                    </Field>
                    <Button type="submit" variant="primary" loading={isSubmitting}>
                        Create workspace
                    </Button>
                </>
            )}
        </Form>
    );
}
ServerErrors.layout = { align: "start" as const };

function StartRunButton() {
    const { isSubmitting } = useFormStatus();
    return (
        <Button type="submit" variant="primary" loading={isSubmitting}>
            Start run
        </Button>
    );
}

/** An async onSubmit keeps the form busy and, with useFormStatus(), the button loading. The first try here fails, so FormError says why. */
export function AsyncSubmit() {
    const tries = useRef(0);
    return (
        <Form
            style={{ width: 400, maxWidth: "100%" }}
            onSubmit={async (values) => {
                await wait(1200);
                tries.current += 1;
                if (tries.current === 1) {
                    throw new Error(
                        "Couldn't reach the run queue. Check your connection and start the run again.",
                    );
                }
                toast.success("Run started", {
                    description: `An agent is working on ${values.branch}.`,
                });
            }}
        >
            <Field label="Task" errorMessages="Say what the agent should do.">
                <Textarea
                    name="task"
                    rows={3}
                    defaultValue="Fix the flaky checkout test and explain the cause."
                    required
                />
            </Field>
            <Field
                label="Branch"
                hint="The agent pushes here and opens a pull request."
                errorMessages={{
                    valueMissing: "Name a branch for the agent's changes.",
                    patternMismatch:
                        "Use lowercase letters, numbers, dashes and slashes, like fix/checkout-test.",
                }}
            >
                <Input
                    name="branch"
                    defaultValue="fix/checkout-test"
                    pattern="[a-z0-9][a-z0-9\/._\-]*"
                    required
                />
            </Field>
            <FormError />
            <StartRunButton />
        </Form>
    );
}
AsyncSubmit.layout = { align: "start" as const };

/** RadioGroup and CheckboxGroup show their own errors: pass each one errors[name] from the render function. */
export function Groups() {
    return (
        <Form
            style={{ width: 380, maxWidth: "100%" }}
            validate={(values) => ({
                events: values.events ? undefined : "Choose at least one, or leave email off.",
                frequency: values.frequency ? undefined : "Choose how often to send them.",
            })}
            onSubmit={(values) =>
                toast.success("Notifications saved", {
                    description:
                        values.frequency === "daily"
                            ? "They arrive at 8:00 each morning."
                            : "They arrive as they happen.",
                })
            }
        >
            {({ errors }) => (
                <>
                    <CheckboxGroup label="Email me when" name="events" error={errors.events}>
                        <Checkbox value="run-finished">An agent finishes a run</Checkbox>
                        <Checkbox value="review">A change needs my review</Checkbox>
                        <Checkbox value="deploy-failed">A deploy fails</Checkbox>
                    </CheckboxGroup>
                    <RadioGroup label="Send them" name="frequency" error={errors.frequency}>
                        <Radio value="instant">As they happen</Radio>
                        <Radio value="daily">In one email each morning</Radio>
                    </RadioGroup>
                    <Button type="submit" variant="primary">
                        Save notifications
                    </Button>
                </>
            )}
        </Form>
    );
}
Groups.layout = { align: "start" as const };
