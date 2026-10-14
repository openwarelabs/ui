import { useEffect, useId, useState, type ReactNode } from "react";

import { Kbd, Text } from "@openwarelabs/ui";
import { BookOpen, Clock, LayoutGrid, Package, Palette, Ruler, Search, SunMoon, Type, type LucideIcon } from "lucide-react";

import { blockCategories, blockGroups, blockVariantCount } from "./blocks";
import { guides, hrefOf, listedComponents, type Route } from "./content";
import { MiniSketch } from "./MiniSketch";
import { categories, type ComponentDoc } from "./types";
import { version } from "./version";

export type SectionName = "docs" | "components" | "blocks";

export const sectionOf = (route: Route): SectionName =>
    route.kind === "blocks" || route.kind === "block-category" ? "blocks" : route.kind === "components" || route.kind === "component" ? "components" : "docs";

/** Names longer than this ("ToggleButtonGroup") don't fit half the sidebar, so they take a whole row; a new dot counts as two letters. */
const longName = 16;

/** "0.3.1" → "0.3": patch releases don't make a component old. */
const minor = (release: string) => release.split(".").slice(0, 2).join(".");

/** New while the release line that added it is the current one: Text, added in 0.3.0, is new through 0.3.x. */
const isNew = (doc: ComponentDoc) => doc.meta.since !== undefined && minor(doc.meta.since) === minor(version);

// The components you opened last, newest first, remembered in this browser only.
const recentKey = "ow-docs-recent";

function readRecent(): string[] {
    try {
        const stored = JSON.parse(localStorage.getItem(recentKey) ?? "[]");
        return Array.isArray(stored) ? stored.filter((slug): slug is string => typeof slug === "string") : [];
    } catch {
        return [];
    }
}

/** Remembers each component page as it opens; returns the last three, leaving out the page you're on. */
function useRecentComponents(route: Route): ComponentDoc[] {
    const [recent, setRecent] = useState(readRecent);
    const current = route.kind === "component" ? route.doc.slug : null;
    useEffect(() => {
        if (!current) return;
        const next = [current, ...readRecent().filter((slug) => slug !== current)].slice(0, 4);
        setRecent(next);
        try {
            localStorage.setItem(recentKey, JSON.stringify(next));
        } catch {
            // Private windows and blocked storage: the list just doesn't persist.
        }
    }, [current]);
    return recent
        .filter((slug) => slug !== current)
        .flatMap((slug) => listedComponents.filter((doc) => doc.slug === slug))
        .slice(0, 3);
}

function SearchButton({ label, onSearch }: { label: string; onSearch: () => void }) {
    return (
        <button type="button" className="docs-side-search" onClick={onSearch}>
            <Search size={15} aria-hidden="true" />
            <span className="docs-side-search__label">{label}</span>
            {/* "/" opens search too; the header's button shows ⌘K. */}
            <Kbd aria-hidden="true">/</Kbd>
        </button>
    );
}

/** A group: its name in small capitals with a count, over its links. */
function Group({ title, count, columns = 1, children }: { title: string; count?: number; columns?: 1 | 2; children: ReactNode }) {
    const id = useId();
    return (
        <div className="docs-side-group">
            <Text variant="overline" as="div" id={id} className="docs-side-heading">
                {title}
                {count !== undefined ? <span className="docs-side-heading__count">{count}</span> : null}
            </Text>
            <ul className={columns === 2 ? "docs-side-list docs-side-list--two" : "docs-side-list"} aria-labelledby={id}>
                {children}
            </ul>
        </div>
    );
}

function SideLink({
    href,
    current,
    onNavigate,
    title,
    start,
    end,
    wide = false,
    children,
}: {
    href: string;
    current: boolean;
    onNavigate?: () => void;
    title?: string;
    start?: ReactNode;
    end?: ReactNode;
    /** Takes both columns of a two-column list. */
    wide?: boolean;
    children: ReactNode;
}) {
    return (
        <li className={wide ? "docs-side-list__wide" : undefined}>
            <a className="docs-side-link" href={href} aria-current={current ? "page" : undefined} onClick={onNavigate} title={title}>
                {start}
                <span className="docs-side-link__label">{children}</span>
                {end}
            </a>
        </li>
    );
}

const NewDot = () => (
    <>
        <span className="docs-side-new" aria-hidden="true" />
        <span className="ow-visually-hidden">, new</span>
    </>
);

