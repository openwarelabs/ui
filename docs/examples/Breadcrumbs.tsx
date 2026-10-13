import { Breadcrumbs, Stack } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Breadcrumbs",
    category: "Navigation",
    description:
        "Shows where a page sits, with links back up the way. The last item is the current page.",
    source: "components/Breadcrumbs/Breadcrumbs.tsx",
    imports: ["Breadcrumbs", "type BreadcrumbItem"],
    props: ["BreadcrumbsProps", "BreadcrumbItem"],
    notes: [
        'It\'s a nav with an ordered list; the last item has aria-current="page".',
        "Long labels are cut short with an ellipsis and shown in full on hover.",
    ],
    related: ["Link", "NavList"],
};

/** The chevron separator. */
export function Basic() {
    return (
        <Breadcrumbs
            items={[
                { label: "Projects", href: "#/components/breadcrumbs" },
                { label: "recipe-app", href: "#/components/breadcrumbs" },
                { label: "Settings" },
            ]}
        />
    );
}

/** The slash separator, for file paths and repositories. */
export function Slash() {
    return (
        <Stack gap="md">
            <Breadcrumbs
                separator="slash"
                items={[
                    { label: "openwarelabs", href: "#/components/breadcrumbs" },
                    { label: "ui", href: "#/components/breadcrumbs" },
                    { label: "src", href: "#/components/breadcrumbs" },
                    { label: "Button.tsx" },
                ]}
            />
        </Stack>
    );
}
