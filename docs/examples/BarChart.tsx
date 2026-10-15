import { BarChart, Card, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "BarChart",
    category: "Data display",
    description:
        "Bars from a zero baseline for comparing amounts: side by side, or stacked to show what each total is made of.",
    source: "components/Chart/BarChart.tsx",
    props: ["BarChartProps", "ChartSeries"],
    keyboard: [
        ["Left / Right", "Moves to the previous or next bar and reads it out."],
        ["Home / End", "The first or last bar."],
        ["Escape", "Hides the readout."],
    ],
    notes: [
        "Screen readers get every number as a table captioned with label, and each bar read out as you move with the arrow keys.",
        "Bars are at most 24px wide with a 2px gap between them, rounded at the end that carries the value and square at the baseline.",
        "Stacked segments are only positive amounts; use side by side for numbers that can go below zero.",
        "Series take the chart palette's slots in order; past eight, fold the smallest into an Other series.",
    ],
    related: ["LineChart", "DonutChart", "Meter"],
    since: "0.12.0",
};

const euro = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
});
const formatEuro = (value: number) => euro.format(value);

const revenue = [
    { quarter: "Q1", starter: 12400, team: 31800, enterprise: 22000 },
    { quarter: "Q2", starter: 13900, team: 36200, enterprise: 26500 },
    { quarter: "Q3", starter: 15100, team: 41900, enterprise: 33000 },
    { quarter: "Q4", starter: 16800, team: 47300, enterprise: 41200 },
];
const plans = [
    { key: "starter", label: "Starter" },
    { key: "team", label: "Team" },
    { key: "enterprise", label: "Enterprise" },
];

/** Side by side: each plan's revenue per quarter. */
export function Grouped() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Text variant="card-title">Revenue by plan</Text>
                <BarChart
                    data={revenue}
                    index="quarter"
                    series={plans}
                    label="Revenue by plan per quarter"
                    formatValue={formatEuro}
                />
            </Stack>
        </Card>
    );
}
Grouped.layout = { fill: true, ground: "canvas" };

/** Stacked: what each quarter's total is made of. */
export function Stacked() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Text variant="card-title">Revenue, all plans</Text>
                <BarChart
                    data={revenue}
                    index="quarter"
                    series={plans}
                    label="Revenue per quarter, stacked by plan"
                    formatValue={formatEuro}
                    stacked
                />
            </Stack>
        </Card>
    );
}
Stacked.layout = { fill: true, ground: "canvas" };

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const deploys = [14, 19, 17, 22, 11, 3, 2];

/** One series: deploys per weekday. */
export function Single() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Deploys by weekday</Text>
                    <Text variant="caption">The last four weeks</Text>
                </Stack>
                <BarChart
                    data={weekdays.map((day, i) => ({ day, deploys: deploys[i] }))}
                    index="day"
                    series={[{ key: "deploys", label: "Deploys" }]}
                    label="Deploys per weekday over the last four weeks"
                    height={200}
                />
            </Stack>
        </Card>
    );
}
Single.layout = { fill: true, ground: "canvas" };
