import { useState, type KeyboardEvent, type PointerEvent } from "react";

import { cx } from "@/utils/cx";
import { defaultIndex, defaultTick, defaultValue, niceTicks, seriesColors, textWidth, useWidth, valueOf } from "./chartUtils";
import { ChartLegend, ChartTable } from "./ChartParts";
import type { AreaChartProps, BarChartProps, LineChartProps } from "./Chart.types";

type Props = (LineChartProps & { kind: "line" }) | (BarChartProps & { kind: "bar" }) | (AreaChartProps & { kind: "area" });

const gap = 2;
const maxBar = 24;
const radius = 4;

/** A bar with rounded corners at its data end and square ones at the baseline. */
function barPath(x: number, top: number, width: number, bottom: number, round: boolean) {
    const height = bottom - top;
    if (height <= 0 || width <= 0) return "";
    const r = round ? Math.min(radius, width / 2, height) : 0;
    return `M${x} ${bottom}V${top + r}${r ? `Q${x} ${top} ${x + r} ${top}` : ""}H${x + width - r}${r ? `Q${x + width} ${top} ${x + width} ${top + r}` : ""}V${bottom}Z`;
}

/** A line through the points; with `curved`, a monotone curve that never overshoots a point (Fritsch–Carlson). */
function linePath(points: Array<[number, number]>, curved: boolean) {
    if (!points.length) return "";
    const fixed = (n: number) => n.toFixed(1);
    if (!curved || points.length < 3) return points.map(([x, y], i) => `${i ? "L" : "M"}${fixed(x)} ${fixed(y)}`).join("");
    const n = points.length;
    const slopes = points.slice(0, -1).map(([x, y], i) => (points[i + 1]![1] - y) / (points[i + 1]![0] - x || 1));
    const tangents = points.map((_, i) => {
        if (i === 0) return slopes[0]!;
        if (i === n - 1) return slopes[n - 2]!;
        const a = slopes[i - 1]!;
        const b = slopes[i]!;
        return a * b <= 0 ? 0 : (3 * a * b) / (Math.max(a, b) * 2 + Math.min(a, b));
    });
    let d = `M${fixed(points[0]![0])} ${fixed(points[0]![1])}`;
    for (let i = 0; i < n - 1; i++) {
        const [x0, y0] = points[i]!;
        const [x1, y1] = points[i + 1]!;
        const h = (x1 - x0) / 3;
        d += `C${fixed(x0 + h)} ${fixed(y0 + tangents[i]! * h)} ${fixed(x1 - h)} ${fixed(y1 - tangents[i + 1]! * h)} ${fixed(x1)} ${fixed(y1)}`;
    }
    return d;
}

