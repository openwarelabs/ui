import { AreaChart, Card, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "AreaChart",
    category: "Data display",
    description:
        "Filled areas along an ordered x axis, usually time: stacked, so the top edge is the total and each band one part of it, or overlaid to compare shapes.",
    source: "components/Chart/AreaChart.tsx",
    props: ["AreaChartProps", "ChartSeries"],
    keyboard: [
        ["Left / Right", "Moves to the previous or next point and reads it out."],
        ["Home / End", "The first or last point."],
        ["Escape", "Hides the readout."],
    ],
    notes: [
        "Screen readers get every number as a table captioned with label, and each point read out as you move with the arrow keys.",
        "Stacked (the default) suits parts of a total that changes over time: traffic by source, revenue by plan. The readout gives each series' own number, not the running total. Only positive amounts stack.",
        "stacked={false} overlays translucent areas from the baseline, for comparing the shape of a few series; past three they get hard to tell apart, so use a LineChart instead.",
        "Series take the chart palette's slots in order (--ow-chart-1 to 8). Put the steadiest series at the bottom of a stack, so the ones above it have a flat base to read against.",
        "For one series with a light wash under its line rather than a solid area, use LineChart with area.",
    ],
    related: ["LineChart", "BarChart", "Sparkline"],
    since: "0.18.0",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const search = [3100, 3300, 3600, 3500, 3900, 4200, 4100, 4400, 4900, 5300, 5600, 6100];
const direct = [1800, 1900, 1950, 2100, 2200, 2300, 2250, 2400, 2600, 2700, 2900, 3100];
const social = [600, 900, 700, 1200, 1500, 1300, 1900, 2200, 1800, 2600, 3000, 3400];
const referral = [400, 420, 450, 500, 480, 560, 600, 620, 700, 740, 800, 860];
const traffic = months.map((month, i) => ({
    month,
    search: search[i],
    direct: direct[i],
    social: social[i],
    referral: referral[i],
}));

/** Stacked: visits per month, by where they came from. */
export function Stacked() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Visits by source</Text>
                    <Text variant="caption">This year, per month</Text>
                </Stack>
                <AreaChart
                    data={traffic}
                    index="month"
                    series={[
                        { key: "search", label: "Search" },
                        { key: "direct", label: "Direct" },
                        { key: "social", label: "Social" },
                        { key: "referral", label: "Referral" },
                    ]}
                    label="Visits per month this year, stacked by source"
                    curved
                    height={260}
                />
            </Stack>
        </Card>
    );
}
Stacked.layout = { fill: true, ground: "canvas" };

const weeks = Array.from({ length: 16 }, (_, i) => `W${i + 1}`);
const sprint = weeks.map((week, i) => ({
    week,
    opened: Math.round(28 + Math.sin(i * 0.9) * 9 + i * 0.6),
    closed: Math.round(22 + Math.cos(i * 0.7) * 7 + i * 1.1),
}));

/** Overlaid: two translucent areas from the baseline, to compare their shapes. */
export function Overlaid() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Issues opened and closed</Text>
                    <Text variant="caption">Per week, the last 16 weeks</Text>
                </Stack>
                <AreaChart
                    data={sprint}
                    index="week"
                    series={[
                        { key: "opened", label: "Opened" },
                        { key: "closed", label: "Closed", color: 3 },
                    ]}
                    label="Issues opened and closed per week over the last 16 weeks"
                    stacked={false}
                />
            </Stack>
        </Card>
    );
}
Overlaid.layout = { fill: true, ground: "canvas" };

const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.UTC(2026, 8, 16 + i));
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    return { date, storage: Math.round((weekend ? 410 : 470) + i * 6.5 + Math.sin(i * 1.1) * 14) };
});
const gib = (value: number) => `${value} GiB`;

/** One series: a solid area for an amount over time. */
export function Single() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Storage used</Text>
                    <Text variant="caption">The last 30 days</Text>
                </Stack>
                <AreaChart
                    data={days}
                    index="date"
                    series={[{ key: "storage", label: "Storage", color: 7 }]}
                    label="Storage used per day over the last 30 days"
                    formatValue={gib}
                    height={200}
                />
            </Stack>
        </Card>
    );
}
Single.layout = { fill: true, ground: "canvas" };
