import { Chip, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Chip",
    category: "Marketing",
    description: "A white pill with a brass dot that names a section, set just above its title.",
    source: "components/Marketing/Marketing.tsx",
    notes: [
        "One to three words. It's decoration for the eye; the heading under it carries the meaning.",
    ],
    related: ["SectionHeading", "Badge", "Tag"],
};

/** Section names. */
export function Basic() {
    return (
        <Stack direction="row" gap="sm" wrap>
            <Chip>How it works</Chip>
            <Chip>Pricing</Chip>
            <Chip>New in 0.2</Chip>
        </Stack>
    );
}
Basic.layout = { ground: "paper" as const };
