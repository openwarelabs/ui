import { useState, type ComponentType } from "react";

import { List04 } from "@openwarelabs/blocks";
import { copyText, toast, type BadgeVariant } from "@openwarelabs/ui";
import { Archive, BookOpen, Copy, Globe, Palette, Plus, Receipt, SearchX, Smartphone, Star, StarOff, type LucideProps } from "lucide-react";

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
        members: ["Tomás Reyes", "Clara Novak", "Omar Haddad", "Lena Fischer"],
        pinned: true,
    },
    {
        id: "mobile-app",
        icon: Smartphone,
        description: "The iOS and Android app, built from one codebase.",
        status: "Live",
        when: "Release 2.4, 2 h ago",
        members: ["Clara Novak", "Jonas Berg", "Aiko Tanaka", "Sam Okafor", "Maya Chen"],
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
        members: ["Aiko Tanaka", "Maya Chen", "Clara Novak"],
        pinned: false,
    },
];

export function ListCards() {
    const [list, setList] = useState(projects);

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

    return (
        <List04
            title="Projects"
            count={list.length}
            description="Everything Acme builds and deploys. Pinned projects stay in the sidebar."
            primaryAction={{ label: "New project", icon: <Plus size={16} />, onClick: create }}
            items={list.map((project) => {
                const Icon = project.icon;
                return {
                    id: project.id,
                    title: project.id,
                    subtitle: `acme/${project.id}`,
                    icon: <Icon size={17} />,
                    description: project.description,
                    status: { label: project.status, tone: tone[project.status] },
                    meta: project.when,
                    members: project.members,
                    pinned: project.pinned,
                    searchText: [project.id, project.description],
                    menu: [
                        {
                            label: project.pinned ? "Unpin from the sidebar" : "Pin to the sidebar",
                            icon: project.pinned ? <StarOff size={15} /> : <Star size={15} />,
                            onSelect: () => update(project.id, { pinned: !project.pinned }),
                        },
                        {
                            label: "Copy project ID",
                            icon: <Copy size={15} />,
                            onSelect: async () => {
                                const copied = await copyText(project.id);
                                toast(copied ? `Copied “${project.id}”` : "Couldn't copy the project ID");
                            },
                        },
                        { label: "Archive project", icon: <Archive size={15} />, destructive: true, onSelect: () => archive(project), separatorBefore: true },
                    ],
                };
            })}
            emptyIcon={<SearchX size={20} />}
            labels={{
                search: "Find a project",
                emptyTitle: "No projects match",
                emptyDescription: (query) => `Nothing is called “${query}”, and no description mentions it.`,
                noItemsTitle: "No projects yet",
                noItemsDescription: "Create one to start deploying.",
            }}
        />
    );
}
