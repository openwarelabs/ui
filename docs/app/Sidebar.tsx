import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Button, Kbd, ScrollShadow, SearchField, SegmentedControl, Text } from "@openwarelabs/ui";
import {
    Bell,
    BookOpen,
    CalendarDays,
    ChevronRight,
    Compass,
    History,
    Layers,
    LayoutGrid,
    LayoutPanelLeft,
    Megaphone,
    MousePointerClick,
    Package,
    Palette,
    Ruler,
    Search,
    Shapes,
    Sparkles,
    SquareCheck,
    SunMoon,
    Table2,
    TextCursorInput,
    Type,
    type LucideIcon,
} from "lucide-react";

import { blockCategories, blockGroups, blockVariantCount } from "./blocks";
import { guides, hrefOf, listedComponents, showBlocks, type Route } from "./content";
import { MiniSketch } from "./MiniSketch";
import { categories, type Category, type ComponentDoc } from "./types";
import { version } from "./version";

export type SectionName = "docs" | "components" | "blocks";

export const sectionOf = (route: Route): SectionName =>
    route.kind === "blocks" || route.kind === "block-category" ? "blocks" : route.kind === "components" || route.kind === "component" ? "components" : "docs";

/** "0.3.1" → "0.3": patch releases don't make a component old. */
const minor = (release: string) => release.split(".").slice(0, 2).join(".");

/** New while the release line that added it is the current one: Text, added in 0.3.0, is new through 0.3.x. */
const isNew = (doc: ComponentDoc) => doc.meta.since !== undefined && minor(doc.meta.since) === minor(version);

const newComponents = listedComponents.filter(isNew);

/** Read a remembered choice from this browser, or the fallback when there's none or storage is blocked. */
function readStored<T>(key: string, parse: (stored: unknown) => T | undefined, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : (parse(JSON.parse(raw)) ?? fallback);
    } catch {
        return fallback;
    }
}

function writeStored(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Private windows and blocked storage: the choice lasts until reload.
    }
}

/** The component filter carries this attribute, so the "/" shortcut can find it. */
const filterAttribute = "data-docs-filter";

