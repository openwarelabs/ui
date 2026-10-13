import { useLayoutEffect, type RefObject } from "react";

/**
 * Measures the selected child of `containerRef` (the first match of `selector`) and writes its box to the
 * container as --ow-indicator-x, -y, -w and -h, so one absolutely placed element (.ow-indicator) can slide
 * between choices. The container gets data-indicator="placed" on the first measure (no animation) and "ready"
 * a frame later (animated from then on). It re-measures when `key` changes or anything resizes.
 */
export function useIndicator(containerRef: RefObject<HTMLElement | null>, selector: string, key: unknown) {
    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;
        let frame = 0;

        const measure = () => {
            const selected = container.querySelector<HTMLElement>(selector);
            if (!selected) {
                delete container.dataset.indicator;
                return;
            }
            container.style.setProperty("--ow-indicator-x", `${selected.offsetLeft}px`);
            container.style.setProperty("--ow-indicator-y", `${selected.offsetTop}px`);
            container.style.setProperty("--ow-indicator-w", `${selected.offsetWidth}px`);
            container.style.setProperty("--ow-indicator-h", `${selected.offsetHeight}px`);
            if (!container.dataset.indicator) {
                container.dataset.indicator = "placed";
                frame = requestAnimationFrame(() => {
                    frame = requestAnimationFrame(() => {
                        if (container.dataset.indicator) container.dataset.indicator = "ready";
                    });
                });
            }
        };

        measure();
        if (typeof ResizeObserver === "undefined") return () => cancelAnimationFrame(frame);
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        for (const child of container.children) observer.observe(child);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [containerRef, selector, key]);
}
