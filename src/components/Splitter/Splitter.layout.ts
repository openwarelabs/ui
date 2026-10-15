import type { SplitterPanelLimits } from "./Splitter.types";

const EPSILON = 0.001;

export const isCollapsed = (limits: SplitterPanelLimits, size: number) =>
    limits.collapsible && size <= limits.collapsedSize + EPSILON;

/** Panels with a default size keep it; the rest share what's left. Then everything is scaled to add up to 100. */
export function initialSizes(defaults: Array<number | undefined>): number[] {
    const given = defaults.reduce<number>((sum, size) => sum + (size ?? 0), 0);
    const open = defaults.filter((size) => size === undefined).length;
    const share = open ? Math.max(0, 100 - given) / open : 0;
    return normalise(defaults.map((size) => size ?? share));
}

export function normalise(sizes: number[]): number[] {
    const total = sizes.reduce((sum, size) => sum + size, 0);
    return total > 0 ? sizes.map((size) => (size / total) * 100) : sizes.map(() => 100 / sizes.length);
}

/**
 * Moves the handle after panel `handle` by `delta` percent: the panel on the side it moves away from grows (up to its
 * maximum), and the panels on the other side shrink in turn, nearest first, down to their minimums. With `snap`, a
 * collapsible panel collapses once it's dragged more than halfway from its minimum to its collapsed size, and
 * expands again past the same point.
 */
export function moveHandle(sizes: number[], limits: SplitterPanelLimits[], handle: number, delta: number, snap: boolean): number[] {
    if (Math.abs(delta) < EPSILON) return sizes;
    if (delta < 0) {
        // The same, seen from the other end.
        const last = sizes.length - 2;
        return moveHandle([...sizes].reverse(), [...limits].reverse(), last - handle, -delta, snap).reverse();
    }
    const next = [...sizes];
    const grower = limits[handle]!;
    const start = sizes[handle]!;
    const wasCollapsed = isCollapsed(grower, start);
    let target = start + delta;
    if (wasCollapsed) {
        if (!snap || target < (grower.minSize + grower.collapsedSize) / 2) return sizes;
        target = Math.max(target, grower.minSize);
    }
    target = Math.min(target, grower.maxSize);
    let remaining = target - start;
    if (remaining <= EPSILON) return sizes;

    for (let index = handle + 1; index < sizes.length && remaining > EPSILON; index++) {
        const panel = limits[index]!;
        const size = next[index]!;
        if (isCollapsed(panel, size)) continue;
        if (snap && index === handle + 1 && panel.collapsible && size - remaining < (panel.minSize + panel.collapsedSize) / 2) {
            remaining -= size - panel.collapsedSize;
            next[index] = panel.collapsedSize;
            continue;
        }
        const take = Math.min(Math.max(0, size - panel.minSize), remaining);
        next[index] = size - take;
        remaining -= take;
    }

    const grown = target - remaining;
    // Snapping a neighbour shut freed more than this panel can take: move without snapping instead.
    if (grown > grower.maxSize + EPSILON) return moveHandle(sizes, limits, handle, delta, false);
    if (wasCollapsed && grown < grower.minSize - EPSILON) return sizes;
    next[handle] = grown;
    return next;
}
