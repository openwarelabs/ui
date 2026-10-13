import { ChoiceCard } from "@openwarelabs/ui";
import { FolderOpen, GitBranch, Sparkles } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ChoiceCard",
    category: "Choices",
    description:
        "A large, card-shaped button for picking between a few ways to start, such as on an empty state.",
    source: "components/ChoiceCard/ChoiceCard.tsx",
    keyboard: [["Enter or Space", "Picks the focused card."]],
    notes: [
        "It's a button: don't put links or other controls inside it.",
        "Mark the one most people should pick as recommended.",
    ],
    related: ["EmptyState", "RadioGroup", "Button"],
};

/** Two to four side by side, in equal columns. */
export function Basic() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                width: 640,
                maxWidth: "100%",
            }}
        >
            <ChoiceCard
                icon={<Sparkles size={20} />}
                title="Start from an idea"
                description="Describe it in a sentence."
                recommended
                shortcut="⌘N"
            />
            <ChoiceCard
                icon={<FolderOpen size={20} />}
                title="Open a folder"
                description="Pick up a project on disk."
                shortcut="⌘O"
            />
            <ChoiceCard
                icon={<GitBranch size={20} />}
                title="Clone a repository"
                description="Bring in code from GitHub."
            />
        </div>
    );
}
Basic.layout = { fill: true };
