import { Stack, User } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "User",
    category: "Data display",
    description: "A person's avatar, name and a line about them, for lists, tables and menus.",
    source: "components/Avatar/AvatarGroup.tsx",
    related: ["Avatar", "Table"],
};

/** Name and email. */
export function Basic() {
    return <User name="Alex Silver" description="alex@openware.dev" />;
}

/** Four sizes; from xl the name and its line grow too. */
export function Sizes() {
    return (
        <Stack gap="lg">
            <User size="sm" name="Alex Silver" />
            <User name="Alex Silver" description="Reviewer" />
            <User size="lg" name="Alex Silver" description="alex@openware.dev" />
            <User size="xl" name="Alex Silver" description="Design engineer, Zürich" />
        </Stack>
    );
}
