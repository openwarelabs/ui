import { useEffect, useRef, useState, type FormEvent } from "react";

import { Badge, Button, ChoiceCard, Field, Input, Radio, RadioGroup, Steps } from "@openwarelabs/ui";
import { ArrowLeft, Check, FilePlus2, FolderGit2, GitBranch, LayoutTemplate, ShieldCheck } from "lucide-react";

import "./OnboardingChoice.css";

type View = "choose" | "scratch" | "template" | "import" | "done";

const choices = [
    {
        view: "scratch",
        title: "Start from scratch",
        description: "An empty project and a blank board. Add the code when you're ready.",
        icon: FilePlus2,
    },
    {
        view: "template",
        title: "Use a template",
        description: "A board, labels and agent rules set up for a site, an API or docs.",
        icon: LayoutTemplate,
    },
    {
        view: "import",
        title: "Import from GitHub",
        description: "A repository and its open issues, ready for agents to pick up.",
        icon: GitBranch,
        recommended: true,
    },
] as const;

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

const headings: Record<View, { title: string; lead: string }> = {
    choose: {
        title: "How do you want to start?",
        lead: "A project holds the board, the code and the agents that work on it. Start one now; you can add more at any time.",
    },
    scratch: { title: "Name your project", lead: "It's also the name of the repository Acme creates for it." },
    template: { title: "Pick a template", lead: "Each comes with a board, labels and rules for the agents. Change any of it later." },
    import: { title: "Pick a repository", lead: "These are the repositories Acme can see in your GitHub organisation." },
    done: { title: "", lead: "Next, invite the people you work with. Acme is free for teams of up to five." },
};

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
                            <span className="onboarding-choice__repo-name">{repository.name}</span>
                            <span className="onboarding-choice__repo-meta">{repository.meta}</span>
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
    const [view, setView] = useState<View>("choose");
    const [project, setProject] = useState("");
    const title = useRef<HTMLHeadingElement>(null);
    const moved = useRef(false);

    // Each view replaces the last, so move focus to its heading for screen readers and keyboards.
    useEffect(() => {
        if (moved.current) title.current?.focus();
    }, [view]);

    const go = (next: View) => {
        moved.current = true;
        setView(next);
    };
    const create = (name: string) => {
        setProject(name);
        go("done");
    };
    const back = () => go("choose");

    const heading = headings[view];

    return (
        <div className="onboarding-choice">
            <header className="onboarding-choice__top">
                <span className="onboarding-choice__brand">
                    <span className="onboarding-choice__mark" aria-hidden="true" />
                    Acme
                </span>
                <Steps
                    className="onboarding-choice__progress"
                    orientation="horizontal"
                    label="Setup"
                    current={view === "done" ? 2 : 1}
                    items={[{ title: "Workspace" }, { title: "Project" }, { title: "Team" }]}
                />
                <Button className="onboarding-choice__skip" variant="ghost" size="sm">
                    Skip for now
                </Button>
            </header>

            <main className="onboarding-choice__body">
                {view === "done" ? (
                    <span className="onboarding-choice__done-icon" aria-hidden="true">
                        <Check size={22} />
                    </span>
                ) : null}
                <h1 ref={title} tabIndex={-1} className="onboarding-choice__title">
                    {view === "done" ? `${project} is ready` : heading.title}
                </h1>
                <p className="onboarding-choice__lead">{heading.lead}</p>

                <div className="onboarding-choice__content">
                    {view === "choose" ? (
                        <>
                            <div className="onboarding-choice__options">
                                {choices.map((choice) => (
                                    <div key={choice.view} className="onboarding-choice__option">
                                        <ChoiceCard
                                            icon={<choice.icon size={20} />}
                                            title={choice.title}
                                            description={choice.description}
                                            recommended={"recommended" in choice}
                                            aria-describedby={"recommended" in choice ? "onboarding-choice-recommended" : undefined}
                                            onClick={() => go(choice.view)}
                                        />
                                        {"recommended" in choice ? (
                                            <Badge id="onboarding-choice-recommended" className="onboarding-choice__recommended" size="sm" variant="active">
                                                Recommended
                                            </Badge>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            <p className="onboarding-choice__note">
                                <ShieldCheck size={16} aria-hidden="true" />
                                Nothing changes in GitHub until you merge a pull request.
                            </p>
                        </>
                    ) : null}
                    {view === "scratch" ? <ScratchForm onBack={back} onCreate={create} /> : null}
                    {view === "template" ? <TemplateForm onBack={back} onCreate={create} /> : null}
                    {view === "import" ? <ImportList onBack={back} onCreate={create} /> : null}
                    {view === "done" ? (
                        <div className="onboarding-choice__done-actions">
                            <Button variant="primary">Invite your team</Button>
                            <Button variant="ghost" onClick={back}>
                                Start again
                            </Button>
                        </div>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
