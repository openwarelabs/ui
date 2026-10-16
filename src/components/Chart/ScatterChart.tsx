import { useState, type KeyboardEvent, type PointerEvent } from "react";

import { cx } from "@/utils/cx";
import { colorOf, defaultTick, defaultValue, niceTicks, textWidth, useWidth } from "./chartUtils";
import { ChartLegend, ChartTable } from "./ChartParts";
import type { ChartRow, ScatterChartProps } from "./Chart.types";

const minRadius = 4;
const dotRadius = 5;

const numberOf = (row: ChartRow, key: string) => {
    const value = row[key];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
};

/** A round span of ticks that covers the numbers; a single number gets a little room either side. */
const ticksFor = (values: number[]) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? niceTicks(min - Math.max(1, Math.abs(min) / 10), max + Math.max(1, Math.abs(max) / 10), false) : niceTicks(min, max, false);
};

/**
 * One point per row at an x and a y, to show how two numbers relate; `series` colours groups of points and `size`
 * makes them bubbles. Hover a point, or focus the chart and use the arrow keys, to read it; screen readers get
 * every point as a table.
 */
export function ScatterChart(props: ScatterChartProps) {
    const {
        data,
        x: xKey,
        y: yKey,
        series: seriesKey,
        colors: fixedColors,
        size: sizeKey,
        name: nameKey,
        label,
        xLabel = xKey,
        yLabel = yKey,
        sizeLabel = sizeKey ?? "",
        height = 280,
        formatX = defaultValue,
        formatY = defaultValue,
        formatSize = defaultValue,
        formatTick = defaultTick,
        className,
    } = props;

    const [plotRef, width] = useWidth<HTMLDivElement>();
    const [active, setActive] = useState<number | null>(null);

    // Only rows with a number for both axes are points. Series are the distinct values of the series key, in order.
    const points = data.flatMap((row, i) => {
        const px = numberOf(row, xKey);
        const py = numberOf(row, yKey);
        if (px === null || py === null) return [];
        const group = seriesKey ? String(row[seriesKey] ?? "") : "";
        return [{ row, i, x: px, y: py, size: sizeKey ? Math.max(0, numberOf(row, sizeKey) ?? 0) : null, group }];
    });
    const groups = seriesKey ? [...new Set(points.map((point) => point.group))] : [];
    const colorFor = (group: string) => colorOf(fixedColors?.[group], Math.max(0, groups.indexOf(group)));
    const legend = props.legend ?? groups.length > 1;
    const nameOf = (point: (typeof points)[number]) => {
        const name = nameKey ? point.row[nameKey] : undefined;
        if (name !== undefined && name !== null && name !== "") return String(name);
        return seriesKey ? point.group : `Point ${point.i + 1}`;
    };
    const count = points.length;

    const xTicks = count ? ticksFor(points.map((point) => point.x)) : niceTicks(0, 1);
    const yTicks = count ? ticksFor(points.map((point) => point.y)) : niceTicks(0, 1);
    const xTickLabels = xTicks.map(formatTick);
    const yTickLabels = yTicks.map(formatTick);

    // Bubbles grow with the square root of their size, so their area follows the number.
    const maxSize = Math.max(0, ...points.map((point) => point.size ?? 0));
    const maxRadius = sizeKey ? Math.max(10, Math.min(24, Math.round(height * 0.07))) : dotRadius;
    const radiusOf = (point: (typeof points)[number]) =>
        point.size === null || !maxSize ? dotRadius : minRadius + (maxRadius - minRadius) * Math.sqrt(point.size / maxSize);

    const margin = {
        top: maxRadius + 4,
        right: Math.max(maxRadius + 2, Math.ceil(textWidth(xTickLabels[xTickLabels.length - 1] ?? "") / 2) + 2),
        bottom: 42,
        left: Math.ceil(Math.max(...yTickLabels.map(textWidth))) + 30,
    };
    const plotWidth = Math.max(0, width - margin.left - margin.right);
    const plotHeight = Math.max(0, height - margin.top - margin.bottom);
    const [xLow, xHigh] = [xTicks[0]!, xTicks[xTicks.length - 1]!];
    const [yLow, yHigh] = [yTicks[0]!, yTicks[yTicks.length - 1]!];
    const sx = (value: number) => margin.left + ((value - xLow) / (xHigh - xLow || 1)) * plotWidth;
    const sy = (value: number) => margin.top + plotHeight - ((value - yLow) / (yHigh - yLow || 1)) * plotHeight;

    // Enough x labels to fill the axis without touching.
    const xStep = xTicks.length > 1 ? plotWidth / (xTicks.length - 1) : plotWidth;
    const every = Math.max(1, Math.ceil((Math.max(0, ...xTickLabels.map(textWidth)) + 14) / (xStep || 1)));

    // The arrow keys walk the points from left to right.
    const order = points.map((_, p) => p).sort((a, b) => points[a]!.x - points[b]!.x || points[a]!.y - points[b]!.y);

    const pick = (event: PointerEvent<SVGRectElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        const px = event.clientX - box.left + margin.left;
        const py = event.clientY - box.top + margin.top;
        let nearest: number | null = null;
        let best = Infinity;
        points.forEach((point, p) => {
            const distance = Math.hypot(sx(point.x) - px, sy(point.y) - py);
            if (distance < best && distance <= Math.max(24, radiusOf(point) + 12)) {
                best = distance;
                nearest = p;
            }
        });
        setActive(nearest);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!count) return;
        const at = active === null ? order.length - 1 : order.indexOf(active);
        const moves: Record<string, number> = { ArrowLeft: at - 1, ArrowDown: at - 1, ArrowRight: at + 1, ArrowUp: at + 1, Home: 0, End: order.length - 1 };
        if (event.key === "Escape") return setActive(null);
        if (!(event.key in moves)) return;
        event.preventDefault();
        setActive(order[Math.min(order.length - 1, Math.max(0, moves[event.key]!))]!);
    };

    const shown = active !== null && active < count ? points[active]! : null;
    const describe = (point: (typeof points)[number]) =>
        `${nameOf(point)}: ${xLabel} ${formatX(point.x)}, ${yLabel} ${formatY(point.y)}${point.size !== null ? `, ${sizeLabel} ${formatSize(point.size)}` : ""}.`;

    const dot = (point: (typeof points)[number], p: number) => (
        <circle
            key={p}
            className={cx("ow-chart__dot", shown === point && "ow-chart__dot--active")}
            cx={sx(point.x)}
            cy={sy(point.y)}
            r={radiusOf(point) + (shown === point ? 2 : 0)}
            fill={colorFor(point.group)}
        />
    );

    return (
        <figure className={cx("ow-chart", "ow-chart--scatter", className)}>
            {legend && groups.length ? <ChartLegend items={groups.map((group) => ({ label: group, color: colorFor(group) }))} shape="dot" /> : null}
            <div
                ref={plotRef}
                className="ow-chart__plot"
                style={{ height }}
                tabIndex={count ? 0 : undefined}
                role="group"
                aria-label={`${label}. Use the left and right arrow keys to read each point.`}
                onKeyDown={onKeyDown}
                onFocus={(event) => {
                    if (event.target === event.currentTarget) setActive((current) => current ?? order[order.length - 1] ?? null);
                }}
                onBlur={() => setActive(null)}
            >
                {width > 0 ? (
                    <svg width={width} height={height} aria-hidden="true" className="ow-chart__svg">
                        {yTicks.map((tick, t) => (
                            <g key={tick}>
                                <line
                                    className={t === 0 ? "ow-chart__baseline" : "ow-chart__grid"}
                                    x1={margin.left}
                                    x2={width - margin.right}
                                    y1={Math.round(sy(tick)) + 0.5}
                                    y2={Math.round(sy(tick)) + 0.5}
                                />
                                <text className="ow-chart__tick" x={margin.left - 10} y={sy(tick)} dy="0.32em" textAnchor="end">
                                    {yTickLabels[t]}
                                </text>
                            </g>
                        ))}
                        {xTicks.map((tick, t) => (
                            <g key={tick}>
                                <line
                                    className={t === 0 ? "ow-chart__baseline" : "ow-chart__grid"}
                                    x1={Math.round(sx(tick)) + 0.5}
                                    x2={Math.round(sx(tick)) + 0.5}
                                    y1={margin.top}
                                    y2={margin.top + plotHeight}
                                />
                                {t % every === 0 ? (
                                    <text className="ow-chart__tick" x={sx(tick)} y={height - 22} textAnchor="middle">
                                        {xTickLabels[t]}
                                    </text>
                                ) : null}
                            </g>
                        ))}
                        <text className="ow-chart__axis-title" x={margin.left + plotWidth / 2} y={height - 4} textAnchor="middle">
                            {xLabel}
                        </text>
                        <text
                            className="ow-chart__axis-title"
                            x={10}
                            y={margin.top + plotHeight / 2}
                            textAnchor="middle"
                            transform={`rotate(-90 10 ${margin.top + plotHeight / 2})`}
                        >
                            {yLabel}
                        </text>
                        {points.map((point, p) => (shown === point ? null : dot(point, p)))}
                        {shown ? dot(shown, -1) : null}
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

                {shown && width > 0 ? (
                    <div
                        className="ow-chart__readout ow-chart__readout--free"
                        style={{
                            ...(sx(shown.x) > width / 2 ? { right: width - sx(shown.x) + 12 } : { left: sx(shown.x) + 12 }),
                            ...(sy(shown.y) > height / 2 ? { bottom: height - sy(shown.y) } : { top: sy(shown.y) }),
                        }}
                        aria-hidden="true"
                    >
                        <span className="ow-chart__readout-title">
                            <span className="ow-chart__key ow-chart__key--dot" style={{ background: colorFor(shown.group) }} />
                            {nameOf(shown)}
                        </span>
                        <span className="ow-chart__readout-row">
                            <span className="ow-chart__readout-label">{xLabel}</span>
                            <strong>{formatX(shown.x)}</strong>
                        </span>
                        <span className="ow-chart__readout-row">
                            <span className="ow-chart__readout-label">{yLabel}</span>
                            <strong>{formatY(shown.y)}</strong>
                        </span>
                        {shown.size !== null ? (
                            <span className="ow-chart__readout-row">
                                <span className="ow-chart__readout-label">{sizeLabel}</span>
                                <strong>{formatSize(shown.size)}</strong>
                            </span>
                        ) : null}
                    </div>
                ) : null}
                <span className="ow-visually-hidden" aria-live="polite">
                    {shown ? describe(shown) : ""}
                </span>
            </div>
            <ChartTable
                caption={label}
                head={["", ...(seriesKey && nameKey ? ["Series"] : []), xLabel, yLabel, ...(sizeKey ? [sizeLabel] : [])]}
                rows={points.map((point) => [
                    nameOf(point),
                    ...(seriesKey && nameKey ? [point.group] : []),
                    formatX(point.x),
                    formatY(point.y),
                    ...(point.size !== null ? [formatSize(point.size)] : []),
                ])}
            />
        </figure>
    );
}
