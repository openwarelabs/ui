import {
    Button,
    Checkbox,
    DescriptionItem,
    DescriptionList,
    Field,
    Input,
    Radio,
    RadioGroup,
    Textarea,
    toast,
    Wizard,
    type WizardStep,
} from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Wizard",
    category: "Inputs",
    description:
        "A form in pages: a Steps strip over the step in hand, the browser's checks and your own run on Next, and Finish calls onComplete with every step's values. For sign-up, setup and checkout.",
    source: "components/Wizard/Wizard.tsx",
    imports: ["Wizard", "type WizardStep"],
    props: ["WizardProps", "WizardStep", "WizardStepContext", "WizardLabels"],
    keyboard: [
        [
            "Enter",
            "In a text field, submits the step: the same as Next. If a check fails, focus goes to the first field with an error.",
        ],
        ["Tab", "Moves through the step's fields, then Back, Skip and Next."],
    ],
    notes: [
        "Each step is a Form of its own. Next runs the browser's checks (required, type, pattern…), then the step's validate with every step's values so far, which may return a promise; each message shows under its Field, and focus goes to the first.",
        'The strip is a Steps list: the current step has aria-current="step", and done steps are buttons that go back to them. With linear off, every step is.',
        'When a step opens, focus moves to its heading and a live region says "Step 2 of 4: Plan". The heading\'s level is headingLevel (2 by default).',
        "Back keeps what was typed without checking it. Give each field defaultValue={values.name} (RadioGroup and CheckboxGroup take errors[name] too) so a step shows its values again when someone comes back to it.",
        "Finish returns onComplete's promise to the Form: the button shows loading, and a rejection's message appears above the buttons.",
        "persist saves the step and values in sessionStorage under the key you give, so a reload comes back to the same place; it's cleared once the Wizard completes.",
    ],
    related: ["Steps", "Form", "Field"],
    since: "0.18.0",
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const planNames: Record<string, string> = {
    free: "Free",
    team: "Team, €12 per person a month",
    business: "Business, €24 per person a month",
};

const signUpSteps: WizardStep[] = [
    {
        id: "details",
        title: "Your details",
        description: "Who the account is for.",
        validate: async (values) => {
            // A check on the server: here, one address is already taken.
            await wait(600);
            if (values.email === "aoife@example.com") {
                return {
                    email: "That email is already in a workspace. Sign in, or use another address.",
                };
            }
        },
        render: ({ values }) => (
            <>
                <Field label="Name" errorMessages="Enter your name.">
                    <Input name="name" autoComplete="name" defaultValue={values.name} required />
                </Field>
                <Field
                    label="Work email"
                    hint="Try aoife@example.com to see a check from the server."
                    errorMessages={{
                        valueMissing: "Enter your work email.",
                        typeMismatch: "Enter a whole email address, like aoife@acme.dev.",
                    }}
                >
                    <Input
                        name="email"
                        type="email"
                        autoComplete="email"
                        defaultValue={values.email}
                        required
                    />
                </Field>
            </>
        ),
    },
    {
        id: "plan",
        title: "Choose a plan",
        description: "You can change it later.",
        validate: (values) => (values.plan ? undefined : { plan: "Choose a plan to go on." }),
        render: ({ values, errors }) => (
            <RadioGroup
                label="Plan"
                name="plan"
                variant="cards"
                defaultValue={typeof values.plan === "string" ? values.plan : ""}
                error={errors.plan}
            >
                <Radio value="free" description="Up to 3 people and 50 agent runs a month.">
                    Free
                </Radio>
                <Radio value="team" description="€12 per person a month, unlimited runs.">
                    Team
                </Radio>
                <Radio
                    value="business"
                    description="€24 per person a month, with SSO and audit logs."
                >
                    Business
                </Radio>
            </RadioGroup>
        ),
    },
    {
        id: "confirm",
        title: "Check and finish",
        description: "Everything you told us, in one place.",
        render: ({ values, goTo }) => (
            <>
                <DescriptionList divided>
                    <DescriptionItem term="Name">{values.name}</DescriptionItem>
                    <DescriptionItem term="Work email">{values.email}</DescriptionItem>
                    <DescriptionItem
                        term="Plan"
                        action={
                            <Button variant="ghost" size="sm" onClick={() => goTo(1)}>
                                Change plan
                            </Button>
                        }
                    >
                        {planNames[String(values.plan)] ?? "None"}
                    </DescriptionItem>
                </DescriptionList>
                <Field errorMessages="Accept the terms to create the account.">
                    <Checkbox name="terms" defaultChecked={values.terms === "on"} required>
                        I agree to Acme's terms of service
                    </Checkbox>
                </Field>
            </>
        ),
    },
];