export function CartesianChart(props: Props) {
    const {
        kind,
        data,
        index,
        series,
        label,
        height = 240,
        formatValue = defaultValue,
        formatTick = defaultTick,
        formatIndex = defaultIndex,
        legend = series.length > 1,
        className,
    } = props;
    const stacked = kind === "bar" ? Boolean(props.stacked) : kind === "area" ? props.stacked !== false : false;
    const area = kind === "line" && Boolean(props.area);
    const curved = kind !== "bar" && Boolean(props.curved);

    const [plotRef, width] = useWidth<HTMLDivElement>();
    const [active, setActive] = useState<number | null>(null);
    const colors = seriesColors(series);
    const count = data.length;

    // The y scale, from zero (or below, for negative numbers) to a round number above the largest.
    const totals = data.map((row) => series.reduce((sum, entry) => sum + Math.max(0, valueOf(row, entry.key)), 0));
    const values = data.flatMap((row) => series.map((entry) => valueOf(row, entry.key)));
    const ticks = niceTicks(Math.min(0, ...values), stacked ? Math.max(0, ...totals) : Math.max(0, ...values));
    const low = ticks[0]!;
    const high = ticks[ticks.length - 1]!;
    const tickLabels = ticks.map(formatTick);

    const margin = { top: 8, right: kind === "bar" ? 4 : 10, bottom: 26, left: Math.ceil(Math.max(...tickLabels.map(textWidth))) + 12 };
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = Math.max(0, height - margin.top - margin.bottom);
    const y = (value: number) => margin.top + plotHeight - ((value - low) / (high - low || 1)) * plotHeight;

    // Lines put the first and last points a little in from the ends; bars take a band each.
    const band = count ? plotWidth / count : 0;
    const inset = 6;
    const step = count > 1 ? (plotWidth - inset * 2) / (count - 1) : 0;
    const x = (i: number) => (kind === "bar" ? margin.left + band * (i + 0.5) : count > 1 ? margin.left + inset + i * step : margin.left + plotWidth / 2);

    // Enough x labels to fill the axis without touching: every nth, always including the last for lines.
    const indexLabels = data.map((row) => formatIndex(row[index]));
    const spacing = kind === "bar" ? band : step || plotWidth;
    const every = Math.max(1, Math.ceil((Math.max(0, ...indexLabels.map(textWidth)) + 14) / (spacing || 1)));
    const labelled = data.map((_, i) => i).filter((i) => (kind === "bar" ? i % every === 0 : (count - 1 - i) % every === 0));

    const pick = (event: PointerEvent<SVGRectElement>) => {
        const left = event.currentTarget.getBoundingClientRect().left - margin.left;
        const position = event.clientX - left;
        const i = kind === "bar" ? Math.floor((position - margin.left) / (band || 1)) : Math.round((position - margin.left - inset) / (step || 1));
        setActive(Math.min(count - 1, Math.max(0, i)));
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!count) return;
        const current = active ?? count - 1;
        const moves: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: count - 1 };
        if (event.key === "Escape") return setActive(null);
        if (!(event.key in moves)) return;
        event.preventDefault();
        setActive(Math.min(count - 1, Math.max(0, moves[event.key]!)));
    };

    const shown = active === null ? null : Math.min(active, count - 1);
    const describe = (i: number) => `${indexLabels[i]}: ${series.map((entry) => `${entry.label} ${formatValue(valueOf(data[i], entry.key))}`).join(", ")}.`;

    // Bars side by side within their band, each at most 24px wide with a 2px gap.
    const groupSeries = stacked ? 1 : series.length;
    const groupWidth = Math.min(band * 0.72, groupSeries * maxBar + (groupSeries - 1) * gap);
    const barWidth = Math.max(1, (groupWidth - (groupSeries - 1) * gap) / groupSeries);

    const bars = () =>
        data.map((row, i) => {
            const start = x(i) - groupWidth / 2;
            if (stacked) {
                let base = 0;
                const parts = series.map((entry, s) => {
                    const value = Math.max(0, valueOf(row, entry.key));
                    const part = { s, from: base, to: base + value };
                    base += value;
                    return part;
                });
                const top = [...parts].reverse().find((part) => part.to > part.from)?.s;
                return parts.map(({ s, from, to }) =>
                    to > from ? (
                        <path key={`${i}-${s}`} d={barPath(start, y(to), barWidth, y(from) - (from > 0 ? gap : 0), s === top)} fill={colors[s]} />
                    ) : null,
                );
            }
            return series.map((entry, s) => {
                const value = valueOf(row, entry.key);
                const left = start + s * (barWidth + gap);
                // Below zero the bar hangs down, rounded at its lower end.
                const d = value >= 0 ? barPath(left, y(value), barWidth, y(0), true) : y(value) > y(0) ? flipped(left, y(0), barWidth, y(value)) : "";
                return d ? <path key={`${i}-${s}`} d={d} fill={colors[s]} /> : null;
            });
        });

    // Where each series sits at each row: stacked areas pile up, everything else is the value itself.
    const stackTop = (i: number, s: number) =>
        stacked ? series.slice(0, s + 1).reduce((sum, entry) => sum + Math.max(0, valueOf(data[i], entry.key)), 0) : valueOf(data[i], series[s]!.key);
    const baseline = y(Math.max(low, 0));

    const areas = () =>
        series.map((entry, s) => {
            const top = data.map((_, i) => [x(i), y(stackTop(i, s))] as [number, number]);
            if (!top.length) return null;
            const edge = linePath(top, curved);
            const bottom =
                stacked && s > 0
                    ? `L${linePath(data.map((_, i) => [x(i), y(stackTop(i, s - 1))] as [number, number]).reverse(), curved).slice(1)}`
                    : `L${top[top.length - 1]![0].toFixed(1)} ${baseline}L${top[0]![0].toFixed(1)} ${baseline}`;
            return (
                <g key={entry.key}>
                    <path className={cx("ow-chart__fill", !stacked && "ow-chart__fill--overlay")} d={`${edge}${bottom}Z`} fill={colors[s]} />
                    <path className="ow-chart__edge" d={edge} stroke={colors[s]} />
                    {count === 1 ? <circle className="ow-chart__point" cx={top[0]![0]} cy={top[0]![1]} r={4} fill={colors[s]} /> : null}
                </g>
            );
        });

    const lines = () =>
        series.map((entry, s) => {
            const points = data.map((row, i) => [x(i), y(valueOf(row, entry.key))] as [number, number]);
            const line = linePath(points, curved);
            return (
                <g key={entry.key}>
                    {area && points.length ? (
                        <path
                            className="ow-chart__area"
                            d={`${line}L${points[points.length - 1]![0].toFixed(1)} ${y(Math.max(low, 0))}L${points[0]![0].toFixed(1)} ${y(Math.max(low, 0))}Z`}
                            fill={colors[s]}
                        />
                    ) : null}
                    <path className="ow-chart__line" d={line} stroke={colors[s]} />
                    {count === 1 ? <circle className="ow-chart__point" cx={points[0]![0]} cy={points[0]![1]} r={4} fill={colors[s]} /> : null}
                </g>
            );
        });

    const onRight = shown !== null && x(shown) > width / 2;

    return (
        <figure className={cx("ow-chart", `ow-chart--${kind}`, className)}>
            {legend ? (
                <ChartLegend items={series.map((entry, s) => ({ label: entry.label, color: colors[s]! }))} shape={kind === "line" ? "line" : "square"} />
            ) : null}
            <div
                ref={plotRef}
                className="ow-chart__plot"
                style={{ height }}
                tabIndex={count ? 0 : undefined}
                role="group"
                aria-label={`${label}. Use the left and right arrow keys to read each point.`}
                onKeyDown={onKeyDown}
                onFocus={(event) => {
                    if (event.target === event.currentTarget) setActive((current) => current ?? count - 1);
                }}
                onBlur={() => setActive(null)}
            >
                {width > 0 ? (
                    <svg width={width} height={height} aria-hidden="true" className="ow-chart__svg">
                        {ticks.map((tick, t) => (
                            <g key={tick}>
                                <line
                                    className={tick === 0 ? "ow-chart__baseline" : "ow-chart__grid"}
                                    x1={margin.left}
                                    x2={width - margin.right}
                                    y1={Math.round(y(tick)) + 0.5}
                                    y2={Math.round(y(tick)) + 0.5}
                                />
                                <text className="ow-chart__tick" x={margin.left - 10} y={y(tick)} dy="0.32em" textAnchor="end">
                                    {tickLabels[t]}
                                </text>
                            </g>
                        ))}
                        {labelled.map((i) => (
                            <text
                                key={i}
                                className="ow-chart__tick"
                                x={x(i)}
                                y={height - 6}
                                textAnchor={
                                    kind !== "bar" && count > 1 && i === 0 ? "start" : kind !== "bar" && count > 1 && i === count - 1 ? "end" : "middle"
                                }
                            >
                                {indexLabels[i]}
                            </text>
                        ))}
                        {kind === "bar" && shown !== null ? (
                            <rect className="ow-chart__band" x={x(shown) - band / 2} y={margin.top} width={band} height={plotHeight} rx={6} />
                        ) : null}
                        {kind === "bar" ? bars() : kind === "area" ? areas() : lines()}
                        {kind !== "bar" && shown !== null ? (
                            <>
                                <line className="ow-chart__crosshair" x1={x(shown)} x2={x(shown)} y1={margin.top} y2={margin.top + plotHeight} />
                                {series.map((entry, s) => (
                                    <circle
                                        key={entry.key}
                                        className="ow-chart__point"
                                        cx={x(shown)}
                                        cy={y(kind === "area" ? stackTop(shown, s) : valueOf(data[shown], entry.key))}
                                        r={4}
                                        fill={colors[s]}
                                    />
                                ))}
                            </>
                        ) : null}
                        <rect
                            className="ow-chart__hit"
                            x={margin.left}
                            y={margin.top}
                            width={plotWidth}
                            height={plotHeight}
                            onPointerMove={pick}
                            onPointerDown={pick}
                            onPointerLeave={() => setActive(null)}
                        />
                    </svg>
                ) : null}

                {shown !== null && width > 0 ? (
                    <div className="ow-chart__readout" style={onRight ? { right: width - x(shown) + 12 } : { left: x(shown) + 12 }} aria-hidden="true">
                        <span className="ow-chart__readout-title">{indexLabels[shown]}</span>
                        {series.map((entry, s) => (
                            <span key={entry.key} className="ow-chart__readout-row">
                                <span className={`ow-chart__key ow-chart__key--${kind === "line" ? "line" : "square"}`} style={{ background: colors[s] }} />
                                <span className="ow-chart__readout-label">{entry.label}</span>
                                <strong>{formatValue(valueOf(data[shown], entry.key))}</strong>
                            </span>
                        ))}
                    </div>
                ) : null}
                <span className="ow-visually-hidden" aria-live="polite">
                    {shown !== null ? describe(shown) : ""}
                </span>
            </div>
            <ChartTable
                caption={label}
                head={["", ...series.map((entry) => entry.label)]}
                rows={data.map((row, i) => [indexLabels[i]!, ...series.map((entry) => formatValue(valueOf(row, entry.key)))])}
            />
        </figure>
    );
}

/** A bar below zero: square at the baseline, rounded at its lower end. */
function flipped(x: number, top: number, width: number, bottom: number) {
    const height = bottom - top;
    const r = Math.min(radius, width / 2, height);
    return `M${x} ${top}V${bottom - r}Q${x} ${bottom} ${x + r} ${bottom}H${x + width - r}Q${x + width} ${bottom} ${x + width} ${bottom - r}V${top}Z`;
}
