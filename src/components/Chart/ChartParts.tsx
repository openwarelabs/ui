import type { ReactNode } from "react";

/** The series' names, each beside its colour, above the plot. */
export function ChartLegend({ items, shape }: { items: Array<{ label: ReactNode; color: string; value?: ReactNode }>; shape: "line" | "square" }) {
    return (
        <ul className="ow-chart__legend">
            {items.map((item, i) => (
                <li key={i} className="ow-chart__legend-item">
                    <span className={`ow-chart__key ow-chart__key--${shape}`} style={{ background: item.color }} aria-hidden="true" />
                    <span className="ow-chart__legend-label">{item.label}</span>
                    {item.value !== undefined ? <span className="ow-chart__legend-value">{item.value}</span> : null}
                </li>
            ))}
        </ul>
    );
}

/** Every number in the chart as a table, for screen readers: the chart's text alternative. */
export function ChartTable({ caption, head, rows }: { caption: string; head: string[]; rows: string[][] }) {
    return (
        <table className="ow-visually-hidden">
            <caption>{caption}</caption>
            <thead>
                <tr>
                    {head.map((cell, i) => (
                        <th key={i} scope="col">
                            {cell}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, r) => (
                    <tr key={r}>
                        {row.map((cell, i) =>
                            i === 0 ? (
                                <th key={i} scope="row">
                                    {cell}
                                </th>
                            ) : (
                                <td key={i}>{cell}</td>
                            ),
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
