import { Card, DonutChart, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "DonutChart",
    category: "Data display",
    description:
        "Parts of a whole as a ring, with the total in the middle and each part's value and share in the legend beside it.",
    source: "components/Chart/DonutChart.tsx",
    props: ["DonutChartProps", "DonutChartSlice"],
    keyboard: [
        ["Arrow keys", "Move from slice to slice and read each one out."],
        ["Escape", "Shows the total again."],
    ],
    notes: [
        "It suits two to six parts. Past eight, fold the smallest into an Other slice; to compare amounts rather than shares, use a BarChart.",
        "The legend gives every slice's value and share, so nothing depends on telling colours or angles apart.",
        "Screen readers get the values and shares as a table captioned with label.",
    ],
    related: ["BarChart", "Meter"],
    since: "0.12.0",
};

const euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

const spend = [
    { label: "Software", value: 412.6 },
    { label: "Streaming", value: 58.97 },
    { label: "Cloud storage", value: 31.98 },
    { label: "News", value: 24.99 },
    { label: "Other", value: 18.5 },
];

/** Monthly subscriptions by category. */
export function Spend() {
    return (
        <Card>
            <Stack gap="lg">
                <Text variant="card-title">Subscriptions this month</Text>
                <DonutChart
                    data={spend}
                    label="Subscription spend this month by category"
                    formatValue={(value) => euro.format(value)}
                />
            </Stack>
        </Card>
    );
}
Spend.layout = { ground: "canvas" };

/** Two parts, smaller, with words of your own in the middle. */
export function TwoParts() {
    return (
        <DonutChart
            data={[
                { label: "Used", value: 68 },
                { label: "Free", value: 32, color: "var(--ow-meter-track)" },
            ]}
            label="Storage: 68 GB used of 100 GB"
            formatValue={(value) => `${value} GB`}
            center="68%"
            centerLabel="used"
            size={140}
        />
    );
}