/** Focuses the components filter when it's on screen, for the "/" shortcut. Returns false when there's none, so search opens instead. */
export function focusComponentFilter(): boolean {
    const field = document.querySelector<HTMLInputElement>(`[${filterAttribute}]`);
    if (!field || !field.getClientRects().length) return false;
    field.focus();
    field.select();
    return true;
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
function Group({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
    const id = useId();
    return (
        <div className="docs-side-group">
            <Text variant="overline" as="div" id={id} className="docs-side-heading">
                {title}
                {count !== undefined ? <span className="docs-side-heading__count">{count}</span> : null}
            </Text>
            <ul className="docs-side-list" aria-labelledby={id}>
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
    children,
}: {
    href: string;
    current: boolean;
    onNavigate?: () => void;
    title?: string;
    start?: ReactNode;
    end?: ReactNode;
    children: ReactNode;
}) {
    return (
        <li>
            <a className="docs-side-link" href={href} aria-current={current ? "page" : undefined} onClick={onNavigate} title={title}>
                {start}
                <span className="docs-side-link__label">{children}</span>
                {end}
            </a>
        </li>
    );
}

/** Brass marks what's new in this release. */
const NewPill = ({ children = "New" }: { children?: ReactNode }) => <span className="docs-side-new">{children}</span>;

/** The part of a name that matches the filter, marked. */
function Highlight({ text, needle }: { text: string; needle: string }) {
    const at = needle ? text.toLowerCase().indexOf(needle) : -1;
    if (at < 0) return <>{text}</>;
    return (
        <>
            {text.slice(0, at)}
            <mark className="docs-side-mark">{text.slice(at, at + needle.length)}</mark>
            {text.slice(at + needle.length)}
        </>
    );
}

function ComponentLink({
    doc,
    route,
    needle,
    hint,
    showNew = true,
    onNavigate,
}: {
    doc: ComponentDoc;
    route: Route;
    needle: string;
    hint?: string;
    showNew?: boolean;
    onNavigate?: () => void;
}) {
    return (
        <SideLink
            href={hrefOf.component(doc.slug)}
            current={route.kind === "component" && route.doc === doc}
            onNavigate={onNavigate}
            title={doc.meta.title}
            end={hint ? <span className="docs-side-link__hint">{hint}</span> : undefined}
        >
            <span className="docs-side-link__text">
                <Highlight text={doc.meta.title} needle={needle} />
            </span>
            {showNew && isNew(doc) ? <NewPill /> : null}
        </SideLink>
    );
}

const categoryIcons: Record<Category, LucideIcon> = {
    Primitives: Shapes,
    Typography: Type,
    Actions: MousePointerClick,
    Inputs: TextCursorInput,
    Choices: SquareCheck,
    Pickers: CalendarDays,
    Feedback: Bell,
    Overlays: Layers,
    Navigation: Compass,
    "Data display": Table2,
    Layout: LayoutPanelLeft,
    AI: Sparkles,
    Marketing: Megaphone,
};

type ComponentView = "category" | "az" | "new";

const viewOptions = [
    { value: "category", label: "By category" },
    { value: "az", label: "A–Z" },
    ...(newComponents.length ? [{ value: "new", label: `New · ${newComponents.length}` }] : []),
];

const isView = (value: unknown): value is ComponentView => value === "category" || value === "az" || (value === "new" && newComponents.length > 0);
const isCategory = (value: unknown): value is Category => (categories as readonly unknown[]).includes(value);

// Remembered in this browser only: which categories are open, and how the list is shown.
const openKey = "ow-docs-open-categories";
const viewKey = "ow-docs-component-view";

const byTitle = (a: ComponentDoc, b: ComponentDoc) => a.meta.title.localeCompare(b.meta.title);

/** A–Z: the components under the first letter of their names. */
function byLetter(docs: ComponentDoc[]) {
    const letters: Array<{ name: string; docs: ComponentDoc[] }> = [];
    for (const doc of [...docs].sort(byTitle)) {
        const letter = doc.meta.title.charAt(0).toUpperCase();
        const last = letters[letters.length - 1];
        if (last?.name === letter) last.docs.push(doc);
        else letters.push({ name: letter, docs: [doc] });
    }
    return letters;
}

/**
 * The components: a filter, a switch between categories, A–Z and what's new, then the list. By category, each
 * category folds away under its name, and the one you're reading in opens by itself.
 */
function ComponentsSidebar({ route, onNavigate, onSearch, frame }: SectionProps) {
    const baseId = useId();
    const listRef = useRef<HTMLDivElement>(null);
    const here = route.kind === "component" ? route.doc.meta.category : undefined;

    const [query, setQuery] = useState("");
    const [view, setView] = useState<ComponentView>(() => readStored(viewKey, (stored) => (isView(stored) ? stored : undefined), "category"));
    const [open, setOpen] = useState<Category[]>(() => {
        const stored = readStored(openKey, (value) => (Array.isArray(value) ? value.filter(isCategory) : undefined), [] as Category[]);
        return here && !stored.includes(here) ? [...stored, here] : stored;
    });
    // Categories closed while filtering, so a filter can't overwrite which ones you keep open.
    const [shut, setShut] = useState<Category[]>([]);

    // Opening a page in another category opens that category, wherever the link was.
    const [seenHere, setSeenHere] = useState(here);
    if (here !== seenHere) {
        setSeenHere(here);
        if (here && !open.includes(here)) setOpen([...open, here]);
    }

    useEffect(() => writeStored(openKey, open), [open]);

    const needle = query.trim().toLowerCase();
    const filtering = needle.length > 0;
    const matches = (doc: ComponentDoc) => !filtering || doc.meta.title.toLowerCase().includes(needle);
    const pool = view === "new" ? newComponents : listedComponents;

    // What the list shows, in the order it shows it.
    const groups: Array<{ name: string; docs: ComponentDoc[] }> =
        view === "category"
            ? categories.map((category) => ({ name: category, docs: listedComponents.filter((doc) => doc.meta.category === category && matches(doc)) }))
            : view === "az"
              ? byLetter(listedComponents.filter(matches))
              : [{ name: `New in ${minor(version)}`, docs: newComponents.filter(matches).sort(byTitle) }];
    const shown = groups.flatMap((group) => group.docs);
    const first = shown[0];
    const status = filtering ? `${shown.length} of ${pool.length} match “${query.trim()}”` : "";

    const go = (doc: ComponentDoc) => {
        window.location.hash = hrefOf.component(doc.slug);
        onNavigate?.();
    };

    const changeView = (next: string) => {
        if (!isView(next)) return;
        setView(next);
        writeStored(viewKey, next);
    };

    const allOpen = categories.every((category) => open.includes(category));
    const toggle = (category: Category, expanded: boolean) => {
        if (filtering) setShut(expanded ? [...shut, category] : shut.filter((entry) => entry !== category));
        else setOpen(expanded ? open.filter((entry) => entry !== category) : [...open, category]);
    };

    const head = (
        <>
            <div className="docs-side-filter">
                <SearchField
                    size="sm"
                    {...{ [filterAttribute]: "" }}
                    value={query}
                    onChange={(value) => {
                        setQuery(value);
                        setShut([]);
                    }}
                    onSubmit={() => (first ? go(first) : undefined)}
                    onKeyDown={(event) => {
                        // Down moves from the field into the list.
                        if (event.key !== "ArrowDown") return;
                        const link = listRef.current?.querySelector<HTMLAnchorElement>("ul:not([hidden]) > li > a");
                        if (!link) return;
                        event.preventDefault();
                        link.focus();
                    }}
                    placeholder={`Filter ${listedComponents.length} components`}
                    aria-label="Filter components"
                    aria-controls={`${baseId}-list`}
                    autoComplete="off"
                    spellCheck={false}
                />
                {query ? null : (
                    <Kbd className="docs-side-filter__key" aria-hidden="true">
                        /
                    </Kbd>
                )}
            </div>
            <SegmentedControl size="sm" fullWidth aria-label="List components" value={view} onChange={changeView} options={viewOptions} />
            <p className="ow-visually-hidden" role="status">
                {status}
            </p>
            {filtering ? (
                <div className="docs-side-status" aria-hidden="true">
                    <span className="docs-side-status__text">{status}</span>
                    {first ? (
                        <span className="docs-side-status__keys">
                            <Kbd>↵</Kbd> opens first
                        </span>
                    ) : null}
                </div>
            ) : null}
        </>
    );

    const headingId = `${baseId}-heading`;
    const byCategory = (
        <div className="docs-side-group">
            <div className="docs-side-heading">
                <Text variant="overline" as="span" id={headingId}>
                    {filtering ? "Matching categories" : "Categories"}
                </Text>
                {filtering ? null : (
                    <button type="button" className="docs-side-toggle" onClick={() => setOpen(allOpen ? [] : [...categories])}>
                        {allOpen ? "Collapse all" : "Expand all"}
                    </button>
                )}
            </div>
            <ul className="docs-side-list" aria-labelledby={headingId}>
                {filtering ? null : (
                    <SideLink
                        href={hrefOf.components()}
                        current={route.kind === "components"}
                        onNavigate={onNavigate}
                        start={<LayoutGrid size={15} className="docs-side-link__icon" aria-hidden="true" />}
                        end={
                            <>
                                <span className="docs-side-count">
                                    {listedComponents.length}
                                    <span className="ow-visually-hidden"> components</span>
                                </span>
                                <span className="docs-side-chevron" aria-hidden="true" />
                            </>
                        }
                    >
                        All components
                    </SideLink>
                )}
                {groups.map(({ name, docs }) => {
                    const category = name as Category;
                    if (!docs.length) return null;
                    const Icon = categoryIcons[category];
                    const expanded = filtering ? !shut.includes(category) : open.includes(category);
                    const fresh = docs.filter(isNew).length;
                    const panelId = `${baseId}-${category.toLowerCase().replace(/\s+/g, "-")}`;
                    return (
                        <li key={category}>
                            <button
                                type="button"
                                className={`docs-side-link docs-side-category${here === category ? " docs-side-category--here" : ""}`}
                                aria-expanded={expanded}
                                aria-controls={panelId}
                                onClick={() => toggle(category, expanded)}
                            >
                                <Icon size={15} className="docs-side-link__icon" aria-hidden="true" />
                                <span className="docs-side-link__label">
                                    <span className="docs-side-link__text">{category}</span>
                                    {!filtering && fresh ? <NewPill>{fresh} new</NewPill> : null}
                                </span>
                                <span className="docs-side-count">
                                    {docs.length}
                                    <span className="ow-visually-hidden">{filtering ? " matching components" : " components"}</span>
                                </span>
                                <ChevronRight size={15} className="docs-side-chevron" aria-hidden="true" />
                            </button>
                            <ul id={panelId} className="docs-side-list docs-side-sublist" hidden={!expanded}>
                                {docs.map((doc) => (
                                    <ComponentLink key={doc.slug} doc={doc} route={route} needle={needle} onNavigate={onNavigate} />
                                ))}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    const flat = groups
        .filter((group) => group.docs.length)
        .map((group) => (
            <Group key={group.name} title={group.name} count={group.docs.length}>
                {group.docs.map((doc) => (
                    <ComponentLink
                        key={doc.slug}
                        doc={doc}
                        route={route}
                        needle={needle}
                        hint={doc.meta.category}
                        showNew={view !== "new"}
                        onNavigate={onNavigate}
                    />
                ))}
            </Group>
        ));

    return frame(
        head,
        <div ref={listRef} id={`${baseId}-list`} className="docs-side-results">
            {shown.length ? (view === "category" ? byCategory : flat) : null}
            {filtering && !shown.length ? (
                <div className="docs-side-empty">
                    <p>No components match “{query.trim()}”.</p>
                    <Button size="sm" variant="secondary" onClick={onSearch}>
                        Search the docs instead
                    </Button>
                </div>
            ) : null}
        </div>,
    );
}

function BlocksSidebar({ route, onNavigate, onSearch, frame }: SectionProps) {
    return frame(
        <SearchButton label="Search blocks…" onSearch={onSearch} />,
        <>
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
        </>,
    );
}

const guideIcons: Record<(typeof guides)[number]["slug"], LucideIcon> = {
    introduction: BookOpen,
    installation: Package,
    theming: SunMoon,
    colours: Palette,
    typography: Type,
    tokens: Ruler,
    ai: Sparkles,
    releases: History,
};

function GuidesSidebar({ route, onNavigate, onSearch, frame }: SectionProps) {
    return frame(
        <SearchButton label="Search the docs…" onSearch={onSearch} />,
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
        </Group>,
    );
}

interface SidebarProps {
    route: Route;
    /** Called when a link is followed, to close the phone drawer. */
    onNavigate?: () => void;
    /** Opens the command palette. */
    onSearch: () => void;
}

interface SectionProps extends SidebarProps {
    /** Lays out a section's search or filter and its lists. */
    frame: (head: ReactNode, body: ReactNode) => ReactNode;
}

const allSectionLinks: Array<{ name: SectionName; label: string; href: string }> = [
    { name: "docs", label: "Docs", href: hrefOf.guide("introduction") },
    { name: "components", label: "Components", href: hrefOf.components() },
    { name: "blocks", label: "Blocks", href: hrefOf.blocks() },
];
const sectionLinks = allSectionLinks.filter((entry) => showBlocks || entry.name !== "blocks");

/**
 * The part of the docs the page is in: the guides, the components or the blocks. Beside the page, the lists scroll
 * under a search or filter that stays put; in the phone drawer, which scrolls itself, everything scrolls together
 * and starts with the three sections.
 */
export function Sidebar({ inDrawer = false, ...props }: SidebarProps & { inDrawer?: boolean }) {
    const section = sectionOf(props.route);
    const sections = inDrawer ? (
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
    ) : null;
    const frame = (head: ReactNode, body: ReactNode) =>
        inDrawer ? (
            <div className="docs-side__body">
                {sections}
                <div className="docs-side__head">{head}</div>
                {body}
            </div>
        ) : (
            <>
                <div className="docs-side__head">{head}</div>
                <ScrollShadow className="docs-side__scroll" size={24}>
                    <div className="docs-side__body">{body}</div>
                </ScrollShadow>
            </>
        );
    return (
        <nav
            className={inDrawer ? "docs-side" : "docs-side docs-side--fixed-head"}
            aria-label={section === "blocks" ? "Blocks" : section === "components" ? "Components" : "Docs"}
        >
            {section === "blocks" ? (
                <BlocksSidebar {...props} frame={frame} />
            ) : section === "components" ? (
                <ComponentsSidebar {...props} frame={frame} />
            ) : (
                <GuidesSidebar {...props} frame={frame} />
            )}
        </nav>
    );
}

export { sectionLinks };
