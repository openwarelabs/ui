import { useLayoutEffect, useRef, useState } from "react";

import type { ChartColor, ChartRow, ChartSeries } from "./Chart.types";

export const colorOf = (color: ChartColor | undefined, index: number) =>
    color === undefined ? `var(--ow-chart-${(index % 8) + 1})` : typeof color === "number" ? `var(--ow-chart-${color})` : color;

export const seriesColors = (series: ChartSeries[]) => series.map((entry, index) => colorOf(entry.color, index));

const number = new Intl.NumberFormat();
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });
const day = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

export const defaultValue = (value: number) => number.format(value);
export const defaultTick = (value: number) => compact.format(value);
export const defaultIndex = (value: unknown) => (value instanceof Date ? day.format(value) : String(value ?? ""));

export const valueOf = (row: ChartRow | undefined, key: string) => {
    const value = row?.[key];
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
};

/** Round gridlines: steps of 1, 2 or 5 times a power of ten, about four of them, always including zero. */
export function niceTicks(min: number, max: number) {
    const low = Math.min(0, min);
    const high = Math.max(0, max);
    const rough = (high - low || 1) / 4;
    const power = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 2.5, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= rough)!;
    const start = Math.floor(low / step) * step;
    const end = Math.ceil(high / step) * step || step;
    const ticks: number[] = [];
    for (let tick = start; tick <= end + step / 2; tick += step) ticks.push(Math.round(tick / step) * step);
    return ticks;
}

/** The element's width, kept up to date. Zero until it's measured, so charts draw on the client only. */
export function useWidth<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        const measure = () => setWidth(element.clientWidth);
        measure();
        if (typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    return [ref, width] as const;
}

/** Roughly how wide a label is at the axis' 11.5px, to keep labels from colliding without measuring each one. */
export const textWidth = (text: string) => text.length * 6.6;
