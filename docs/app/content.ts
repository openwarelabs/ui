import type { ComponentType } from "react";

import { pages } from "docs:examples";

import { blockCategories, blockGroups, type BlockCategory } from "./blocks";
import { categories, type ComponentDoc, type ExampleLayout } from "./types";

/** "ButtonGroup" → "button-group". */
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** "With icons" → "with-icons". */
export const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

export const componentDocs: ComponentDoc[] = pages
    .map(({ slug, module, examples }) => ({
        slug: kebab(slug),
        meta: module.meta,
        examples: examples.map((example) => {
            const Component = module[example.name] as ComponentType & { layout?: ExampleLayout };
            return { ...example, Component, layout: Component.layout ?? {} };
        }),
    }))
    .sort((a, b) => categories.indexOf(a.meta.category) - categories.indexOf(b.meta.category) || a.meta.title.localeCompare(b.meta.title));

export const guides = [
    { slug: "introduction", title: "Introduction", description: "What Openware UI is and the ideas behind it." },
    { slug: "installation", title: "Installation", description: "Add the package, the styles and the theme to a project." },
    { slug: "theming", title: "Theming", description: "Light, dark and system themes, and swapping the brand colour." },
    { slug: "colours", title: "Colours", description: "Every colour token, in both themes, with where it's used." },
    { slug: "typography", title: "Typography", description: "Inter and Geist Mono, and the type styles." },
    { slug: "tokens", title: "Spacing and shape", description: "Spacing, corners, shadows, weights and motion." },
] as const;

export type Route =
    | { kind: "guide"; slug: (typeof guides)[number]["slug"]; section?: string }
    | { kind: "components"; section?: string }
    | { kind: "component"; doc: ComponentDoc; section?: string }
    | { kind: "blocks"; section?: string }
    | { kind: "block-category"; category: BlockCategory; section?: string }
    | { kind: "missing"; path: string };

export function resolve(hash: string): Route {
    const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    if (parts.length === 0) return { kind: "guide", slug: "introduction" };
    if (parts[0] === "docs") {
        const guide = guides.find((entry) => entry.slug === parts[1]);
        return guide ? { kind: "guide", slug: guide.slug, section: parts[2] } : { kind: "missing", path: hash };
    }
    if (parts[0] === "components") {
        if (!parts[1]) return { kind: "components", section: undefined };
        const doc = componentDocs.find((entry) => entry.slug === parts[1]);
        return doc ? { kind: "component", doc, section: parts[2] } : { kind: "missing", path: hash };
    }
    if (parts[0] === "blocks") {
        if (!parts[1] || blockGroups.some((group) => slugify(group.name) === parts[1])) return { kind: "blocks", section: parts[1] };
        const category = blockCategories.find((entry) => entry.slug === parts[1]);
        return category ? { kind: "block-category", category, section: parts[2] } : { kind: "missing", path: hash };
    }
    return { kind: "missing", path: hash };
}

export const hrefOf = {
    guide: (slug: string, section?: string) => (slug === "introduction" && !section ? "#/" : `#/docs/${slug}${section ? `/${section}` : ""}`),
    component: (slug: string, section?: string) => `#/components/${slug}${section ? `/${section}` : ""}`,
    components: (section?: string) => `#/components${section ? `/${section}` : ""}`,
    blocks: (slug?: string, section?: string) => `#/blocks${slug ? `/${slug}` : ""}${section ? `/${section}` : ""}`,
};

export function sectionHref(route: Route, section: string) {
    if (route.kind === "guide") return hrefOf.guide(route.slug, section);
    if (route.kind === "component") return hrefOf.component(route.doc.slug, section);
    if (route.kind === "components") return hrefOf.components(section);
    if (route.kind === "blocks") return hrefOf.blocks(section);
    if (route.kind === "block-category") return hrefOf.blocks(route.category.slug, section);
    return `#/${section}`;
}
