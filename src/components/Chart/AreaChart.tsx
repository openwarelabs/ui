import { CartesianChart } from "./Cartesian";
import type { AreaChartProps } from "./Chart.types";

/**
 * Filled areas over time or another ordered x axis: stacked, so the top edge is the total and each band one part of
 * it, or overlaid and translucent to compare shapes. Hover, or focus it and use the arrow keys, to read each point;
 * screen readers get every number as a table.
 */
export function AreaChart(props: AreaChartProps) {
    return <CartesianChart kind="area" {...props} />;
}
