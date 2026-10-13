import { useState } from "react";

import { DotGrid, Link, SearchField, Text, toast } from "@openwarelabs/ui";
import { BookOpen, Bot, FolderKanban, Gauge, Rocket, Settings } from "lucide-react";

import "./ErrorNotFound.css";

const places = [
    { name: "Overview", description: "Your workspace's home", icon: Gauge, keywords: "home dashboard start" },
    { name: "Projects", description: "Every project and its tasks", icon: FolderKanban, keywords: "tasks issues repositories" },
    { name: "Deploys", description: "What's live, building or failed", icon: Rocket, keywords: "releases builds production" },
    { name: "Docs", description: "Guides and the API reference", icon: BookOpen, keywords: "help documentation api guides" },
    { name: "Agent runs", description: "What your agents are doing", icon: Bot, keywords: "agents ai automation" },
    { name: "Settings", description: "Members, billing and API keys", icon: Settings, keywords: "account members billing keys" },
];

export function ErrorNotFound() {
    const [query, setQuery] = useState("");
    const words = query.trim().toLowerCase();
    const matches = places.filter((place) => !words || `${place.name} ${place.description} ${place.keywords}`.toLowerCase().includes(words)).slice(0, 4);

    return (
        <div className="error-not-found">
            <DotGrid fade interactive className="error-not-found__ground">
                <header className="error-not-found__bar">
                    <Link href="#" variant="standalone" className="error-not-found__logo" aria-label="Acme overview">
                        <span className="error-not-found__mark" aria-hidden="true" />
                        <Text variant="card-title" as="span">
                            Acme
                        </Text>
                    </Link>
                    <Link href="#" variant="standalone">
                        Help centre
                    </Link>
                </header>

                <main className="error-not-found__main">
                    <div className="error-not-found__code" role="img" aria-label="Error 404">
                        <span aria-hidden="true">4</span>
                        <span className="error-not-found__zero" aria-hidden="true" />
                        <span aria-hidden="true">4</span>
                    </div>
                    <Text variant="heading" as="h1" className="error-not-found__title">
                        This page isn't here
                    </Text>
                    <Text variant="copy" className="error-not-found__text">
                        The link may be old, or the page may have moved. Search for it, or start again from one of these.
                    </Text>

                    <div className="error-not-found__search">
                        <SearchField
                            aria-label="Search Acme"
                            placeholder="Search projects, deploys and docs"
                            value={query}
                            onChange={setQuery}
                            onSubmit={(text) => text.trim() && toast(`Searching all of Acme for “${text.trim()}”`)}
                        />
                    </div>

                    <ul className="error-not-found__places" aria-label="Places to go">
                        {matches.map(({ name, description, icon: Icon }) => (
                            <li key={name}>
                                <Link href="#" variant="standalone" className="error-not-found__place">
                                    <span className="error-not-found__place-icon" aria-hidden="true">
                                        <Icon size={16} />
                                    </span>
                                    <span className="error-not-found__place-text">
                                        <Text variant="label">{name}</Text>
                                        <Text variant="caption" truncate className="error-not-found__place-description">
                                            {description}
                                        </Text>
                                    </span>
                                </Link>
                            </li>
                        ))}
                        {matches.length === 0 ? (
                            <Text as="li" variant="body" tone="muted" align="center" className="error-not-found__none" role="status">
                                Nothing here matches “{query.trim()}”. Press Enter to search all of Acme.
                            </Text>
                        ) : null}
                    </ul>
                </main>
            </DotGrid>
        </div>
    );
}
