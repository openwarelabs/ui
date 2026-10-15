import { useState } from "react";

import { ActivityHeatmap, Card, Stack, Text, type ActivityHeatmapDay } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "ActivityHeatmap",
    category: "Data display",
    description:
        "A GitHub-style calendar of daily counts: a column per week, a square per day, shaded by how much happened. For contributions, workouts, sign-ins, anything counted by day.",
    source: "components/ActivityHeatmap/ActivityHeatmap.tsx",
    props: ["ActivityHeatmapProps", "ActivityHeatmapDay", "ActivityHeatmapLabels"],
    keyboard: [
        ["Tab", "Moves onto the grid, at the latest day (or the last one you were on)."],
        ["Up / Down", "The day before or after."],
        ["Left / Right", "The same day a week earlier or later; mirrored in right-to-left text."],
        [
            "Home / End",
            "The first or last day of that week; with Ctrl or Cmd, the first or last day shown.",
        ],
        ["Page Up / Page Down", "A month earlier or later; with Shift, a year."],
        ["Enter or Space", "With onDayClick, chooses the day."],
        ["Escape", "Hides the tooltip."],
    ],
    notes: [
        'It\'s a grid named by label, with one day in the Tab order. Each day is read out in full: "12 contributions on Tuesday, 3 March 2026".',
        "Before the grid, screen readers hear a summary: the total and the busiest day.",
        "The colour is never the only clue: the hovered or focused day shows its number in a tooltip.",
        "The shades are mixed from one chart colour and the empty track with color-mix, so they follow the theme and the brand. Any CSS colour works too.",
        "On a narrow screen it scrolls sideways inside itself, starting at the latest week; the page never does.",
        "With onDayClick each day is a button. The squares are small, so pair it with a larger way in where you can, such as a list of days.",
    ],
    related: ["BarChart", "Calendar", "Sparkline"],
    since: "0.15.0",
};

const iso = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Made-up counts for the `days` days up to `end`: quieter at weekends, with some days off. The same every time. */
function sampleDays(end: Date, days: number, most = 14): ActivityHeatmapDay[] {
    return Array.from({ length: days }, (_, i) => {
        const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
        const seed = Math.sin(Math.round(day.getTime() / 864e5) * 12.9898) * 43758.5453;
        const random = seed - Math.floor(seed);
        const weekend = day.getDay() % 6 === 0;
        const count =
            random < (weekend ? 0.6 : 0.2)
                ? 0
                : Math.ceil(random * random * (weekend ? most / 3 : most));
        return { date: iso(day), count };
    });
}

const year = sampleDays(new Date(), 365);

/** The last 52 weeks, ending today: the default range. It starts scrolled to the latest week. */
export function Year() {
    const total = year.reduce((sum, day) => sum + day.count, 0);
    return (
        <Card style={{ width: "100%" }}>
            <Stack gap="lg">
                <Text variant="card-title">
                    {total.toLocaleString("en")} contributions in the last year
                </Text>
                <ActivityHeatmap data={year} label="Contributions in the last year" />
            </Stack>
        </Card>
    );
}
Year.layout = { fill: true, ground: "canvas" };

const quarter = sampleDays(new Date(2026, 8, 30), 92, 10);

/** A quarter, weeks starting on Monday, with bigger squares, fixed thresholds and other words. */
export function Quarter() {
    return (
        <ActivityHeatmap
            data={quarter}
            label="Deploys, July to September 2026"
            start="2026-07-01"
            end="2026-09-30"
            weekStartsOn={1}
            locale="en-GB"
            cellSize={16}
            thresholds={[1, 3, 6, 9]}
            labels={{
                count: (count) =>
                    count === 0 ? "No deploys" : count === 1 ? "1 deploy" : `${count} deploys`,
                less: "Fewer",
            }}
        />
    );
}

const workouts = sampleDays(new Date(), 182, 90);

/** Another chart colour, three shades, and a tooltip of your own. */
export function Colour() {
    return (
        <ActivityHeatmap
            data={workouts}
            label="Minutes of exercise in the last six months"
            start={workouts[workouts.length - 1]!.date}
            color={3}
            levels={4}
            labels={{ count: (count) => (count === 1 ? "1 minute" : `${count} minutes`) }}
            formatTooltip={({ date, count }) => (
                <>
                    <strong>{count ? `${count} min` : "Rest day"}</strong> ·{" "}
                    {new Date(`${date}T00:00`).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                    })}
                </>
            )}
        />
    );
}

const reviews = sampleDays(new Date(2026, 9, 15), 120, 8);

/** onDayClick makes each day a button: here it opens that day in a panel below. */
export function ClickableDays() {
    const [chosen, setChosen] = useState<ActivityHeatmapDay | null>(null);
    return (
        <Card style={{ width: "100%", maxWidth: 640, marginInline: "auto" }}>
            <Stack gap="lg">
                <ActivityHeatmap
                    data={reviews}
                    label="Code reviews since June"
                    start={reviews[reviews.length - 1]!.date}
                    end="2026-10-15"
                    color={7}
                    labels={{
                        count: (count) =>
                            count === 0
                                ? "No reviews"
                                : count === 1
                                  ? "1 review"
                                  : `${count} reviews`,
                    }}
                    onDayClick={setChosen}
                />
                <div aria-live="polite">
                    {chosen ? (
                        <Stack gap="2xs">
                            <Text variant="label">
                                {new Date(`${chosen.date}T00:00`).toLocaleDateString("en-GB", {
                                    dateStyle: "full",
                                })}
                            </Text>
                            <Text tone="muted">
                                {chosen.count === 0
                                    ? "No reviews that day."
                                    : `${chosen.count} ${chosen.count === 1 ? "review" : "reviews"}, ${Math.ceil(chosen.count / 2)} approved first time.`}
                            </Text>
                        </Stack>
                    ) : (
                        <Text tone="muted">Choose a day to see its reviews.</Text>
                    )}
                </div>
            </Stack>
        </Card>
    );
}
ClickableDays.layout = { fill: true, ground: "canvas" };
