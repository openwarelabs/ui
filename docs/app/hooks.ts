import { useEffect, useState, useSyncExternalStore } from "react";

import { resolve, type Route } from "./content";

/** The current page, from the address's #/… part. */
export function useRoute(): Route {
    const [hash, setHash] = useState(() => window.location.hash);
    useEffect(() => {
        const onChange = () => setHash(window.location.hash);
        window.addEventListener("hashchange", onChange);
        return () => window.removeEventListener("hashchange", onChange);
    }, []);
    return resolve(hash);
}

export type ThemeChoice = "light" | "dark" | "system";

const storageKey = "ow-docs-theme";
const themeListeners = new Set<() => void>();

const initialTheme = document.documentElement.dataset.theme;
// Kept here as well as on <html>: with a view transition, <html> only changes a moment later.
let currentTheme: ThemeChoice = initialTheme === "light" || initialTheme === "dark" ? initialTheme : "system";

const readTheme = () => currentTheme;

function writeTheme(next: ThemeChoice) {
    currentTheme = next;
    // Cross-fade between themes where the browser can, instead of snapping.
    const doc = document as Document & { startViewTransition?: (update: () => void) => unknown };
    const apply = () => {
        document.documentElement.dataset.theme = next;
    };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
    try {
        localStorage.setItem(storageKey, next);
    } catch {
        // Storage blocked: the choice lasts until reload.
    }
    themeListeners.forEach((listener) => listener());
}

function subscribeTheme(listener: () => void) {
    themeListeners.add(listener);
    return () => themeListeners.delete(listener);
}

/** The docs' theme: kept on <html data-theme>, remembered in this browser, and shared by every switch on the page. */
export function useTheme(): [ThemeChoice, (theme: ThemeChoice) => void] {
    const theme = useSyncExternalStore(subscribeTheme, readTheme);
    return [theme, writeTheme];
}

/** True when the page is at least this wide. */
export function useMinWidth(px: number): boolean {
    const query = `(min-width: ${px}px)`;
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const list = window.matchMedia(query);
        const onChange = () => setMatches(list.matches);
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
    }, [query]);
    return matches;
}

/**
 * Which sections are on screen, for the "On this page" list: the first and last index of the headings whose
 * section (from the heading to the next one) overlaps the window below the header. Before the first heading
 * it's the first one; at the very bottom it runs to the last.
 */
export function useVisibleSections(ids: string[], headerOffset = 88): [number, number] {
    const [range, setRange] = useState<[number, number]>([0, 0]);
    const key = ids.join("|");
    useEffect(() => {
        let frame = 0;
        const update = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const tops = ids.map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY);
                const viewTop = headerOffset;
                const viewBottom = window.innerHeight;
                const pageEnd = document.documentElement.getBoundingClientRect().bottom;
                let first = -1;
                let last = -1;
                tops.forEach((top, index) => {
                    const bottom = index + 1 < tops.length ? tops[index + 1]! : pageEnd;
                    if (top < viewBottom && bottom > viewTop) {
                        if (first < 0) first = index;
                        last = index;
                    }
                });
                if (first < 0) first = last = 0;
                if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) last = ids.length - 1;
                setRange((current) => (current[0] === first && current[1] === last ? current : [first, last]));
            });
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the joined key stands for the list.
    }, [key, headerOffset]);
    return range;
}
