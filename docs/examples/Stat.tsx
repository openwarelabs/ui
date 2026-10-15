import { Stat } from "@openwarelabs/ui";
import { Clock, Coins, Zap } from "lucide-react";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "Stat",
    category: "Data display",
    description:
        "One number that matters, with what changed since last time and an optional trend line.",
    source: "components/Stat/Stat.tsx",
    notes: [
        "Stat draws its own card (surface, border and corners), so put it straight in a grid: wrapped in a Card it gets two borders.",
        "The change reads out with its direction (“up 12%”), not just the arrow.",
        "The trend line is decoration and hidden from screen readers; say what it shows in the description if it matters.",
        'When a rising number is bad, as with costs, set changeTone="negative".',
    ],
    related: ["Table", "ProgressBar"],
};

/** Three stats in a grid, with trends. */
export function Row() {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                width: "100%",
            }}
        >
            <Stat
                label="Runs this week"
                icon={<Zap size={14} />}
                value="128"
                change="+12%"
                description="vs last week"
                trend={[8, 12, 10, 14, 18, 16, 22]}
            />
            <Stat
                label="Spend"
                icon={<Coins size={14} />}
                value="$48.20"
                change="+8%"
                changeTone="negative"
                description="of a $100 budget"
                trend={[4, 5, 6, 6, 7, 9, 10]}
            />
            <Stat
                label="Median run"
                icon={<Clock size={14} />}
                value="6m 12s"
                change="−40s"
                description="faster than last week"
                trend={[9, 8, 8, 7, 7, 6.5, 6.2]}
            />
        </div>
    );
}
Row.layout = { fill: true };

/** Just the label and value. */
export function Plain() {
    return <Stat label="Tokens today" value="1.2M" />;
}
