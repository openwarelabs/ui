import { Card, PieChart, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "PieChart",
    category: "Data display",
    description:
        "Parts of a whole as a disc, each slice's share written on it and its value and share in the legend beside it.",
    source: "components/Chart/PieChart.tsx",
    props: ["PieChartProps", "PieChartSlice"],
    keyboard: [
        ["Arrow keys", "Move from slice to slice and read each one out."],
        ["Escape", "Hides the readout."],
    ],
    notes: [
        "It suits two to six parts. Past eight, fold the smallest into an Other slice; to compare amounts rather than shares, use a BarChart. For a total in the middle, use DonutChart.",
        "Shares are written on slices of about 8% and up, on a small surface-coloured pill so they read on any slice colour. Smaller slices keep their share in the legend and the readout.",
        "The legend gives every slice's value and share, so nothing depends on telling colours or angles apart.",
        "Screen readers get the values and shares as a table captioned with label.",
    ],
    related: ["DonutChart", "BarChart", "Meter"],
    since: "0.18.0",
};

const euro = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
});

const regions = [
    { label: "Ireland", value: 418000 },
    { label: "United Kingdom", value: 296000 },
    { label: "Germany", value: 187000 },
    { label: "France", value: 112000 },
    { label: "Rest of Europe", value: 94000 },
    { label: "Other", value: 31000 },
];

/** Revenue by region, with the shares on the slices. */
export function Regions() {
    return (
        <Card>
            <Stack gap="lg">
                <Text variant="card-title">Revenue by region</Text>
                <PieChart
                    data={regions}
                    label="Revenue by region this year"
                    formatValue={(value) => euro.format(value)}
                    size={200}
                />
            </Stack>
        </Card>
    );
}
Regions.layout = { ground: "canvas" };

const devices = [
    { label: "Phone", value: 6420 },
    { label: "Desktop", value: 3180 },
    { label: "Tablet", value: 640 },
];

/** Three slices, the first starting at 9 o'clock, without labels on the slices. */
export function Devices() {
    return (
        <PieChart
            data={devices}
            label="Sessions by device over the last 7 days"
            startAngle={-90}
            labels={false}
            size={140}
        />
    );
}

const votes = [
    { label: "Aoife Byrne", value: 1284 },
    { label: "Cian Murphy", value: 1067 },
    { label: "Niamh Walsh", value: 912 },
    { label: "Oisín Doyle", value: 455 },
];

/** No legend: the chart carries the shares and the readout the values. */
export function Compact() {
    return (
        <Card>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Committee vote</Text>
                    <Text variant="caption">3,718 ballots</Text>
                </Stack>
                <PieChart
                    data={votes}
                    label="Committee vote: first preferences by candidate"
                    legend={false}
                    size={160}
                />
            </Stack>
        </Card>
    );
}
Compact.layout = { ground: "canvas" };