function ComponentsSidebar({ route, onNavigate, onSearch }: SidebarProps) {
    const recent = useRecentComponents(route);
    const isCurrent = (doc: ComponentDoc) => route.kind === "component" && route.doc === doc;
    return (
        <>
            <SearchButton label="Search components…" onSearch={onSearch} />
            {recent.length ? (
                <Group title="Recent">
                    {recent.map((doc) => (
                        <SideLink
                            key={doc.slug}
                            href={hrefOf.component(doc.slug)}
                            current={false}
                            onNavigate={onNavigate}
                            start={<Clock size={15} className="docs-side-link__icon" aria-hidden="true" />}
                            end={<span className="docs-side-link__hint">{doc.meta.category}</span>}
                        >
                            {doc.meta.title}
                            {isNew(doc) ? <NewDot /> : null}
                        </SideLink>
                    ))}
                </Group>
            ) : null}
            <ul className="docs-side-list">
                <SideLink
                    href={hrefOf.components()}
                    current={route.kind === "components"}
                    onNavigate={onNavigate}
                    start={<LayoutGrid size={15} className="docs-side-link__icon" aria-hidden="true" />}
                    end={<span className="docs-side-link__hint">{listedComponents.length}</span>}
                >
                    All components
                </SideLink>
            </ul>
            {categories.map((category) => {
                const docs = listedComponents.filter((doc) => doc.meta.category === category);
                if (!docs.length) return null;
                return (
                    <Group key={category} title={category} count={docs.length} columns={2}>
                        {docs.map((doc) => (
                            <SideLink
                                key={doc.slug}
                                href={hrefOf.component(doc.slug)}
                                current={isCurrent(doc)}
                                onNavigate={onNavigate}
                                title={doc.meta.title}
                                wide={doc.meta.title.length + (isNew(doc) ? 2 : 0) > longName}
                            >
                                {doc.meta.title}
                                {isNew(doc) ? <NewDot /> : null}
                            </SideLink>
                        ))}
                    </Group>
                );
            })}
        </>
    );
}

function BlocksSidebar({ route, onNavigate, onSearch }: SidebarProps) {
    return (
        <>
            <SearchButton label="Search blocks…" onSearch={onSearch} />
            <ul className="docs-side-list">
                <SideLink
                    href={hrefOf.blocks()}
                    current={route.kind === "blocks"}
                    onNavigate={onNavigate}
                    start={
                        <span className="docs-side-tile" aria-hidden="true">
                            <LayoutGrid size={15} />
                        </span>
                    }
                    end={<span className="docs-side-count">{blockVariantCount}</span>}
                >
                    All blocks
                </SideLink>
            </ul>
            {/* One heading per kind of block, however many kinds there are. */}
            {blockGroups.map((group) => {
                const inGroup = blockCategories.filter((category) => category.group === group.name);
                const blocks = inGroup.reduce((sum, category) => sum + category.variants.length, 0);
                return (
                    <Group key={group.name} title={group.name} count={blocks}>
                        {inGroup.map((category) => {
                            const current = route.kind === "block-category" && route.category === category;
                            return (
                                <SideLink
                                    key={category.slug}
                                    href={hrefOf.blocks(category.slug)}
                                    current={current}
                                    onNavigate={onNavigate}
                                    start={<MiniSketch kind={category.sketch} current={current} />}
                                    end={
                                        <span className="docs-side-count">
                                            {category.variants.length}
                                            <span className="ow-visually-hidden"> blocks</span>
                                        </span>
                                    }
                                >
                                    {category.title}
                                </SideLink>
                            );
                        })}
                    </Group>
                );
            })}
        </>
    );
}

const guideIcons: Record<(typeof guides)[number]["slug"], LucideIcon> = {
    introduction: BookOpen,
    installation: Package,
    theming: SunMoon,
    colours: Palette,
    typography: Type,
    tokens: Ruler,
};

function GuidesSidebar({ route, onNavigate, onSearch }: SidebarProps) {
    return (
        <>
            <SearchButton label="Search the docs…" onSearch={onSearch} />
            <Group title="Getting started">
                {guides.map((guide) => {
                    const Icon = guideIcons[guide.slug];
                    return (
                        <SideLink
                            key={guide.slug}
                            href={hrefOf.guide(guide.slug)}
                            current={route.kind === "guide" && route.slug === guide.slug}
                            onNavigate={onNavigate}
                            start={<Icon size={15} className="docs-side-link__icon" aria-hidden="true" />}
                        >
                            {guide.title}
                        </SideLink>
                    );
                })}
            </Group>
        </>
    );
}

interface SidebarProps {
    route: Route;
    /** Called when a link is followed, to close the phone drawer. */
    onNavigate?: () => void;
    /** Opens the command palette. */
    onSearch: () => void;
}

const sectionLinks: Array<{ name: SectionName; label: string; href: string }> = [
    { name: "docs", label: "Docs", href: hrefOf.guide("introduction") },
    { name: "components", label: "Components", href: hrefOf.components() },
    { name: "blocks", label: "Blocks", href: hrefOf.blocks() },
];

/** The part of the docs the page is in: the guides, the components or the blocks. On phones it starts with the three sections. */
export function Sidebar({ showSections = false, ...props }: SidebarProps & { showSections?: boolean }) {
    const section = sectionOf(props.route);
    return (
        <nav className="docs-side" aria-label={section === "blocks" ? "Blocks" : section === "components" ? "Components" : "Docs"}>
            {showSections ? (
                <Group title="Sections">
                    {sectionLinks.map((entry) => (
                        <SideLink
                            key={entry.name}
                            href={entry.href}
                            current={section === entry.name && props.route.kind !== "missing"}
                            onNavigate={props.onNavigate}
                        >
                            {entry.label}
                        </SideLink>
                    ))}
                </Group>
            ) : null}
            {section === "blocks" ? <BlocksSidebar {...props} /> : section === "components" ? <ComponentsSidebar {...props} /> : <GuidesSidebar {...props} />}
        </nav>
    );
}

export { sectionLinks };
