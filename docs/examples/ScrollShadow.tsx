import { Card, ScrollShadow, Tag } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ScrollShadow",
    category: "Layout",
    description:
        "A scrolling area whose edges fade out where there's more to scroll, so nothing looks cut off.",
    source: "components/Layout/Layout.tsx",
    notes: [
        "Give it an aria-label and it becomes a focusable region, so keyboard users can scroll it with the arrow keys.",
        "The fade is a mask, so it works on any background.",
    ],
    related: ["Card"],
};

const changes = [
    "Added a dark theme",
    "Dialogs fade and rise in",
    "Menus flip when there's no room below",
    "Tables sort by any column",
    "New: Calendar and DatePicker",
    "New: CommandPalette",
    "Inputs take start and end content",
    "Buttons show a spinner while loading",
    "Tooltips wait 400ms before showing",
    "Focus rings follow the brand colour",
];

/** Vertical: the top fades once you've scrolled. */
export function Vertical() {
    return (
        <Card padding="none" style={{ width: 320, maxWidth: "100%" }}>
            <ScrollShadow maxSize={200} aria-label="Changes">
                <ul
                    style={{
                        margin: 0,
                        padding: "12px 16px 12px 32px",
                        display: "grid",
                        gap: 8,
                        fontSize: 14,
                    }}
                >
                    {changes.map((change) => (
                        <li key={change}>{change}</li>
                    ))}
                </ul>
            </ScrollShadow>
        </Card>
    );
}

/** Horizontal, for a row of tags or tabs. */
export function Horizontal() {
    return (
        <div style={{ width: 340, maxWidth: "100%" }}>
            <ScrollShadow orientation="horizontal" aria-label="Topics">
                <div style={{ display: "flex", gap: 6, width: "max-content", padding: "2px 0" }}>
                    {[
                        "react",
                        "typescript",
                        "design-system",
                        "accessibility",
                        "dark-mode",
                        "tokens",
                        "electron",
                    ].map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                    ))}
                </div>
            </ScrollShadow>
        </div>
    );
}
