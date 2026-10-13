import { Badge, Stack } from "@openwarelabs/ui";
import { Check, Loader, TriangleAlert } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Badge",
    category: "Feedback",
    description: "A pill-shaped status label: one or two words, with an optional icon.",
    source: "components/Badge/Badge.tsx",
    notes: [
        "active is for work in progress, so it isn't confused with warning, which means something needs the person.",
        "It labels; it doesn't act. For something clickable, use a Button or a Tag.",
    ],
    related: ["Tag", "Alert", "Chip"],
};

/** Five meanings. */
export function Variants() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Badge>Draft</Badge>
            <Badge variant="active">Running</Badge>
            <Badge variant="success">Passed</Badge>
            <Badge variant="warning">Needs you</Badge>
            <Badge variant="danger">Failed</Badge>
        </Stack>
    );
}

/** A 12px icon helps scanning a long list. */
export function WithIcons() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Badge variant="active" icon={<Loader size={12} />}>
                Building
            </Badge>
            <Badge variant="success" icon={<Check size={12} />}>
                Deployed
            </Badge>
            <Badge variant="warning" icon={<TriangleAlert size={12} />}>
                3 questions
            </Badge>
        </Stack>
    );
}

/** sm for tables and rows, lg for a headline status. */
export function Sizes() {
    return (
        <Stack direction="row" gap="sm" wrap align="center">
            <Badge size="sm" variant="success">
                Connected
            </Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg" variant="active">
                Live
            </Badge>
        </Stack>
    );
}
