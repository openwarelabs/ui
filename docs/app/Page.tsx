import { createContext, Fragment, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

import { Breadcrumbs, type BreadcrumbItem } from "@openwarelabs/ui";

import { sectionHref, type Route } from "./content";
import { useVisibleSections } from "./hooks";

export interface TocItem {
    id: string;
    label: string;
    /** 2 for a section, 3 for a subsection. */
    level: 2 | 3;
    /** A few muted words after the label: "11 new · 1 fix". */
    hint?: string;
    /** A caption over a run of items, shown where it changes: Releases groups its versions by day. */
    group?: string;
}

const RouteContext = createContext<Route>({ kind: "missing", path: "" });

export const RouteProvider = RouteContext.Provider;
export const useCurrentRoute = () => useContext(RouteContext);

/** A page of the docs: breadcrumbs, title, lead, the content, and the "On this page" list beside it. */
export function DocPage({
    breadcrumbs,
    title,
    description,
    meta,
    toc,
    hero,
    wide = false,
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    /** Leave out when a hero holds the page's h1. */
    title?: ReactNode;
    description?: ReactNode;
    meta?: ReactNode;
    toc: TocItem[];
    /** A banner across the top, above the article and the "On this page" list. */
    hero?: ReactNode;
    /** Gives the article the whole width, with no "On this page" list: for pages of wide previews. */
    wide?: boolean;
    children: ReactNode;
}) {
    const route = useCurrentRoute();
    const section = "section" in route ? route.section : undefined;

    // Go to the section in the address, or to the top on a new page.
    useEffect(() => {
        if (section) {
            const frame = requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ block: "start" }));
            return () => cancelAnimationFrame(frame);
        }
        window.scrollTo({ top: 0 });
        return undefined;
    }, [route, section]);

    return (
        <div className={wide ? "docs-page docs-page--wide" : "docs-page"}>
            {hero ? <div className="docs-page__hero">{hero}</div> : null}
            <article className="docs-article">
                {title ? (
                    <header className="docs-article__header">
                        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
                        <h1 className="docs-title">{title}</h1>
                        {description ? <p className="docs-lead">{description}</p> : null}
                        {meta ? <div className="docs-article__meta">{meta}</div> : null}
                    </header>
                ) : null}
                {children}
            </article>
            {wide ? null : <Toc items={toc} />}
        </div>
    );
}

/** Where the rail runs for each heading depth, and how far its text sits from the left edge. */
const railX = (level: 2 | 3) => (level === 2 ? 8.5 : 20.5);

interface Rail {
    d: string;
    width: number;
    height: number;
    /** Each link's text, top to bottom, in the list's coordinates. */
    spans: Array<[top: number, bottom: number]>;
}

/**
 * Measures the links and draws one path through them: straight down beside each heading, stepping in or out
 * on a diagonal where the depth changes, as in Clerk's docs.
 */
function useRail(listRef: RefObject<HTMLUListElement | null>, items: TocItem[]): Rail | null {
    const [rail, setRail] = useState<Rail | null>(null);
    const key = items.map((item) => `${item.id}:${item.level}:${item.group ?? ""}`).join("|");
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list) return undefined;
        const measure = () => {
            const links = [...list.querySelectorAll<HTMLAnchorElement>(".docs-toc__link")];
            if (links.length === 0 || list.clientHeight === 0) return;
            let d = "";
            let width = 0;
            const spans: Rail["spans"] = [];
            links.forEach((link, index) => {
                const style = getComputedStyle(link);
                const top = link.offsetTop + parseFloat(style.paddingTop);
                const bottom = link.offsetTop + link.offsetHeight - parseFloat(style.paddingBottom);
                const x = railX(items[index]!.level);
                // A new group's caption sits between its links and the last ones, so the line starts again below it.
                const startsGroup = index > 0 && items[index]!.group !== items[index - 1]!.group;
                d += index === 0 ? `M${x} ${top} L${x} ${bottom}` : `${startsGroup ? " M" : " L"}${x} ${top} L${x} ${bottom}`;
                width = Math.max(width, x + 2);
                spans.push([top, bottom]);
            });
            setRail({ d, width, height: list.scrollHeight, spans });
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the key stands for the items.
    }, [listRef, key]);
    return rail;
}

function Toc({ items }: { items: TocItem[] }) {
    const route = useCurrentRoute();
    const listRef = useRef<HTMLUListElement>(null);
    const [first, last] = useVisibleSections(items.map((item) => item.id));
    const rail = useRail(listRef, items);
    if (items.length === 0) return <aside className="docs-toc" aria-hidden="true" />;

    const thumb = rail?.spans[first] && rail.spans[last] ? ({ "--toc-top": `${rail.spans[first]![0]}px`, "--toc-bottom": `${rail.spans[last]![1]}px` } as CSSProperties) : undefined;

    return (
        <aside className="docs-toc" aria-label="On this page">
            <p className="docs-toc__heading">On this page</p>
            <ul ref={listRef} className="docs-toc__list">
                {rail ? (
                    <>
                        <svg className="docs-toc__rail" width={rail.width} height={rail.height} viewBox={`0 0 ${rail.width} ${rail.height}`} aria-hidden="true">
                            <path d={rail.d} />
                        </svg>
                        <svg className="docs-toc__rail docs-toc__rail--thumb" width={rail.width} height={rail.height} viewBox={`0 0 ${rail.width} ${rail.height}`} style={thumb} aria-hidden="true">
                            <path d={rail.d} />
                        </svg>
                    </>
                ) : null}
                {items.map((item, index) => {
                    const visible = index >= first && index <= last;
                    const caption = item.group && item.group !== items[index - 1]?.group ? item.group : undefined;
                    return (
                        <Fragment key={item.id}>
                            {caption ? <li className="docs-toc__group">{caption}</li> : null}
                            <li>
                                <a
                                    href={sectionHref(route, item.id)}
                                    className={`docs-toc__link docs-toc__link--${item.level}${item.hint ? " docs-toc__link--hint" : ""}`}
                                    data-visible={visible || undefined}
                                    aria-current={index === first ? "location" : undefined}
                                >
                                    {item.label}
                                    {item.hint ? <span className="docs-toc__hint">{item.hint}</span> : null}
                                </a>
                            </li>
                        </Fragment>
                    );
                })}
            </ul>
        </aside>
    );
}

/** A titled section with an anchor link beside its heading. */
export function Section({
    id,
    title,
    level = 2,
    description,
    children,
}: {
    id: string;
    title: ReactNode;
    level?: 2 | 3;
    description?: ReactNode;
    children?: ReactNode;
}) {
    const route = useCurrentRoute();
    const Heading = level === 2 ? "h2" : "h3";
    return (
        <section className={`docs-section docs-section--${level}`} aria-labelledby={id}>
            <Heading id={id} className={level === 2 ? "docs-h2" : "docs-h3"}>
                <a href={sectionHref(route, id)} className="docs-anchor" aria-hidden="true" tabIndex={-1}>
                    #
                </a>
                {title}
            </Heading>
            {description ? <p className="docs-text docs-section__description">{description}</p> : null}
            {children}
        </section>
    );
}
