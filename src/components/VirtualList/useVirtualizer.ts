import { useCallback, useLayoutEffect, useMemo, useReducer, useRef, useState, type Key } from "react";
import { flushSync } from "react-dom";

/** One row that's rendered: where it goes and how tall it is. */
export interface VirtualItem {
    index: number;
    /** The row's key, from `getKey`: use it as the React key. */
    key: Key;
    /** Its top, in pixels from the top of the scrolling content. */
    start: number;
    /** Its height in pixels: `itemSize`, or measured, or the estimate until it's measured. */
    size: number;
}

export interface ScrollToIndexOptions {
    /** Where the row ends up: at the `start` (top) of the view, the `center`, the `end`, or `auto`, scrolling only as
     * far as needed to show it.
     * @default "auto" */
    align?: "start" | "center" | "end" | "auto";
    /** `smooth` animates the scroll, except for people who prefer reduced motion.
     * @default "auto" */
    behavior?: ScrollBehavior;
}

export interface UseVirtualizerOptions {
    /** How many rows there are. */
    count: number;
    /** Returns the element that scrolls. It must be there once the component has mounted. */
    getScrollElement(): HTMLElement | null;
    /** Every row's height in pixels, when they're all the same: the fastest, as nothing is measured. */
    itemSize?: number;
    /** A guess at a row's height in pixels, before it's measured. Rows are measured as they render, and the view
     * doesn't jump when a row above it turns out taller or shorter than the guess.
     * @default 48 */
    estimateSize?: number | ((index: number) => number);
    /** How many rows to render beyond each edge of the view, so fast scrolling doesn't show gaps.
     * @default 4 */
    overscan?: number;
    /** Space between rows, in pixels.
     * @default 0 */
    gap?: number;
    /** A stable key for each row. With real keys (not the index), measured heights follow their row, and rows
     * added at the top keep the view where it was.
     * @default (index) => index */
    getKey?(index: number): Key;
    /** A row to keep rendered even out of view, such as the one that has focus, so it isn't lost. */
    keepMounted?: number | null;
}

export interface Virtualizer {
    /** The rows to render: those in view and the overscan around them. */
    items: VirtualItem[];
    /** The height of all the rows together: give the content inside the scrolling element this height. */
    totalSize: number;
    /** Pass as the `ref` of each rendered row, with `data-index` on it, so its height is measured. */
    measureElement(element: HTMLElement | null): void;
    /** Scrolls a row into view. */
    scrollToIndex(index: number, options?: ScrollToIndexOptions): void;
}

const prefersReducedMotion = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** The last row that starts at or before `offset`. */
function rowAt(starts: Float64Array, count: number, offset: number) {
    let low = 0;
    let high = count - 1;
    while (low < high) {
        const middle = (low + high + 1) >> 1;
        if (starts[middle]! <= offset) low = middle;
        else high = middle - 1;
    }
    return Math.max(0, low);
}

/** A row's height: the distance to the next row, less the gap. */
function sizeIn({ starts, count, gap }: { starts: Float64Array; count: number; gap: number }, index: number) {
    return starts[index + 1]! - starts[index]! - (index < count - 1 ? gap : 0);
}

/**
 * Windowing for long lists: works out which rows of `count` are in view of a scrolling element, where each one goes,
 * and how tall the whole list is, so you render only those rows. Rows have a fixed `itemSize`, or are measured with
 * ResizeObserver as they render. VirtualList is built on it; use it for your own virtualized table or list box.
 */
