import { useState, type ComponentType } from "react";

import {
    Avatar,
    AvatarGroup,
    Badge,
    Button,
    EmptyState,
    Menu,
    MenuItem,
    MenuSeparator,
    SearchField,
    copyText,
    toast,
    type BadgeVariant,
} from "@openwarelabs/ui";
import { Archive, BookOpen, Copy, Ellipsis, Globe, Palette, Plus, Receipt, SearchX, Smartphone, Star, StarOff, type LucideProps } from "lucide-react";

import "./ListCards.css";

type Status = "Live" | "Building" | "Failed";

interface Project {
    id: string;
    icon: ComponentType<LucideProps>;
    description: string;
    status: Status;
    when: string;
    members: string[];
    pinned: boolean;
}

const tone: Record<Status, BadgeVariant> = { Live: "success", Building: "active", Failed: "danger" };

const projects: Project[] = [
    {
        id: "marketing-site",
        icon: Globe,
        description: "The public site: the home page, pricing and the blog.",
        status: "Live",
        when: "Deployed 4 min ago",
        members: ["Maya Chen", "Sam Okafor", "Aiko Tanaka", "Lena Fischer", "Omar Haddad", "Jonas Berg"],
        pinned: true,
    },
    {
        id: "billing-api",
        icon: Receipt,
        description: "Invoices, payments and the EU tax rules behind them.",
        status: "Building",
        when: "Building fix/invoice-dates",
        members: ["Tomás Reyes", "Priya Nair", "Omar Haddad", "Lena Fischer"],
        pinned: true,
    },
    {
        id: "mobile-app",
        icon: Smartphone,
        description: "The iOS and Android app, built from one codebase.",
        status: "Live",
        when: "Release 2.4, 2 h ago",
        members: ["Priya Nair", "Jonas Berg", "Aiko Tanaka", "Sam Okafor", "Maya Chen"],
        pinned: true,
    },
    {
        id: "docs",
        icon: BookOpen,
        description: "Guides, tutorials and the API reference.",
        status: "Failed",
        when: "Failed yesterday",
        members: ["Jonas Berg", "Lena Fischer", "Maya Chen"],
        pinned: false,
    },
    {
        id: "design-system",
        icon: Palette,
        description: "The components and tokens every Acme app shares.",
        status: "Live",
        when: "Deployed 3 h ago",
        members: ["Aiko Tanaka", "Maya Chen", "Priya Nair"],
        pinned: false,
    },
];

export function ListCards() {
    const [list, setList] = useState(projects);
    const [query, setQuery] = useState("");

    const update = (id: string, change: Partial<Project>) =>
        setList((current) => current.map((project) => (project.id === id ? { ...project, ...change } : project)));

    const archive = (project: Project) => {
        const before = list;
        setList((current) => current.filter((entry) => entry.id !== project.id));
        toast(`${project.id} is archived`, {
            description: "It stops deploying. Find it under Archived projects.",
            action: { label: "Undo", onClick: () => setList(before) },
        });
    };

    const create = () => {
        const count = list.filter((project) => project.id.startsWith("new-project")).length;
        const id = count ? `new-project-${count + 1}` : "new-project";
        setList((current) => [
            ...current,
            {
                id,
                icon: Plus,
                description: "A blank project. Connect a repository to deploy it.",
                status: "Building",
                when: "Setting up",
                members: ["Maya Chen"],
                pinned: false,
            },
        ]);
        toast.success(`Created ${id}`, { description: "Connect a repository and the first deploy starts on its own." });
    };

    const text = query.trim().toLowerCase();
    const shown = list.filter((project) => !text || project.id.includes(text) || project.description.toLowerCase().includes(text));

    return (
        <section className="list-cards" aria-labelledby="list-cards-title">
            <div className="list-cards__inner">
                <div className="list-cards__header">
                    <div>
                        <h2 id="list-cards-title" className="list-cards__title">
                            Projects<span className="list-cards__count">{list.length}</span>
                        </h2>
                        <p className="list-cards__lead">Everything Acme builds and deploys. Pinned projects stay in the sidebar.</p>
                    </div>
                    <div className="list-cards__tools">
                        <SearchField
                            className="list-cards__search"
                            size="sm"
                            placeholder="Find a project"
                            aria-label="Find a project"
                            value={query}
                            onChange={setQuery}
                        />
                        <Button variant="primary" size="sm" startIcon={<Plus size={16} />} onClick={create}>
                            New project
                        </Button>
                    </div>
                </div>

                {shown.length ? (
                    <ul className="list-cards__grid">
                        {shown.map((project) => {
                            const Icon = project.icon;
                            return (
                                <li key={project.id}>
                                    <article className="list-cards__card" aria-labelledby={`list-cards-${project.id}`}>
                                        <div className="list-cards__top">
                                            <span className="list-cards__tile" aria-hidden="true">
                                                <Icon size={17} />
                                            </span>
                                            <div className="list-cards__names">
                                                <h3 id={`list-cards-${project.id}`} className="list-cards__name">
                                                    <span>{project.id}</span>
                                                    {project.pinned ? <Star size={13} className="list-cards__star" aria-label="Pinned" /> : null}
                                                </h3>
                                                <span className="list-cards__repo">acme/{project.id}</span>
                                            </div>
                                            <Menu
                                                label={`${project.id} actions`}
                                                align="end"
                                                trigger={
                                                    <Button variant="ghost" size="sm" iconOnly aria-label={`Actions for ${project.id}`}>
                                                        <Ellipsis size={16} />
                                                    </Button>
                                                }
                                            >
                                                <MenuItem
                                                    icon={project.pinned ? <StarOff size={15} /> : <Star size={15} />}
                                                    onSelect={() => update(project.id, { pinned: !project.pinned })}
                                                >
                                                    {project.pinned ? "Unpin from the sidebar" : "Pin to the sidebar"}
                                                </MenuItem>
                                                <MenuItem
                                                    icon={<Copy size={15} />}
                                                    onSelect={async () => {
                                                        const copied = await copyText(project.id);
                                                        toast(copied ? `Copied “${project.id}”` : "Couldn't copy the project ID");
                                                    }}
                                                >
                                                    Copy project ID
                                                </MenuItem>
                                                <MenuSeparator />
                                                <MenuItem icon={<Archive size={15} />} destructive onSelect={() => archive(project)}>
                                                    Archive project
                                                </MenuItem>
                                            </Menu>
                                        </div>

                                        <p className="list-cards__description">{project.description}</p>

                                        <div className="list-cards__foot">
                                            <Badge size="sm" variant={tone[project.status]}>
                                                {project.status}
                                            </Badge>
                                            <span className="list-cards__when">{project.when}</span>
                                            <AvatarGroup size="sm" max={3} label={`${project.members.length} people on ${project.id}`}>
                                                {project.members.map((name) => (
                                                    <Avatar key={name} name={name} label={name} />
                                                ))}
                                            </AvatarGroup>
                                        </div>
                                    </article>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <EmptyState
                        bordered
                        icon={<SearchX size={20} />}
                        title={list.length ? "No projects match" : "No projects yet"}
                        description={list.length ? `Nothing is called “${query.trim()}”, and no description mentions it.` : "Create one to start deploying."}
                        actions={list.length ? <Button onClick={() => setQuery("")}>Clear search</Button> : undefined}
                    />
                )}
            </div>
        </section>
    );
}
