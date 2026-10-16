import { useState, type KeyboardEvent } from "react";

import { cx } from "@/utils/cx";
import { arcPath, arcs, colorOf, defaultValue, textWidth, wholePath } from "./chartUtils";
import { ChartLegend, ChartTable } from "./ChartParts";
import type { PieChartProps } from "./Chart.types";

const percent = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 });
/** A share below this has no room for its label on the slice. */
const minLabelled = 0.08;

/**
 * Parts of a whole as a disc, each slice's share written on it and its value beside it. Best with two to six
 * slices; hover a slice, or focus it and use the arrow keys, to read it. For a total in the middle, use DonutChart.
 */
export function PieChart({ data, label, formatValue = defaultValue, labels = true, startAngle = 0, size = 180, legend = true, className }: PieChartProps) {
    const [active, setActive] = useState<number | null>(null);
    const slices = data.map((slice, i) => ({ ...slice, value: Math.max(0, slice.value), fill: colorOf(slice.color, i) }));
    const total = slices.reduce((sum, slice) => sum + slice.value, 0);
    const share = (value: number) => percent.format(total ? value / total : 0);

    const radius = size / 2;
    const angles = arcs(
        slices.map((slice) => slice.value),
        (startAngle * Math.PI) / 180,
    );
    const divided = slices.filter((slice) => slice.value > 0).length > 1;
    const at = (r: number, angle: number) => ({ x: radius + r * Math.sin(angle), y: radius - r * Math.cos(angle) });

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
    const shownAt = active === null ? null : at(radius * 0.62, (angles[active]!.start + angles[active]!.end) / 2);

    return (
        <figure className={cx("ow-chart", "ow-chart--donut", "ow-chart--pie", className)}>
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
                    {total === 0 ? <circle className="ow-chart__empty-disc" cx={radius} cy={radius} r={radius} /> : null}
                    {slices.map((slice, i) => {
                        const { start, end } = angles[i]!;
                        if (end - start <= 0) return null;
                        const whole = end - start >= Math.PI * 2 - 1e-6;
                        return (
                            <path
                                key={i}
                                d={whole ? wholePath(radius, radius, radius, 0) : arcPath(radius, radius, radius, 0, start, end)}
                                fill={slice.fill}
                                className={cx("ow-chart__slice", divided && "ow-chart__slice--cut", active !== null && active !== i && "ow-chart__slice--dim")}
                                onPointerEnter={() => setActive(i)}
                            />
                        );
                    })}
                    {labels && total > 0
                        ? slices.map((slice, i) => {
                              if (slice.value / total < minLabelled) return null;
                              const text = share(slice.value);
                              const { start, end } = angles[i]!;
                              const { x, y } = at(radius * 0.62, (start + end) / 2);
                              const width = Math.ceil(textWidth(text)) + 12;
                              return (
                                  <g key={i} className={cx("ow-chart__slice-label", active !== null && active !== i && "ow-chart__slice--dim")}>
                                      <rect x={x - width / 2} y={y - 9} width={width} height={18} rx={9} />
                                      <text x={x} y={y} dy="0.33em" textAnchor="middle">
                                          {text}
                                      </text>
                                  </g>
                              );
                          })
                        : null}
                </svg>
                {shown && shownAt ? (
                    <div className="ow-chart__readout ow-chart__readout--pie" style={{ left: shownAt.x, top: shownAt.y }} aria-hidden="true">
                        <span className="ow-chart__readout-row">
                            <span className="ow-chart__key ow-chart__key--square" style={{ background: shown.fill }} />
                            <span className="ow-chart__readout-label">{shown.label}</span>
                            <strong>{formatValue(shown.value)}</strong>
                        </span>
                        <span className="ow-chart__readout-title">
                            {share(shown.value)} of {formatValue(total)}
                        </span>
                    </div>
                ) : null}
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