export function useVirtualizer({
    count,
    getScrollElement,
    itemSize,
    estimateSize = 48,
    overscan = 4,
    gap = 0,
    getKey,
    keepMounted,
}: UseVirtualizerOptions): Virtualizer {
    const sizes = useRef(new Map<Key, number>());
    const [version, remeasure] = useReducer((n: number) => n + 1, 0);
    const [range, setRange] = useState<[number, number]>([0, 0]);
    // The first row in view and how far its top sits from the top of the view, to put back when rows are added above.
    const anchor = useRef<{ key: Key; index: number; offset: number } | null>(null);
    const lastCount = useRef(count);

    const estimate = useCallback((index: number) => (typeof estimateSize === "function" ? estimateSize(index) : estimateSize), [estimateSize]);

    // Every row's top, and its key, worked out in one pass: cheap even for 100,000 rows. `version` counts new heights.
    const layout = useMemo(() => {
        const starts = new Float64Array(count + 1);
        const keys: Key[] = new Array(count);
        let position = 0;
        for (let index = 0; index < count; index++) {
            const key = getKey ? getKey(index) : index;
            keys[index] = key;
            starts[index] = position;
            position += (itemSize ?? sizes.current.get(key) ?? estimate(index)) + gap;
        }
        starts[count] = Math.max(0, position - gap);
        return { starts, keys, count, gap, version };
    }, [count, getKey, itemSize, estimate, gap, version]);

    const latest = useRef({ layout, getScrollElement, estimate, itemSize });
    latest.current = { layout, getScrollElement, estimate, itemSize };

    // Which rows are in view, from where the element has scrolled to. Only a different range renders again.
    const update = useCallback(() => {
        const element = latest.current.getScrollElement();
        const { starts, keys, count: total } = latest.current.layout;
        if (!element || total === 0) {
            anchor.current = null;
            return;
        }
        const top = element.scrollTop;
        const first = rowAt(starts, total, top);
        const last = rowAt(starts, total, top + element.clientHeight);
        anchor.current = { key: keys[first]!, index: first, offset: starts[first]! - top };
        setRange((previous) => (previous[0] === first && previous[1] === last ? previous : [first, last]));
    }, []);

    useLayoutEffect(() => {
        const element = getScrollElement();
        // Rows added or removed above the view: scroll by the difference, so the row that was at the top stays there.
        if (element && anchor.current && count !== lastCount.current) {
            const { key, index, offset } = anchor.current;
            const found = layout.keys[index] === key ? index : layout.keys.indexOf(key);
            if (found >= 0 && Math.abs(layout.starts[found]! - offset - element.scrollTop) > 0.5) element.scrollTop = layout.starts[found]! - offset;
        }
        lastCount.current = count;
        update();
    });

    useLayoutEffect(() => {
        const element = latest.current.getScrollElement();
        if (!element) return undefined;
        // Rendered before the next paint, so newly scrolled-to rows are never blank for a frame.
        const sync = () => flushSync(update);
        element.addEventListener("scroll", sync, { passive: true });
        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(sync);
        observer?.observe(element);
        return () => {
            element.removeEventListener("scroll", sync);
            observer?.disconnect();
        };
    }, [update]);

    // One observer measures every rendered row. A row above the view that changes height scrolls the view by as
    // much, so what you're reading stays put. Rows that leave the page report one last time and are let go, so it
    // needs no cleanup of its own.
    const observer = useMemo(
        () =>
            typeof ResizeObserver === "undefined"
                ? undefined
                : new ResizeObserver((entries, self) => {
                      const { layout: current, getScrollElement: getElement, estimate: guess } = latest.current;
                      const element = getElement();
                      let delta = 0;
                      let changed = false;
                      for (const entry of entries) {
                          const node = entry.target as HTMLElement;
                          if (!node.isConnected) {
                              self.unobserve(node);
                              continue;
                          }
                          const index = Number(node.dataset.index);
                          if (!(index < current.count)) continue;
                          const key = current.keys[index]!;
                          const size = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
                          const previous = sizes.current.get(key) ?? guess(index);
                          if (Math.abs(size - previous) < 0.5) continue;
                          sizes.current.set(key, size);
                          changed = true;
                          if (element && current.starts[index]! < element.scrollTop) delta += size - previous;
                      }
                      if (!changed) return;
                      // Render the new heights before the next paint, so rows never overlap for a frame.
                      flushSync(remeasure);
                      // At the very end the browser already keeps the bottom in place.
                      if (element && delta && !(delta < 0 && element.scrollHeight - element.scrollTop - element.clientHeight < 1)) {
                          element.scrollTop += delta;
                      }
                  }),
        [],
    );

    const measureElement = useCallback(
        (node: HTMLElement | null) => {
            if (node && latest.current.itemSize === undefined) observer?.observe(node);
        },
        [observer],
    );

    const scrollToIndex = useCallback(
        (index: number, { align = "auto", behavior = "auto" }: ScrollToIndexOptions = {}) => {
            const element = latest.current.getScrollElement();
            if (!element) return;
            const target = () => {
                const current = latest.current.layout;
                const row = Math.max(0, Math.min(index, current.count - 1));
                const start = current.starts[row]!;
                const end = start + sizeIn(current, row);
                const view = element.clientHeight;
                const top = element.scrollTop;
                if (align === "start" || (align === "auto" && start < top)) return start;
                if (align === "center") return start - (view - (end - start)) / 2;
                if (align === "end" || end > top + view) return end - view;
                return top;
            };
            const smooth = behavior === "smooth" && !prefersReducedMotion();
            element.scrollTo({ top: target(), behavior: smooth ? "smooth" : "auto" });
            if (smooth) return;
            // Rows measured on the way can move the target: settle on it over the next few frames.
            let tries = 0;
            const settle = () => {
                const top = target();
                if (Math.abs(top - element.scrollTop) > 1 && Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) > 1 && tries++ < 5) {
                    element.scrollTop = top;
                    requestAnimationFrame(settle);
                }
            };
            requestAnimationFrame(settle);
        },
        [],
    );

    const items: VirtualItem[] = [];
    if (count > 0) {
        const first = Math.max(0, Math.min(range[0], count - 1) - overscan);
        const last = Math.min(count - 1, range[1] + overscan);
        const add = (index: number) => items.push({ index, key: layout.keys[index]!, start: layout.starts[index]!, size: sizeIn(layout, index) });
        if (keepMounted != null && keepMounted < first) add(keepMounted);
        for (let index = first; index <= last; index++) add(index);
        if (keepMounted != null && keepMounted > last && keepMounted < count) add(keepMounted);
    }

    return { items, totalSize: layout.starts[count]!, measureElement, scrollToIndex };
}
