import { useEffect, useRef, useState, type FormEvent } from "react";

import { Onboarding02 } from "@openwarelabs/blocks";
import { Button, Field, Input, Radio, RadioGroup, Text } from "@openwarelabs/ui";
import { ArrowLeft, FilePlus2, FolderGit2, GitBranch, LayoutTemplate, ShieldCheck } from "lucide-react";

import "./OnboardingChoice.css";

const templates = [
    { id: "marketing-site", title: "Marketing site", description: "Pages, a blog and a preview deploy for every branch." },
    { id: "billing-api", title: "API service", description: "Endpoints, tests and a rule that keeps the reference up to date." },
    { id: "docs", title: "Documentation", description: "Guides and an API reference, with an agent that fixes broken links." },
];

const repositories = [
    { name: "acme/billing-api", meta: "TypeScript · 86 open issues · updated 2 h ago" },
    { name: "acme/marketing-site", meta: "TypeScript · 31 open issues · updated yesterday" },
    { name: "acme/mobile-app", meta: "Swift · 54 open issues · updated 3 days ago" },
    { name: "acme/docs", meta: "MDX · 12 open issues · updated last week" },
];

function ScratchForm({ onBack, onCreate }: { onBack: () => void; onCreate: (name: string) => void }) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const value = name.trim();
        if (!value) setError("Give the project a name.");
        else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)) setError("Use lowercase letters, numbers and single dashes, like billing-api.");
        else onCreate(value);
    };

    return (
        <form className="onboarding-choice__card" onSubmit={submit} noValidate>
            <Field label="Project name" hint={error ? undefined : "Lowercase letters, numbers and dashes."} error={error || undefined}>
                <Input
                    value={name}
                    placeholder="billing-api"
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => {
                        setName(event.target.value);
                        setError("");
                    }}
                />
            </Field>
            <div className="onboarding-choice__actions">
                <Button variant="ghost" startIcon={<ArrowLeft size={16} />} onClick={onBack}>
                    Back
                </Button>
                <Button type="submit" variant="primary">
                    Create project
                </Button>
            </div>
        </form>
    );
}

function TemplateForm({ onBack, onCreate }: { onBack: () => void; onCreate: (name: string) => void }) {
    const [template, setTemplate] = useState("marketing-site");
    return (
        <form
            className="onboarding-choice__card"
            onSubmit={(event) => {
                event.preventDefault();
                onCreate(template);
            }}
        >
            <RadioGroup label="Template" variant="cards" value={template} onChange={setTemplate}>
                {templates.map((option) => (
                    <Radio key={option.id} value={option.id} description={option.description}>
                        {option.title}
                    </Radio>
                ))}
            </RadioGroup>
            <div className="onboarding-choice__actions">
                <Button variant="ghost" startIcon={<ArrowLeft size={16} />} onClick={onBack}>
                    Back
                </Button>
                <Button type="submit" variant="primary">
                    Use template
                </Button>
            </div>
        </form>
    );
}

function ImportList({ onBack, onCreate }: { onBack: () => void; onCreate: (name: string) => void }) {
    const [importing, setImporting] = useState("");
    const timer = useRef(0);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const importRepository = (name: string) => {
        setImporting(name);
        timer.current = window.setTimeout(() => onCreate(name.split("/")[1]!), 900);
    };

    return (
        <div className="onboarding-choice__card">
            <ul className="onboarding-choice__repos" aria-label="Repositories">
                {repositories.map((repository) => (
                    <li key={repository.name} className="onboarding-choice__repo">
                        <span className="onboarding-choice__repo-icon" aria-hidden="true">
                            <FolderGit2 size={16} />
                        </span>
                        <span className="onboarding-choice__repo-text">
                            <Text variant="code" truncate>
                                {repository.name}
                            </Text>
                            <Text variant="caption" truncate>
                                {repository.meta}
                            </Text>
                        </span>
                        <Button
                            size="sm"
                            loading={importing === repository.name}
                            disabled={Boolean(importing) && importing !== repository.name}
                            aria-label={`Import ${repository.name}`}
                            onClick={() => importRepository(repository.name)}
                        >
                            Import
                        </Button>
                    </li>
                ))}
            </ul>
            <div className="onboarding-choice__actions">
                <Button variant="ghost" startIcon={<ArrowLeft size={16} />} disabled={Boolean(importing)} onClick={onBack}>
                    Back
                </Button>
            </div>
        </div>
    );
}

export function OnboardingChoice() {
    return (
        <Onboarding02
            brand={{ name: "Acme", logo: <span className="onboarding-choice__mark" aria-hidden="true" /> }}
            progress={{ steps: ["Workspace", "Project", "Team"], current: 1 }}
            skip={{ label: "Skip for now" }}
            title="How do you want to start?"
            description="A project holds the board, the code and the agents that work on it. Start one now; you can add more at any time."
            choices={[
                {
                    id: "scratch",
                    title: "Start from scratch",
                    description: "An empty project and a blank board. Add the code when you're ready.",
                    icon: <FilePlus2 size={20} />,
                    heading: "Name your project",
                    lead: "It's also the name of the repository Acme creates for it.",
                    render: ({ back, finish }) => <ScratchForm onBack={back} onCreate={finish} />,
                },
                {
                    id: "template",
                    title: "Use a template",
                    description: "A board, labels and agent rules set up for a site, an API or docs.",
                    icon: <LayoutTemplate size={20} />,
                    heading: "Pick a template",
                    lead: "Each comes with a board, labels and rules for the agents. Change any of it later.",
                    render: ({ back, finish }) => <TemplateForm onBack={back} onCreate={finish} />,
                },
                {
                    id: "import",
                    title: "Import from GitHub",
                    description: "A repository and its open issues, ready for agents to pick up.",
                    icon: <GitBranch size={20} />,
                    recommended: true,
                    heading: "Pick a repository",
                    lead: "These are the repositories Acme can see in your GitHub organisation.",
                    render: ({ back, finish }) => <ImportList onBack={back} onCreate={finish} />,
                },
            ]}
            note={
                <>
                    <ShieldCheck size={16} aria-hidden="true" />
                    Nothing changes in GitHub until you merge a pull request.
                </>
            }
            doneDescription="Next, invite the people you work with. Acme is free for teams of up to five."
            doneAction={{ label: "Invite your team" }}
        />
    );
}
