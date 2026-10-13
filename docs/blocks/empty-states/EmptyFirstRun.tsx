import { useState } from "react";

import { Badge, Button, ChoiceCard, Dialog, EmptyState, Field, Input, Separator, Text, toast } from "@openwarelabs/ui";
import { FileUp, FolderKanban, GitBranch, LayoutTemplate, Plus } from "lucide-react";

import "./EmptyFirstRun.css";

type Way = "blank" | "repository" | "template" | "import";

const ways: Array<{ id: Way; title: string; description: string; icon: typeof GitBranch; source: string; recommended?: boolean }> = [
    {
        id: "repository",
        title: "Connect a repository",
        description: "Its code, branches and history.",
        icon: GitBranch,
        source: "Connected repository",
        recommended: true,
    },
    { id: "template", title: "Start from a template", description: "A site, an API or a mobile app.", icon: LayoutTemplate, source: "From a template" },
    { id: "import", title: "Import issues", description: "From a CSV or another tracker.", icon: FileUp, source: "Imported issues" },
];

const dialogText: Record<Way, { title: string; description: string }> = {
    blank: { title: "Create a project", description: "An empty project. Connect a repository to it whenever you're ready." },
    repository: { title: "Connect a repository", description: "Name the project; you'll pick the repository next." },
    template: { title: "Start from a template", description: "Name the project; you'll pick a template next." },
    import: { title: "Import issues", description: "Name the project; you'll choose the file to import next." },
};

const validName = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function EmptyFirstRun() {
    const [projects, setProjects] = useState<Array<{ name: string; source: string }>>([]);
    const [open, setOpen] = useState(false);
    const [way, setWay] = useState<Way>("blank");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const start = (next: Way) => {
        setWay(next);
        setOpen(true);
        setName("");
        setError("");
    };

    const create = () => {
        const value = name.trim();
        if (!value) return setError("Give the project a name.");
        if (!validName.test(value)) return setError("Use only lowercase letters, numbers and dashes.");
        if (projects.some((project) => project.name === value)) return setError(`There's already a project called ${value}.`);
        const source = ways.find((entry) => entry.id === way)?.source ?? "Blank project";
        setProjects((list) => [...list, { name: value, source }]);
        setOpen(false);
        toast.success(`Created ${value}`, {
            action: { label: "Undo", onClick: () => setProjects((list) => list.filter((project) => project.name !== value)) },
        });
    };

    return (
        <div className="empty-first-run">
            <main className="empty-first-run__panel">
                <div className="empty-first-run__header">
                    <div>
                        <Text variant="heading" as="h2">
                            Projects
                        </Text>
                        <Text variant="copy" className="empty-first-run__subtitle">
                            Each project holds a repository's tasks, agent runs, reviews and deploys.
                        </Text>
                    </div>
                    {projects.length > 0 ? (
                        <Button variant="primary" startIcon={<Plus size={16} />} onClick={() => start("blank")}>
                            New project
                        </Button>
                    ) : null}
                </div>

                {projects.length === 0 ? (
                    <div className="empty-first-run__area">
                        <EmptyState
                            icon={<FolderKanban size={20} />}
                            title="No projects yet"
                            description="Create a project for each thing your team ships. Agents, reviews and deploys all start from one."
                            actions={
                                <Button variant="primary" startIcon={<Plus size={16} />} onClick={() => start("blank")}>
                                    Create project
                                </Button>
                            }
                        />
                        <div className="empty-first-run__ways">
                            <Separator label="or start another way" spacing="2xl" />
                            <div className="empty-first-run__choices">
                                {ways.map((entry) => (
                                    <ChoiceCard
                                        key={entry.id}
                                        icon={<entry.icon size={20} />}
                                        title={entry.title}
                                        description={entry.description}
                                        recommended={entry.recommended}
                                        onClick={() => start(entry.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <ul className="empty-first-run__list" aria-label="Projects">
                        {projects.map((project) => (
                            <li key={project.name} className="empty-first-run__row">
                                <span className="empty-first-run__dot" aria-hidden="true" />
                                <span className="empty-first-run__name">
                                    <Text variant="label" truncate>
                                        {project.name}
                                    </Text>
                                    <Text variant="caption">{project.source}</Text>
                                </span>
                                <Text variant="caption" className="empty-first-run__when">
                                    Created just now
                                </Text>
                                <Badge size="sm" variant="active">
                                    New
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title={dialogText[way].title}
                description={dialogText[way].description}
                onSubmit={create}
                actions={
                    <>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">
                            {way === "blank" ? "Create project" : "Continue"}
                        </Button>
                    </>
                }
            >
                <Field label="Project name" hint={error ? undefined : "Lowercase letters, numbers and dashes."} error={error || undefined}>
                    <Input
                        autoFocus
                        placeholder="billing-api"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            if (error) setError("");
                        }}
                    />
                </Field>
            </Dialog>
        </div>
    );
}
