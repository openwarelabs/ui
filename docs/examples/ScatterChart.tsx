import { Card, ScatterChart, Stack, Text } from "@openwarelabs/ui";

import type { DocMeta } from "../app/types";

export const meta: DocMeta = {
    title: "ScatterChart",
    category: "Data display",
    description:
        "One point per row at an x and a y, to show how two numbers relate: a series key colours groups of points, a size key makes them bubbles.",
    source: "components/Chart/ScatterChart.tsx",
    props: ["ScatterChartProps"],
    keyboard: [
        [
            "Left / Right",
            "Moves to the previous or next point, from left to right, and reads it out.",
        ],
        ["Home / End", "The first or last point."],
        ["Escape", "Hides the readout."],
    ],
    notes: [
        "Screen readers get every point as a table captioned with label (its name, x, y and size), and each point read out as you move with the arrow keys.",
        "Both axes are numeric and cover the data with round ticks; unlike the other charts they don't have to start at zero, so read the axis labels. Name the axes with xLabel and yLabel; they go under and beside the plot and into the readout.",
        "Hovering picks the nearest point within a few pixels, so points don't have to be hit exactly. Points are ringed in the surface colour so overlapping ones stay apart.",
        "A bubble's area, not its radius, follows its size number. Series take the chart palette's slots in the order they first appear; give fixed colors when a filter can hide some.",
        "Past a few hundred points it's a cloud: aggregate first, or use an ActivityHeatmap or a BarChart of bins.",
    ],
    related: ["LineChart", "BarChart", "ActivityHeatmap"],
    since: "0.18.0",
};

const students = [
    { name: "Aoife", hours: 14, score: 88 },
    { name: "Cian", hours: 6, score: 61 },
    { name: "Niamh", hours: 11, score: 79 },
    { name: "Saoirse", hours: 18, score: 94 },
    { name: "Oisín", hours: 3, score: 52 },
    { name: "Eoin", hours: 9, score: 70 },
    { name: "Róisín", hours: 12, score: 85 },
    { name: "Darragh", hours: 7, score: 58 },
    { name: "Clodagh", hours: 16, score: 90 },
    { name: "Fionn", hours: 10, score: 74 },
    { name: "Gráinne", hours: 5, score: 66 },
    { name: "Tadhg", hours: 13, score: 81 },
    { name: "Méabh", hours: 8, score: 72 },
    { name: "Pádraig", hours: 15, score: 83 },
];

/** One series: study hours against the exam score, each point named. */
export function Single() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Study hours and exam scores</Text>
                    <Text variant="caption">Fourteen students, the week before the exam</Text>
                </Stack>
                <ScatterChart
                    data={students}
                    x="hours"
                    y="score"
                    name="name"
                    xLabel="Hours studied"
                    yLabel="Score"
                    label="Study hours against exam score for fourteen students"
                    formatY={(value) => `${value}%`}
                    height={260}
                />
            </Stack>
        </Card>
    );
}
Single.layout = { fill: true, ground: "canvas" };

const listings = [
    { area: 48, price: 285, type: "Apartment" },
    { area: 62, price: 342, type: "Apartment" },
    { area: 71, price: 395, type: "Apartment" },
    { area: 55, price: 310, type: "Apartment" },
    { area: 84, price: 460, type: "Apartment" },
    { area: 93, price: 505, type: "Apartment" },
    { area: 66, price: 358, type: "Apartment" },
    { area: 102, price: 445, type: "Terraced" },
    { area: 118, price: 498, type: "Terraced" },
    { area: 96, price: 410, type: "Terraced" },
    { area: 131, price: 560, type: "Terraced" },
    { area: 110, price: 472, type: "Terraced" },
    { area: 124, price: 530, type: "Terraced" },
    { area: 142, price: 640, type: "Detached" },
    { area: 168, price: 745, type: "Detached" },
    { area: 185, price: 820, type: "Detached" },
    { area: 156, price: 690, type: "Detached" },
    { area: 203, price: 905, type: "Detached" },
    { area: 177, price: 760, type: "Detached" },
];
const thousands = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
});

/** Three series, coloured by a key in each row, with a legend. */
export function Series() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Asking price by floor area</Text>
                    <Text variant="caption">Listings in Galway this month</Text>
                </Stack>
                <ScatterChart
                    data={listings}
                    x="area"
                    y="price"
                    series="type"
                    xLabel="Floor area (m²)"
                    yLabel="Asking price"
                    label="Asking price against floor area for listings in Galway this month, by property type"
                    formatX={(value) => `${value} m²`}
                    formatY={(value) => thousands.format(value * 1000)}
                    formatTick={(value) => `${value}`}
                    height={300}
                />
            </Stack>
        </Card>
    );
}
Series.layout = { fill: true, ground: "canvas" };

const countries = [
    { country: "Ireland", gdp: 103, life: 82.4, population: 5.2 },
    { country: "Poland", gdp: 22, life: 78.2, population: 37.6 },
    { country: "Germany", gdp: 54, life: 81.1, population: 84.4 },
    { country: "Spain", gdp: 33, life: 83.7, population: 48.3 },
    { country: "Portugal", gdp: 27, life: 81.9, population: 10.5 },
    { country: "Romania", gdp: 18, life: 76.1, population: 19.0 },
    { country: "France", gdp: 46, life: 83.0, population: 68.2 },
    { country: "Italy", gdp: 39, life: 83.6, population: 58.9 },
    { country: "Netherlands", gdp: 63, life: 82.1, population: 17.9 },
    { country: "Bulgaria", gdp: 15, life: 75.4, population: 6.4 },
    { country: "Greece", gdp: 23, life: 81.3, population: 10.4 },
    { country: "Denmark", gdp: 68, life: 81.6, population: 5.9 },
];

/** Bubbles: a third number sets each point's size. */
export function Bubbles() {
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Stack gap="3xs">
                    <Text variant="card-title">Income and life expectancy</Text>
                    <Text variant="caption">Twelve EU countries; bubble size is population</Text>
                </Stack>
                <ScatterChart
                    data={countries}
                    x="gdp"
                    y="life"
                    size="population"
                    name="country"
                    xLabel="GDP per person"
                    yLabel="Life expectancy"
                    sizeLabel="Population"
                    label="Life expectancy against GDP per person for twelve EU countries, bubbles sized by population"
                    formatX={(value) => `$${value}k`}
                    formatY={(value) => `${value} years`}
                    formatSize={(value) => `${value}M`}
                    height={300}
                />
            </Stack>
        </Card>
    );
}
Bubbles.layout = { fill: true, ground: "canvas" };
