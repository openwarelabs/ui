import { useState } from "react";

import { Stack, Tag, TagGroup } from "@openwarelabs/ui";
import { Hash } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Tag",
    category: "Data display",
    description: "A label on something: a topic, a filter, a chosen value. Tags can be removed.",
    source: "components/Tag/Tag.tsx",
    imports: ["Tag", "TagGroup"],
    props: ["TagProps", "TagGroupProps"],
    keyboard: [["Backspace or Delete", "On a focused tag's remove button, removes it."]],
    notes: [
        "Each remove button says what it removes (“Remove react”).",
        "For a status, use a Badge. Tags are things people add and take away.",
    ],
    related: ["Badge", "Combobox", "Chip"],
};

/** Removable tags in a group. */
export function Removable() {
    const [tags, setTags] = useState(["react", "typescript", "design-system", "accessibility"]);
    return (
        <TagGroup label="Topics" style={{ maxWidth: 420 }}>
            {tags.map((tag) => (
                <Tag
                    key={tag}
                    icon={<Hash size={12} />}
                    onRemove={() => setTags(tags.filter((other) => other !== tag))}
                >
                    {tag}
                </Tag>
            ))}
            {tags.length === 0 ? (
                <span style={{ color: "var(--ow-text-muted)", fontSize: 13 }}>No topics</span>
            ) : null}
        </TagGroup>
    );
}

/** variant="active" for a filter that's on; sm for dense lists. */
export function Variants() {
    return (
        <Stack gap="md">
            <Stack direction="row" gap="xs" wrap>
                <Tag variant="active">Running</Tag>
                <Tag>Done</Tag>
                <Tag>Failed</Tag>
            </Stack>
            <Stack direction="row" gap="xs" wrap>
                <Tag size="sm">sm</Tag>
                <Tag size="sm" variant="active">
                    sm active
                </Tag>
            </Stack>
        </Stack>
    );
}
