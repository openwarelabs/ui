import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { useIndicator } from "@/hooks/useIndicator";
import { cx } from "@/utils/cx";
import type { TableOfContentsProps, TocItem } from "./TableOfContents.types";

export type { TableOfContentsProps, TocItem } from "./TableOfContents.types";

/** Reads the headings under `root` that have an id into a tree, by their levels. */
function readHeadings(root: HTMLElement, selector: string, maxLevel?: number): TocItem[] {
    const tree: TocItem[] = [];
    const stack: Array<{ level: number; children: TocItem[] }> = [{ level: 0, children: tree }];
    for (const heading of root.querySelectorAll<HTMLElement>(selector)) {
        if (!heading.id) continue;
        const level = Number(heading.tagName.slice(1)) || 2;
        if (maxLevel !== undefined && level > maxLevel) continue;
        let parent = stack[stack.length - 1]!;
        while (stack.length > 1 && parent.level >= level) {
            stack.pop();
            parent = stack[stack.length - 1]!;
        }
        const children: TocItem[] = [];
        parent.children.push({ id: heading.id, title: heading.textContent?.trim() || heading.id, level, children });
        stack.push({ level, children });
    }
    return tree;
}

/** Drops the items deeper than `maxLevel`, giving each its level when it has none. */
function prune(items: TocItem[], maxLevel: number | undefined, parentLevel: number): TocItem[] {
    const kept: TocItem[] = [];
    for (const item of items) {
        const level = item.level ?? parentLevel + 1;
        if (maxLevel !== undefined && level > maxLevel) continue;
        kept.push({ ...item, level, children: item.children ? prune(item.children, maxLevel, level) : undefined });
    }
    return kept;
}

function flatten(items: TocItem[], ids: string[] = []): string[] {
    for (const item of items) {
        ids.push(item.id);
        if (item.children) flatten(item.children, ids);
    }
    return ids;
}

function contains(item: TocItem, id: string): boolean {
    return item.id === id || (item.children?.some((child) => contains(child, id)) ?? false);
}

function px(value: string) {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * The headings of a long page as links, with the one nearest the top marked as current while the page scrolls.
 * Reads them from the content (`contentRef`) or takes them as `items`. Headings need ids to be linked to.
 */
export function TableOfContents({
    items: givenItems,
    contentRef,
    selector = "h2, h3",
    container,
    activeId,
    onActiveChange,
    title = "On this page",
    offset = 80,
    smooth = true,
    maxLevel,
    collapsible = false,
    className,
    "aria-label": ariaLabel = "Table of contents",
}: TableOfContentsProps) {
    const navRef = useRef<HTMLElement>(null);
    const [readItems, setReadItems] = useState<TocItem[]>([]);
    const [active, setActive] = useControllableState<string>(activeId, "", onActiveChange);
    // While a click's scroll is under way, the scroll listener leaves the clicked heading current.
    const settling = useRef(0);

    // Reads the headings from the content, and again whenever it changes.
    useEffect(() => {
        if (givenItems) return undefined;
        const root = contentRef?.current;
        if (!root) return undefined;
        let frame = 0;
        const read = () => setReadItems(readHeadings(root, selector, maxLevel));
        read();
        if (typeof MutationObserver === "undefined") return undefined;
        const observer = new MutationObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(read);
        });
        observer.observe(root, { childList: true, subtree: true, characterData: true });
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [givenItems, contentRef, selector, maxLevel]);

    const items = useMemo(() => (givenItems ? prune(givenItems, maxLevel, 1) : readItems), [givenItems, maxLevel, readItems]);
    const ids = useMemo(() => flatten(items), [items]);

    // Marks the heading nearest the top as current whenever the scroller moves or resizes.
    useEffect(() => {
        if (ids.length === 0) return undefined;
        const scroller = container?.current ?? null;
        const target: EventTarget = scroller ?? window;
        let frame = 0;

        const measure = () => {
            if (settling.current) return;
            const top = scroller ? scroller.getBoundingClientRect().top : 0;
            const present = ids.filter((id) => document.getElementById(id));
            const first = present[0];
            if (first === undefined) return;
            let current = first;
            for (const id of present) {
                if (document.getElementById(id)!.getBoundingClientRect().top - top <= offset) current = id;
                else break;
            }
            // Scrolled to the very end, the last heading is current even when it can't reach the top.
            const atEnd = scroller
                ? scroller.scrollHeight > scroller.clientHeight && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1
                : document.documentElement.scrollHeight > window.innerHeight &&
                  window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
            if (atEnd) current = present[present.length - 1] ?? first;
            setActive(current);
        };
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };

        measure();
        target.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        return () => {
            cancelAnimationFrame(frame);
            target.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [ids, container, offset, setActive]);

    useIndicator(navRef, '.ow-toc__link[aria-current="location"]', active || null);

    const follow = useCallback(
        (event: MouseEvent<HTMLAnchorElement>, id: string) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const element = document.getElementById(id);
            if (!element) return;
            event.preventDefault();
            const scroller = container?.current ?? null;
            const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
            const behavior: ScrollBehavior = smooth && !reduceMotion ? "smooth" : "auto";
            // Lands where scroll-margin-top on the heading, and scroll-padding-top on the scroller, say it should.
            const margin = px(getComputedStyle(element).scrollMarginTop) + px(getComputedStyle(scroller ?? document.documentElement).scrollPaddingTop);
            const top = element.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0) - margin;
            setActive(id);
            history.replaceState(history.state, "", `#${id}`);

            // The clicked heading stays current until the scroll settles, even if it can't reach the top.
            const target: EventTarget = scroller ?? window;
            const settle = () => {
                clearTimeout(settling.current);
                settling.current = window.setTimeout(() => {
                    settling.current = 0;
                    target.removeEventListener("scroll", settle);
                }, 150);
            };
            settle();
            target.addEventListener("scroll", settle, { passive: true });
            if (scroller) scroller.scrollTo({ top: scroller.scrollTop + top, behavior });
            else window.scrollTo({ top: window.scrollY + top, behavior });
        },
        [container, smooth, setActive],
    );

    useEffect(() => () => clearTimeout(settling.current), []);

    if (items.length === 0) return null;

    const renderList = (list: TocItem[], depth: number) => (
        <ul className="ow-toc__list">
            {list.map((item) => {
                const isActive = item.id === active;
                const open = !collapsible || contains(item, active);
                return (
                    <li key={item.id} className="ow-toc__item">
                        <a
                            href={`#${item.id}`}
                            className={cx("ow-toc__link", isActive && "ow-toc__link--active")}
                            style={{ "--ow-toc-depth": depth } as CSSProperties}
                            aria-current={isActive ? "location" : undefined}
                            onClick={(event) => follow(event, item.id)}
                        >
                            {item.title}
                        </a>
                        {item.children && item.children.length > 0 && open ? renderList(item.children, depth + 1) : null}
                    </li>
                );
            })}
        </ul>
    );

    return (
        <nav ref={navRef} aria-label={ariaLabel} className={cx("ow-toc", className)}>
            {title !== null && title !== undefined ? <span className="ow-toc__title">{title}</span> : null}
            <span className="ow-indicator" aria-hidden="true" />
            {renderList(items, 0)}
        </nav>
    );
}