/** A three-step sign-up. The first step's check runs on a "server", the second needs a plan, and the last sums it all up before Finish. */
export function SignUp() {
    return (
        <Wizard
            label="Create an account"
            steps={signUpSteps}
            onComplete={async (values) => {
                await wait(800);
                toast.success("Account created", {
                    description: `We sent a sign-in link to ${values.email}.`,
                });
            }}
        />
    );
}
SignUp.layout = { align: "start" as const, fill: true };

const setupSteps: WizardStep[] = [
    {
        id: "project",
        title: "Name the project",
        description: "What the agents will work on.",
        render: ({ values }) => (
            <>
                <Field
                    label="Project name"
                    hint="Letters, numbers and dashes."
                    errorMessages={{
                        valueMissing: "Name the project.",
                        patternMismatch:
                            "Use lowercase letters, numbers and dashes, like recipe-app.",
                    }}
                >
                    <Input
                        name="project"
                        defaultValue={values.project ?? "recipe-app"}
                        pattern="[a-z0-9][a-z0-9-]*"
                        required
                    />
                </Field>
                <Field
                    label="What it does"
                    errorMessages="Say what the project does, in a line or two."
                >
                    <Textarea name="summary" rows={3} defaultValue={values.summary} required />
                </Field>
            </>
        ),
    },
    {
        id: "repository",
        title: "Connect a repository",
        description: "Where the agents push their changes.",
        validate: (values) =>
            typeof values.repository === "string" && values.repository.includes("/")
                ? undefined
                : { repository: "Give the owner and the name, like openware/recipe-app." },
        render: ({ values }) => (
            <Field
                label="Repository"
                hint="owner/name on GitHub."
                errorMessages="Enter the repository."
            >
                <Input
                    name="repository"
                    startContent="github.com/"
                    defaultValue={values.repository}
                    required
                />
            </Field>
        ),
    },
    {
        id: "review",
        title: "Review",
        description: "Check the setup before the first run.",
        render: ({ values }) => (
            <DescriptionList layout="vertical">
                <DescriptionItem term="Project">{values.project}</DescriptionItem>
                <DescriptionItem term="Summary">{values.summary}</DescriptionItem>
                <DescriptionItem term="Repository">github.com/{values.repository}</DescriptionItem>
            </DescriptionList>
        ),
    },
];

/** The list of steps beside the form. Below 640px it moves above. */
export function Vertical() {
    return (
        <Wizard
            orientation="vertical"
            label="Set up a project"
            steps={setupSteps}
            labels={{ finish: "Start the first run" }}
            onComplete={(values) =>
                toast.success(`Set up ${String(values.project)}`, {
                    description: "The first run starts now.",
                })
            }
        />
    );
}
Vertical.layout = { align: "start" as const, fill: true };

const inviteSteps: WizardStep[] = [
    {
        id: "workspace",
        title: "Name the workspace",
        description: "Usually your company's.",
        render: ({ values }) => (
            <Field label="Workspace name" errorMessages="Name the workspace.">
                <Input name="workspace" defaultValue={values.workspace} required />
            </Field>
        ),
    },
    {
        id: "team",
        title: "Invite your team",
        description: "Add people now, or do it later from Settings.",
        optional: true,
        validate: (values) => {
            const list = typeof values.invites === "string" ? values.invites : "";
            const bad = list
                .split(/[\s,]+/)
                .filter(Boolean)
                .find((address) => !address.includes("@"));
            return bad ? { invites: `"${bad}" isn't an email address.` } : undefined;
        },
        render: ({ values }) => (
            <Field label="Email addresses" hint="One per line, or separated by commas.">
                <Textarea
                    name="invites"
                    rows={3}
                    defaultValue={values.invites}
                    placeholder={"cian@acme.dev\nniamh@acme.dev"}
                />
            </Field>
        ),
    },
    {
        id: "done",
        title: "All set",
        description: "What happens next.",
        render: ({ values }) => {
            const invites =
                typeof values.invites === "string"
                    ? values.invites.split(/[\s,]+/).filter(Boolean)
                    : [];
            return (
                <DescriptionList>
                    <DescriptionItem term="Workspace">{values.workspace}</DescriptionItem>
                    <DescriptionItem term="Invitations">
                        {invites.length ? `${invites.length} to send` : "None yet"}
                    </DescriptionItem>
                </DescriptionList>
            );
        },
    },
];

/** An optional step has a Skip button beside Next, and says so in the strip. The values typed in it are kept either way. */
export function OptionalStep() {
    return (
        <Wizard
            label="Create a workspace"
            steps={inviteSteps}
            onComplete={(values) => toast.success(`Created ${String(values.workspace)}`)}
        />
    );
}
OptionalStep.layout = { align: "start" as const, fill: true };
