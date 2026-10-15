import { CartesianChart } from "./Cartesian";
import type { BarChartProps } from "./Chart.types";

/**
 * Bars from a zero baseline, for comparing amounts: side by side, or stacked to show the parts of a whole. Hover,
 * or focus it and use the arrow keys, to read each bar; screen readers get every number as a table.
 */
export function BarChart(props: BarChartProps) {
    return <CartesianChart kind="bar" {...props} />;
}
