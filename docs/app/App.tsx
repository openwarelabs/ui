import { useEffect, useMemo, useState } from "react";

import { Badge, Button, CommandPalette, Drawer, Kbd, NavItem, NavList, Popover, ScrollShadow, SegmentedControl, Toaster, type Command } from "@openwarelabs/ui";
import { ArrowUpRight, Book, Component, LayoutTemplate, Menu as MenuIcon, Monitor, Moon, Search, Sun } from "lucide-react";

import { blockCategories, blockGroups, blockVariantCount } from "./blocks";
import { BrandPicker } from "./BrandPicker";
import { ComponentPage, repository } from "./ComponentPage";
import { componentDocs, guides, hrefOf, slugify, type Route } from "./content";
import { useMinWidth, useRoute, useTheme, type ThemeChoice } from "./hooks";
import { RouteProvider } from "./Page";
import { categories } from "./types";
import { version } from "./version";
import { BlockCategoryPage, BlocksIndex } from "../pages/Blocks";
import { ComponentsIndex } from "../pages/ComponentsIndex";
import { Colours } from "../pages/Colours";
import { Installation } from "../pages/Installation";
import { Introduction } from "../pages/Introduction";
import { Theming } from "../pages/Theming";
import { Tokens } from "../pages/Tokens";
import { Typography } from "../pages/Typography";

type SectionName = "docs" | "components" | "blocks";

const sectionOf = (route: Route): SectionName =>
    route.kind === "blocks" || route.kind === "block-category" ? "blocks" : route.kind === "components" || route.kind === "component" ? "components" : "docs";

const sections: Array<{ name: SectionName; label: string; href: string }> = [
    { name: "docs", label: "Docs", href: hrefOf.guide("introduction") },
    { name: "components", label: "Components", href: hrefOf.components() },
    { name: "blocks", label: "Blocks", href: hrefOf.blocks() },
];

