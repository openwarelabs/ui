import { Avatar, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Avatar",
    category: "Data display",
    description:
        "A round picture of a person: their photo, else their initials on the brand colour, else a person icon.",
    source: "components/Avatar/Avatar.tsx",
    notes: [
        "Beside the person's name it's hidden from screen readers. On its own, give it a label.",
        "If the photo fails to load, the initials show instead.",
    ],
    related: ["AvatarGroup", "User"],
};

/** Four sizes, 24, 28, 36 and 48px, or any size in pixels for a profile or a team page. */
export function Sizes() {
    return (
        <Stack direction="row" gap="md" align="center">
            <Avatar name="Alex Silver" size="sm" label="Alex Silver" />
            <Avatar name="Alex Silver" label="Alex Silver" />
            <Avatar name="Alex Silver" size="lg" label="Alex Silver" />
            <Avatar name="Alex Silver" size="xl" label="Alex Silver" />
            <Avatar name="Alex Silver" size={72} label="Alex Silver" />
        </Stack>
    );
}

/** Initials, a photo that fails (initials again) and no name at all. */
export function Fallbacks() {
    return (
        <Stack direction="row" gap="md" align="center">
            <Avatar name="Priya Nair" size="lg" label="Priya Nair" />
            <Avatar name="Sam Okafor" src="data:," size="lg" label="Sam Okafor" />
            <Avatar name="" size="lg" label="Unknown" />
        </Stack>
    );
}
