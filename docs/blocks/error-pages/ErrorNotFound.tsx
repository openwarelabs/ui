import { ErrorPage01 } from "@openwarelabs/blocks";
import { toast } from "@openwarelabs/ui";
import { BookOpen, Bot, FolderKanban, Gauge, Rocket, Settings } from "lucide-react";

import "./ErrorNotFound.css";

const places = [
    { name: "Overview", description: "Your workspace's home", icon: <Gauge size={16} />, href: "#", keywords: "home dashboard start" },
    { name: "Projects", description: "Every project and its tasks", icon: <FolderKanban size={16} />, href: "#", keywords: "tasks issues repositories" },
    { name: "Deploys", description: "What's live, building or failed", icon: <Rocket size={16} />, href: "#", keywords: "releases builds production" },
    { name: "Docs", description: "Guides and the API reference", icon: <BookOpen size={16} />, href: "#", keywords: "help documentation api guides" },
    { name: "Agent runs", description: "What your agents are doing", icon: <Bot size={16} />, href: "#", keywords: "agents ai automation" },
    { name: "Settings", description: "Members, billing and API keys", icon: <Settings size={16} />, href: "#", keywords: "account members billing keys" },
];

export function ErrorNotFound() {
    return (
        <ErrorPage01
            brand={{ name: "Acme", href: "#", logo: <span className="error-not-found__mark" aria-hidden="true" /> }}
            helpLink={{ label: "Help centre", href: "#" }}
            title="This page isn't here"
            description="The link may be old, or the page may have moved. Search for it, or start again from one of these."
            places={places}
            onSearch={(query) => toast(`Searching all of Acme for “${query}”`)}
            labels={{
                home: "Acme overview",
                search: "Search Acme",
                placeholder: "Search projects, deploys and docs",
                noMatches: (query) => `Nothing here matches “${query}”. Press Enter to search all of Acme.`,
            }}
        />
    );
}
