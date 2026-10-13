import { Button, EmptyState } from "@openwarelabs/ui";
import { FolderPlus, SearchX } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "EmptyState",
    category: "Data display",
    description:
        "What a list, table or panel shows when there's nothing in it yet, and the way to add the first thing.",
    source: "components/EmptyState/EmptyState.tsx",
    notes: [
        "The title says what's missing (“No projects yet”), the description what to do about it.",
        "When a search finds nothing, say what was searched and offer a way back.",
    ],
    related: ["Table", "Alert"],
};

/** A first-run empty state with an action. */
export function FirstRun() {
    return (
        <EmptyState
            icon={<FolderPlus size={20} />}
            title="No projects yet"
            description="Open a folder or start from an idea. The agents take it from there."
            actions={
                <>
                    <Button variant="primary">New project</Button>
                    <Button>Open folder</Button>
                </>
            }
        />
    );
}

/** bordered draws a dashed outline, for an empty area inside a page. */
export function NoResults() {
    return (
        <div style={{ width: 440, maxWidth: "100%" }}>
            <EmptyState
                bordered
                icon={<SearchX size={20} />}
                title="Nothing matches “stripe”"
                description="Check the spelling, or search all projects."
                actions={<Button size="sm">Clear search</Button>}
            />
        </div>
    );
}
