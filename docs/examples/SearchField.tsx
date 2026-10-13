import { useState } from "react";

import { SearchField, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "SearchField",
    category: "Forms",
    description:
        "A search box with a magnifier and a clear button that appears once there's something to clear.",
    source: "components/SearchField/SearchField.tsx",
    keyboard: [
        ["Escape", "Clears the text. A second Escape is left to whatever's around it."],
        ["Enter", "Calls onSubmit with the text."],
    ],
    notes: [
        "Its accessible name defaults to “Search”; say what's searched when there are several: “Search projects”.",
    ],
    related: ["Input", "Combobox", "CommandPalette"],
};

const projects = [
    "recipe-app",
    "landing-page",
    "invoice-tool",
    "habit-tracker",
    "portfolio",
    "weather-cli",
];

/** Filters a list as you type. */
export function Filtering() {
    const [query, setQuery] = useState("");
    const results = projects.filter((name) => name.includes(query.toLowerCase()));
    return (
        <Stack gap="md" style={{ width: 320, maxWidth: "100%" }}>
            <SearchField
                aria-label="Search projects"
                placeholder="Search projects"
                value={query}
                onChange={setQuery}
            />
            <div style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>
                {results.length ? results.join(" · ") : `No projects match “${query}”.`}
            </div>
        </Stack>
    );
}
Filtering.layout = { align: "start" as const };

/** sm for toolbars; loading shows a spinner while results come back. */
export function SmallAndLoading() {
    return (
        <Stack direction="row" gap="sm" wrap style={{ width: 460, maxWidth: "100%" }}>
            <SearchField size="sm" placeholder="Filter" />
            <SearchField size="sm" defaultValue="invoices" loading />
        </Stack>
    );
}
