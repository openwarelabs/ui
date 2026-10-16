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

/**
 * Round gridlines: steps of 1, 2 or 5 times a power of ten, about four of them, always including zero unless
 * `zero` is false, when they just cover the numbers.
 */
export function niceTicks(min: number, max: number, zero = true) {
    const low = zero ? Math.min(0, min) : Math.min(min, max);
    const high = zero ? Math.max(0, max) : Math.max(min, max);
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

/**
 * One slice of a ring, or of a disc when `inner` is 0, from one angle to another (radians, clockwise from 12
 * o'clock), with its ends pulled in by `padOuter` at the outer edge and `padInner` at the inner, so a gap between
 * slices is the same width at both.
 */
export function arcPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number, padOuter = 0, padInner = 0) {
    const point = (r: number, a: number) => `${(cx + r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)}`;
    const os = start + padOuter;
    const oe = Math.max(os, end - padOuter);
    const largeOuter = oe - os > Math.PI ? 1 : 0;
    const head = `M${point(outer, os)}A${outer} ${outer} 0 ${largeOuter} 1 ${point(outer, oe)}`;
    if (inner <= 0) return `${head}L${cx.toFixed(2)} ${cy.toFixed(2)}Z`;
    const is = start + padInner;
    const ie = Math.max(is, end - padInner);
    const largeInner = ie - is > Math.PI ? 1 : 0;
    return `${head}L${point(inner, ie)}A${inner} ${inner} 0 ${largeInner} 0 ${point(inner, is)}Z`;
}

/** A whole ring or disc, as two half slices, since one arc can't close on itself. */
export const wholePath = (cx: number, cy: number, outer: number, inner: number) =>
    `${arcPath(cx, cy, outer, inner, 0, Math.PI)}${arcPath(cx, cy, outer, inner, Math.PI, Math.PI * 2)}`;

/** Each value's slice of the whole turn: its start and end angle in radians, going clockwise from `from`. */
export function arcs(values: number[], from = 0) {
    const total = values.reduce((sum, value) => sum + value, 0);
    let angle = from;
    return values.map((value) => {
        const start = angle;
        angle += total ? (value / total) * Math.PI * 2 : 0;
        return { start, end: angle };
    });
}

/** Roughly how wide a label is at the axis' 11.5px, to keep labels from colliding without measuring each one. */
export const textWidth = (text: string) => text.length * 6.6;
