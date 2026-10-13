import { Link, Stack, linkClassName } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Link",
    category: "Typography",
    description:
        "A text link in three weights. External links open in a new tab and show an arrow.",
    source: "components/Breadcrumbs/Breadcrumbs.tsx",
    imports: ["Link", "linkClassName"],
    notes: [
        "Use linkClassName() to style a router's own link component the same way.",
        'External links get rel="noreferrer" and say “opens in a new tab” to screen readers.',
    ],
    related: ["Button", "Breadcrumbs"],
};

/** The default link sits in running text. */
export function Default() {
    return (
        <p style={{ margin: 0, maxWidth: 420 }}>
            Read the <Link href="#/installation">installation guide</Link>, or see how it's made on{" "}
            <Link href="https://github.com" external>
                GitHub
            </Link>
            .
        </p>
    );
}

/** Muted for footnotes; standalone for a list of links. */
export function Variants() {
    return (
        <Stack gap="sm">
            <Link variant="standalone" href="#/components/button">
                Button
            </Link>
            <Link variant="standalone" href="#/components/input">
                Input
            </Link>
            <Link variant="muted" href="#/theming">
                Theming notes
            </Link>
        </Stack>
    );
}

/** linkClassName() gives any element the link look, such as a router's link. */
export function WithARouter() {
    return (
        <a className={linkClassName({ variant: "standalone" })} href="#/components">
            All components
        </a>
    );
}
