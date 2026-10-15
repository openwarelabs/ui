import { CartesianChart } from "./Cartesian";
import type { LineChartProps } from "./Chart.types";

/**
 * Lines over time or another ordered x axis, for trends. Hover, or focus it and use the arrow keys, to read each
 * point; screen readers get every number as a table.
 */
export function LineChart(props: LineChartProps) {
    return <CartesianChart kind="line" {...props} />;
}
