import { Avatar, AvatarGroup, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "AvatarGroup",
    category: "Data display",
    description: "A row of overlapping avatars, with a +3 for the rest.",
    source: "components/Avatar/AvatarGroup.tsx",
    imports: ["AvatarGroup", "Avatar"],
    notes: [
        "The group reads out as one image: “Alex Silver, Aoife O'Sullivan and 3 others”, or your label.",
    ],
    related: ["Avatar", "User"],
};

const team = [
    "Alex Silver",
    "Aoife O'Sullivan",
    "Seán McCarthy",
    "Orla MacNamara",
    "Declan Walsh",
    "Clodagh Nolan",
    "Tadhg O'Donovan",
];

/** Up to four, then a count. */
export function Basic() {
    return (
        <AvatarGroup>
            {team.map((name) => (
                <Avatar key={name} name={name} />
            ))}
        </AvatarGroup>
    );
}

/** Sizes, and a different limit. */
export function Sizes() {
    return (
        <Stack gap="md" align="start">
            <AvatarGroup size="sm" max={3}>
                {team.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>
            <AvatarGroup size="lg" max={5}>
                {team.map((name) => (
                    <Avatar key={name} name={name} />
                ))}
            </AvatarGroup>
        </Stack>
    );
}
