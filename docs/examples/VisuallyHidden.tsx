import { Button, VisuallyHidden } from "@openwarelabs/ui";
import { Bell } from "lucide-react";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "VisuallyHidden",
    category: "Layout",
    description:
        "Text that screen readers read but nobody sees, for context the layout already makes obvious.",
    source: "components/Layout/Layout.tsx",
    notes: [
        "Prefer a visible label where there's room. Hidden text is for what the eye gets from the layout.",
        "For an icon button, aria-label does the same job with less markup.",
    ],
    related: ["Button", "Tooltip"],
};

/** Extra words on a badge count, read out but not shown. */
export function Basic() {
    return (
        <Button startIcon={<Bell size={16} />}>
            3<VisuallyHidden> unread notifications</VisuallyHidden>
        </Button>
    );
}
