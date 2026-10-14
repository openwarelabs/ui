import { useEffect, useMemo, useState } from "react";

import { Badge, Button, CommandPalette, Drawer, Kbd, Popover, ScrollShadow, SegmentedControl, Toaster, type Command } from "@openwarelabs/ui";
import { ArrowUpRight, Book, Component, LayoutTemplate, Menu as MenuIcon, Monitor, Moon, Search, Sun } from "lucide-react";

import { blockCategories } from "./blocks";
import { BrandPicker } from "./BrandPicker";
import { ComponentPage, repository } from "./ComponentPage";
import { componentDocs, componentsInBlocks, guides, hrefOf, listedComponents, slugify, type Route } from "./content";
import { useMinWidth, useRoute, useTheme, type ThemeChoice } from "./hooks";
import { RouteProvider } from "./Page";
import { Sidebar, sectionLinks as sections, sectionOf } from "./Sidebar";
import { version } from "./version";
import { BlockCategoryPage, BlocksIndex } from "../pages/Blocks";
import { ComponentsIndex } from "../pages/ComponentsIndex";
import { Colours } from "../pages/Colours";
import { Installation } from "../pages/Installation";
import { AI } from "../pages/AI";
import { Introduction } from "../pages/Introduction";
import { Theming } from "../pages/Theming";
import { Tokens } from "../pages/Tokens";
import { Typography } from "../pages/Typography";

/** One key per page, not per section, so moving between pages animates but jumping to a heading doesn't. */
const pageKey = (route: Route) =>
    route.kind === "component" ? `c-${route.doc.slug}` : route.kind === "guide" ? `g-${route.slug}` : route.kind === "block-category" ? `b-${route.category.slug}` : route.kind;

function Page({ route }: { route: Route }) {
    if (route.kind === "component") return <ComponentPage doc={route.doc} />;
    if (route.kind === "components") return <ComponentsIndex />;
    if (route.kind === "blocks") return <BlocksIndex />;
    if (route.kind === "block-category") return <BlockCategoryPage category={route.category} />;
    if (route.kind === "guide") {
        const pages = { introduction: Introduction, installation: Installation, theming: Theming, colours: Colours, typography: Typography, tokens: Tokens, ai: AI };
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
            ...listedComponents.map((doc) => ({
                id: `component-${doc.slug}`,
                title: doc.meta.title,
                group: "Components",
                hint: doc.meta.category,
                icon: <Component />,
                keywords: `${doc.meta.category} ${doc.meta.description}`,
                run: () => (window.location.hash = hrefOf.component(doc.slug)),
            })),
            ...[...componentsInBlocks].flatMap(([slug, category]) => {
                const doc = componentDocs.find((entry) => entry.slug === slug);
                return doc
                    ? [
                          {
                              id: `component-${slug}`,
                              title: doc.meta.title,
                              group: "Components",
                              hint: `In Blocks: ${category.title}`,
                              icon: <Component />,
                              keywords: doc.meta.description,
                              run: () => (window.location.hash = hrefOf.component(slug)),
                          },
                      ]
                    : [];
            }),
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
                            <Sidebar route={route} onSearch={() => setSearchOpen(true)} />
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
                <Sidebar
                    route={route}
                    onNavigate={() => setNavOpen(false)}
                    onSearch={() => {
                        setNavOpen(false);
                        setSearchOpen(true);
                    }}
                    showSections
                />
            </Drawer>
            <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} commands={commands} placeholder="Search components, blocks, examples and guides…" />
            <Toaster />
        </RouteProvider>
    );
}
