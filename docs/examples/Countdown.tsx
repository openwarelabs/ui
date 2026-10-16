import { useState } from "react";

import { Button, Countdown, Stack, Text, toast } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Countdown",
    category: "Data display",
    description:
        "The time left until a moment, as segments with their units under them or one line of numbers: a launch, a sale ending, a deadline.",
    source: "components/Countdown/Countdown.tsx",
    imports: ["Countdown"],
    props: ["CountdownProps", "CountdownLabels"],
    notes: [
        "It's a role=\"timer\" with aria-live=\"off\", so the numbers changing every second aren't read out. Give it a label saying what it counts to (\"Time until launch\").",
        "A visually hidden live region says the time left once a minute (\"2 days, 14 hours and 9 minutes left\"), then that it's complete. announce=\"none\" turns that off.",
        "Each number has its unit next to it in the markup, in both variants, so a screen reader hears \"02 hours 14 minutes\" rather than a run of digits.",
        "It reads the clock on every tick, not a counter, so it stays right when a tab sleeps or the clock is corrected, and it stops at zero.",
        "The first render, on a server too, uses the clock as it is; on hydration the client patches the numbers if they've moved on, without a warning.",
        "onComplete fires once as it reaches zero while showing, not for a moment that had already passed when it mounted.",
    ],
    related: ["RelativeTime", "Stat", "Timeline", "Text"],
    since: "0.18.0",
};

const hours = 60 * 60 * 1000;
const launch = Date.now() + 3 * 24 * hours + 2 * hours + 14 * 60 * 1000;

/** Boxes, the default: days, hours, minutes and seconds in cards with their units under them. */
export function Launch() {
    return (
        <Stack gap="lg" style={{ alignItems: "center" }}>
            <Text variant="overline">Launching in</Text>
            <Countdown to={launch} label="Time until launch" size="lg" />
        </Stack>
    );
}

/** Inline: one line of numbers, for a row, a banner or a sentence. */
export function Inline() {
    return (
        <Stack gap="md" style={{ alignItems: "center" }}>
            <Text>
                Sale ends in <Countdown to={launch} variant="inline" size="sm" label="Time until the sale ends" style={{ verticalAlign: "baseline" }} />
            </Text>
            <Countdown to={Date.now() + 90 * 60 * 1000} variant="inline" units={["hours", "minutes", "seconds"]} label="Time left to vote" />
        </Stack>
    );
}

/** Ten seconds from pressing Start, then completeText and onComplete; here a toast. */
export function Complete() {
    const [target, setTarget] = useState(() => Date.now() + 10 * 1000);
    return (
        <Stack gap="lg" style={{ alignItems: "center" }}>
            <Countdown
                to={target}
                units={["minutes", "seconds"]}
                completeText="Launched"
                onComplete={() => toast("Launched", { description: "The countdown reached zero." })}
                label="Time until launch"
            />
            <Button variant="secondary" onClick={() => setTarget(Date.now() + 10 * 1000)}>
                Start again
            </Button>
        </Stack>
    );
}
