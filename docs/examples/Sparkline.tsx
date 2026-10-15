import { Card, Sparkline, Stack, Table, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "Sparkline",
    category: "Data display",
    description:
        "A small line with no axes for the shape of a trend: beside a number, or in a table cell.",
    source: "components/Chart/Sparkline.tsx",
    notes: [
        "It's an image to screen readers, so its aria-label says what it shows: the period, and where it starts and ends.",
        "It stretches to its width; the end point stays round.",
        "For the actual numbers, with axes and a readout, use a LineChart.",
    ],
    related: ["LineChart", "Stat"],
    since: "0.12.0",
};

const signups = [12, 15, 14, 18, 17, 22, 21, 26, 25, 31, 29, 35, 38, 36, 42, 48];

/** Beside a number. */
export function WithNumber() {
    return (
        <Card>
            <Stack direction="row" gap="2xl" align="end">
                <Stack gap="3xs">
                    <Text variant="caption">Sign-ups this week</Text>
                    <Text variant="section-title">48</Text>
                </Stack>
                <Sparkline
                    data={signups}
                    aria-label="Sign-ups over the last 16 weeks, rising from 12 to 48"
                    width={140}
                    height={40}
                />
            </Stack>
        </Card>
    );
}
WithNumber.layout = { ground: "canvas" };

const services = [
    {
        name: "api",
        latency: [120, 118, 125, 140, 132, 128, 121, 119],
        color: 1 as const,
        text: "steady around 120 ms",
    },
    {
        name: "web",
        latency: [80, 84, 79, 95, 120, 160, 150, 140],
        color: 2 as const,
        text: "rising from 80 to 140 ms",
    },
    {
        name: "worker",
        latency: [300, 280, 260, 240, 230, 210, 205, 190],
        color: 3 as const,
        text: "falling from 300 to 190 ms",
    },
];

/** In table cells, each in its own colour. */
export function InTable() {
    return (
        <Table
            caption="Latency by service"
            hideCaption
            rowKey="name"
            columns={[
                { key: "name", header: "Service" },
                {
                    key: "trend",
                    header: "Last 8 hours",
                    render: (service) => (
                        <Sparkline
                            data={service.latency}
                            color={service.color}
                            area={false}
                            aria-label={`Latency of ${service.name}, ${service.text}`}
                        />
                    ),
                },
            ]}
            rows={services}
        />
    );
}
InTable.layout = { fill: true };
