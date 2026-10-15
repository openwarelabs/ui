import { useState, type KeyboardEvent } from "react";

import { cx } from "@/utils/cx";
import { colorOf, defaultValue } from "./chartUtils";
import { ChartLegend, ChartTable } from "./ChartParts";
import type { DonutChartProps } from "./Chart.types";

const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });

/** One slice of a ring, from one angle to another (radians, clockwise from 12 o'clock). */
function slicePath(cx: number, cy: number, outer: number, inner: number, start: number, end: number) {
    const point = (r: number, a: number) => `${(cx + r * Math.sin(a)).toFixed(2)} ${(cy - r * Math.cos(a)).toFixed(2)}`;
    const large = end - start > Math.PI ? 1 : 0;
    return `M${point(outer, start)}A${outer} ${outer} 0 ${large} 1 ${point(outer, end)}L${point(inner, end)}A${inner} ${inner} 0 ${large} 0 ${point(inner, start)}Z`;
}

/**
 * Parts of a whole as a ring, with the total in the middle and each part's value and share beside it. Best with two
 * to six slices; hover a slice, or focus it and use the arrow keys, to read it.
 */
export function DonutChart({ data, label, formatValue = defaultValue, center, centerLabel = "Total", size = 180, legend = true, className }: DonutChartProps) {
    const [active, setActive] = useState<number | null>(null);
    const slices = data.map((slice, i) => ({ ...slice, value: Math.max(0, slice.value), fill: colorOf(slice.color, i) }));
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    const share = (value: number) => percent.format(total ? value / total : 0);

    const outer = size / 2;
    const inner = outer - Math.max(14, Math.round(size * 0.13));
    // A 2px gap between slices, the same width at the inner and outer edge.
    const pad = (radius: number) => (slices.filter((slice) => slice.value > 0).length > 1 ? 1 / radius : 0);
    let angle = 0;
    const arcs = slices.map((slice) => {
        const start = angle;
        angle += total ? (slice.value / total) * Math.PI * 2 : 0;
        return { start, end: angle };
    });

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!slices.length) return;
        const current = active ?? 0;
        const moves: Record<string, number> = {
            ArrowRight: (current + 1) % slices.length,
            ArrowDown: (current + 1) % slices.length,
            ArrowLeft: (current - 1 + slices.length) % slices.length,
            ArrowUp: (current - 1 + slices.length) % slices.length,
            Home: 0,
            End: slices.length - 1,
        };
        if (event.key === "Escape") return setActive(null);
        if (!(event.key in moves)) return;
        event.preventDefault();
        setActive(moves[event.key]!);
    };

    const shown = active === null ? null : slices[active];

    return (
        <figure className={cx("ow-chart", "ow-chart--donut", className)}>
            <div
                className="ow-chart__donut"
                style={{ width: size, height: size }}
                tabIndex={slices.length ? 0 : undefined}
                role="group"
                aria-label={`${label}. Use the arrow keys to read each part.`}
                onKeyDown={onKeyDown}
                onFocus={() => setActive((current) => current ?? 0)}
                onBlur={() => setActive(null)}
                onPointerLeave={() => setActive(null)}
            >
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                    {total === 0 ? <circle className="ow-chart__empty" cx={outer} cy={outer} r={(outer + inner) / 2} strokeWidth={outer - inner} /> : null}
                    {slices.map((slice, i) => {
                        const { start, end } = arcs[i]!;
                        if (end - start <= 0) return null;
                        const whole = end - start >= Math.PI * 2 - 1e-6;
                        const d = whole
                            ? `${slicePath(outer, outer, outer, inner, 0, Math.PI)}${slicePath(outer, outer, outer, inner, Math.PI, Math.PI * 2)}`
                            : innerPadded(outer, inner, start, end, pad(outer), pad(inner));
                        return (
                            <path
                                key={i}
                                d={d}
                                fill={slice.fill}
                                className={cx("ow-chart__slice", active !== null && active !== i && "ow-chart__slice--dim")}
                                onPointerEnter={() => setActive(i)}
                            />
                        );
                    })}
                </svg>
                <div className="ow-chart__center" aria-hidden="true">
                    <strong className="ow-chart__center-value">{shown ? formatValue(shown.value) : (center ?? formatValue(total))}</strong>
                    <span className="ow-chart__center-label">{shown ? `${shown.label} · ${share(shown.value)}` : centerLabel}</span>
                </div>
                <span className="ow-visually-hidden" aria-live="polite">
                    {shown ? `${shown.label}: ${formatValue(shown.value)}, ${share(shown.value)}.` : ""}
                </span>
            </div>
            {legend ? (
                <ChartLegend
                    shape="square"
                    items={slices.map((slice) => ({ label: slice.label, color: slice.fill, value: `${formatValue(slice.value)} · ${share(slice.value)}` }))}
                />
            ) : null}
            <ChartTable
                caption={label}
                head={["", "Value", "Share"]}
                rows={slices.map((slice) => [slice.label, formatValue(slice.value), share(slice.value)])}
            />
        </figure>
    );
}

/** A slice with its ends pulled in: by padOuter at the outer edge and padInner at the inner, so the gap is even. */
function innerPadded(outer: number, inner: number, start: number, end: number, padOuter: number, padInner: number) {
    const c = outer;
    const point = (r: number, a: number) => `${(c + r * Math.sin(a)).toFixed(2)} ${(c - r * Math.cos(a)).toFixed(2)}`;
    const os = start + padOuter;
    const oe = Math.max(os, end - padOuter);
    const is = start + padInner;
    const ie = Math.max(is, end - padInner);
    const largeOuter = oe - os > Math.PI ? 1 : 0;
    const largeInner = ie - is > Math.PI ? 1 : 0;
    return `M${point(outer, os)}A${outer} ${outer} 0 ${largeOuter} 1 ${point(outer, oe)}L${point(inner, ie)}A${inner} ${inner} 0 ${largeInner} 0 ${point(inner, is)}Z`;
}
