import { Card, LineChart, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "LineChart",
    category: "Data display",
    description:
        "Lines along an ordered x axis, usually time, for trends. Hover a point, or focus the chart and use the arrow keys, to read it.",
    source: "components/Chart/LineChart.tsx",
    props: ["LineChartProps", "ChartSeries"],
    keyboard: [
        ["Left / Right", "Moves to the previous or next point and reads it out."],
        ["Home / End", "The first or last point."],
        ["Escape", "Hides the readout."],
    ],
    notes: [
        "Screen readers get every number as a table captioned with label, and each point read out as you move with the arrow keys.",
        "Series take the chart palette's slots in order (--ow-chart-1 to 8), checked for colour-blind readers in both themes. Give each series a fixed color when a filter can hide some, so the rest don't change colour.",
        "There's always one y axis. To compare two measures on different scales, use two charts.",
        "With more than one series there's a legend, so no line is told apart by colour alone.",
        'The y axis starts at zero. Data is a list of rows; dates in the index are shown as "12 Oct" unless you pass formatIndex.',
    ],
    related: ["BarChart", "Sparkline", "Stat"],
    since: "0.12.0",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const visits = [4200, 4800, 5100, 4900, 6200, 7100, 6800, 7400, 8300, 9100, 9800, 11200];
const traffic = months.map((month, i) => ({
    month,
    visits: visits[i],
    signups: Math.round(visits[i]! * (0.031 + i * 0.0012)),
}));

/** One series, with a wash under the line. */
export function Single() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Visits</Text>
                    <Text variant="caption">This year, per month</Text>
                </Stack>
                <LineChart
                    data={traffic}
                    index="month"
                    series={[{ key: "visits", label: "Visits" }]}
                    label="Visits per month this year"
                    area
                />
            </Stack>
        </Card>
    );
}
Single.layout = { fill: true, ground: "canvas" };

const daily = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.UTC(2026, 8, 16 + i));
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    return {
        date,
        web: Math.round((weekend ? 820 : 1400) + i * 18 + Math.sin(i) * 90),
        ios: Math.round((weekend ? 640 : 760) + i * 11 + Math.cos(i * 1.3) * 60),
        android: Math.round((weekend ? 380 : 520) + i * 6 + Math.sin(i * 0.7) * 40),
    };
});

/** Three series over 30 days, curved, with a legend. */
export function Series() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Active users by platform</Text>
                    <Text variant="caption">The last 30 days</Text>
                </Stack>
                <LineChart
                    data={daily}
                    index="date"
                    series={[
                        { key: "web", label: "Web" },
                        { key: "ios", label: "iOS" },
                        { key: "android", label: "Android" },
                    ]}
                    label="Daily active users by platform over the last 30 days"
                    curved
                    height={260}
                />
            </Stack>
        </Card>
    );
}
Series.layout = { fill: true, ground: "canvas" };