function BlocksSidebar({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
    return (
        <>
            <NavList label="Blocks overview" heading="Blocks">
                <NavItem href={hrefOf.blocks()} active={route.kind === "blocks"} onClick={onNavigate} end={blockVariantCount}>
                    All blocks
                </NavItem>
            </NavList>
            {blockGroups.map((group) => (
                <NavList key={group.name} label={group.name} heading={group.name}>
                    {blockCategories
                        .filter((category) => category.group === group.name)
                        .map((category) => (
                            <NavItem
                                key={category.slug}
                                href={hrefOf.blocks(category.slug)}
                                active={route.kind === "block-category" && route.category === category}
                                onClick={onNavigate}
                            >
                                {category.title}
                            </NavItem>
                        ))}
                </NavList>
            ))}
        </>
    );
}

/** The guides and components, or the blocks: whichever part of the docs the page is in. */
function Sidebar({ route, onNavigate, showSections = false }: { route: Route; onNavigate?: () => void; showSections?: boolean }) {
    const isGuide = (slug: string) => route.kind === "guide" && route.slug === slug;
    const section = sectionOf(route);
    const switcher = showSections ? (
        <NavList label="Sections" heading="Sections">
            {sections.map((entry) => (
                <NavItem key={entry.name} href={entry.href} active={section === entry.name && route.kind !== "missing"} onClick={onNavigate}>
                    {entry.label}
                </NavItem>
            ))}
        </NavList>
    ) : null;
    if (section === "blocks") {
        return (
            <div className="docs-sidebar">
                {switcher}
                <BlocksSidebar route={route} onNavigate={onNavigate} />
            </div>
        );
    }
    return (
        <div className="docs-sidebar">
            {switcher}
            <NavList label="Getting started" heading="Getting started">
                {guides.map((guide) => (
                    <NavItem key={guide.slug} href={hrefOf.guide(guide.slug)} active={isGuide(guide.slug)} onClick={onNavigate}>
                        {guide.title}
                    </NavItem>
                ))}
            </NavList>
            <NavList label="Components overview" heading="Components">
                <NavItem href={hrefOf.components()} active={route.kind === "components"} onClick={onNavigate} end={componentDocs.length}>
                    All components
                </NavItem>
            </NavList>
            {categories.map((category) => {
                const docs = componentDocs.filter((doc) => doc.meta.category === category);
                if (!docs.length) return null;
                return (
                    <NavList key={category} label={category} heading={category}>
                        {docs.map((doc) => (
                            <NavItem
                                key={doc.slug}
                                href={hrefOf.component(doc.slug)}
                                active={route.kind === "component" && route.doc === doc}
                                onClick={onNavigate}
                            >
                                {doc.meta.title}
                            </NavItem>
                        ))}
                    </NavList>
                );
            })}
        </div>
    );
}

/** One key per page, not per section, so moving between pages animates but jumping to a heading doesn't. */
const pageKey = (route: Route) =>
    route.kind === "component" ? `c-${route.doc.slug}` : route.kind === "guide" ? `g-${route.slug}` : route.kind === "block-category" ? `b-${route.category.slug}` : route.kind;

function Page({ route }: { route: Route }) {
    if (route.kind === "component") return <ComponentPage doc={route.doc} />;
    if (route.kind === "components") return <ComponentsIndex />;
    if (route.kind === "blocks") return <BlocksIndex />;
    if (route.kind === "block-category") return <BlockCategoryPage category={route.category} />;
    if (route.kind === "guide") {
        const pages = { introduction: Introduction, installation: Installation, theming: Theming, colours: Colours, typography: Typography, tokens: Tokens };
        const Guide = pages[route.slug];
        return <Guide />;
    }
    return (
        <div className="docs-page">
            <article className="docs-article">
                <h1 className="docs-title">There's no page here</h1>
                <p className="docs-lead">
                    The address <code>{route.path}</code> doesn't match a page. Search with <Kbd>⌘</Kbd> <Kbd>K</Kbd>, or{" "}
                    <a href="#/">go to the introduction</a>.
                </p>
            </article>
        </div>
    );
}

export function App() {
    const route = useRoute();
    const [theme, setTheme] = useTheme();
    const [searchOpen, setSearchOpen] = useState(false);
    const [navOpen, setNavOpen] = useState(false);
    const wide = useMinWidth(960);
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

    useEffect(() => {
        if (wide) setNavOpen(false);
    }, [wide]);

    // ⌘K, Ctrl+K or / opens search.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const typing = event.target instanceof HTMLElement && event.target.closest("input, textarea, [contenteditable]");
            if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
                event.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const commands = useMemo<Command[]>(
        () => [
            ...guides.map((guide) => ({
                id: `guide-${guide.slug}`,
                title: guide.title,
                group: "Getting started",
                icon: <Book />,
                keywords: guide.description,
                run: () => (window.location.hash = hrefOf.guide(guide.slug)),
            })),
            ...componentDocs.map((doc) => ({
                id: `component-${doc.slug}`,
                title: doc.meta.title,
                group: "Components",
                hint: doc.meta.category,
                icon: <Component />,
                keywords: `${doc.meta.category} ${doc.meta.description}`,
                run: () => (window.location.hash = hrefOf.component(doc.slug)),
            })),
            ...blockCategories.map((category) => ({
                id: `blocks-${category.slug}`,
                title: category.title,
                group: "Blocks",
                hint: category.group,
                icon: <LayoutTemplate />,
                keywords: `${category.group} ${category.description} ${category.variants.map((variant) => variant.name).join(" ")}`,
                run: () => (window.location.hash = hrefOf.blocks(category.slug)),
            })),
            ...blockCategories.flatMap((category) =>
                category.variants.map((variant) => ({
                    id: `block-${category.slug}-${variant.id}`,
                    title: `${category.title}: ${variant.name}`,
                    group: "Blocks",
                    hint: variant.id,
                    keywords: `${category.group} ${variant.description}`,
                    run: () => (window.location.hash = hrefOf.blocks(category.slug, slugify(variant.name))),
                })),
            ),
            ...componentDocs.flatMap((doc) =>
                doc.examples.map((example) => ({
                    id: `example-${doc.slug}-${example.name}`,
                    title: `${doc.meta.title}: ${example.title}`,
                    group: "Examples",
                    keywords: example.description,
                    run: () => (window.location.hash = hrefOf.component(doc.slug, slugify(example.title))),
                })),
            ),
            {
                id: "theme",
                title: "Switch between light and dark",
                group: "Settings",
                icon: <Moon />,
                keywords: "dark light mode theme",
                run: () => {
                    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
                    setTheme(dark ? "light" : "dark");
                },
            },
        ],
        [theme, setTheme],
    );

    return (
        <RouteProvider value={route}>
            <a
                className="docs-skip"
                href="#main"
                onClick={(event) => {
                    event.preventDefault();
                    document.getElementById("main")?.focus();
                }}
            >
                Skip to content
            </a>
            <header className="docs-header">
                <div className="docs-header__start">
                    {!wide ? (
                        <Button variant="ghost" iconOnly aria-label="Open navigation" onClick={() => setNavOpen(true)}>
                            <MenuIcon size={18} />
                        </Button>
                    ) : null}
                    <a className="docs-brand" href="#/">
                        <span className="docs-brand__mark" aria-hidden="true" />
                        Openware UI
                    </a>
                    <Badge size="sm" className="docs-version">
                        v{version}
                    </Badge>
                </div>
                <nav className="docs-header__nav" aria-label="Sections">
                    {sections.map((entry) => (
                        <a key={entry.name} href={entry.href} aria-current={route.kind !== "missing" && sectionOf(route) === entry.name ? "page" : undefined}>
                            {entry.label}
                        </a>
                    ))}
                </nav>
                <div className="docs-header__end">
                    <button type="button" className="docs-search" onClick={() => setSearchOpen(true)} aria-label="Search the docs">
                        <Search size={15} aria-hidden="true" />
                        <span className="docs-search__text">Search</span>
                        <span className="docs-search__keys" aria-hidden="true">
                            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
                            <Kbd>K</Kbd>
                        </span>
                    </button>
                    <Popover
                        title="Theme colour"
                        placement="bottom-end"
                        width={272}
                        trigger={
                            <Button variant="ghost" iconOnly size="sm" aria-label="Theme colour" className="docs-brand-trigger">
                                <span className="docs-brand-dot" aria-hidden="true" />
                            </Button>
                        }
                    >
                        <BrandPicker compact />
                    </Popover>
                    <SegmentedControl
                        size="sm"
                        aria-label="Theme"
                        value={theme}
                        onChange={(value) => setTheme(value as ThemeChoice)}
                        options={[
                            { value: "light", label: null, icon: <Sun size={15} />, "aria-label": "Light" },
                            { value: "dark", label: null, icon: <Moon size={15} />, "aria-label": "Dark" },
                            { value: "system", label: null, icon: <Monitor size={15} />, "aria-label": "Match the system" },
                        ]}
                    />
                    <a className="docs-github" href={repository} target="_blank" rel="noopener noreferrer">
                        GitHub
                        <ArrowUpRight size={14} aria-hidden="true" />
                        <span className="ow-visually-hidden"> (opens in a new tab)</span>
                    </a>
                </div>
            </header>
            <div className="docs-body">
                {wide ? (
                    <aside className="docs-aside" aria-label="Documentation">
                        <ScrollShadow className="docs-aside__scroll" size={24}>
                            <Sidebar route={route} />
                        </ScrollShadow>
                    </aside>
                ) : null}
                <main id="main" className="docs-panel" tabIndex={-1}>
                    <div key={pageKey(route)} className="docs-transition">
                        <Page route={route} />
                    </div>
                </main>
            </div>
            <Drawer open={navOpen} onClose={() => setNavOpen(false)} side="left" size={300} title="Openware UI">
                <Sidebar route={route} onNavigate={() => setNavOpen(false)} showSections />
            </Drawer>
            <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} commands={commands} placeholder="Search components, blocks, examples and guides…" />
            <Toaster />
        </RouteProvider>
    );
}
