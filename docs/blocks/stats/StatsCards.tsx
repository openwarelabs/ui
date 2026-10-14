import { Stats02, type Stats02Stat } from "@openwarelabs/blocks";
import { Bot, Rocket, Timer, Undo2 } from "lucide-react";

// Twelve weeks of totals across every Acme workspace, oldest first.
const stats: Stats02Stat[] = [
    {
        icon: <Rocket size={14} />,
        label: "Deploys a week",
        value: "86,400",
        change: "+12%",
        description: "vs the quarter before",
        trend: [61, 64, 63, 68, 70, 69, 74, 77, 76, 81, 83, 86],
    },
    {
        icon: <Bot size={14} />,
        label: "Agent pull requests merged",
        value: "71%",
        change: "+9 pts",
        description: "of the ones agents opened",
        trend: [58, 60, 59, 62, 63, 65, 64, 67, 68, 69, 70, 71],
    },
    {
        icon: <Timer size={14} />,
        label: "Median wait for a review",
        value: "42m",
        change: "−18%",
        changeTone: "positive",
        description: "from opened to first comment",
        trend: [55, 54, 56, 52, 50, 49, 50, 47, 46, 44, 43, 42],
    },
    {
        icon: <Undo2 size={14} />,
        label: "Deploys rolled back",
        value: "0.6%",
        change: "−0.3 pts",
        changeTone: "positive",
        description: "of all deploys, within a day",
        trend: [1.0, 0.9, 1.0, 0.9, 0.8, 0.8, 0.9, 0.7, 0.7, 0.6, 0.7, 0.6],
    },
];

export function StatsCards() {
    return (
        <Stats02
            eyebrow="Last 12 weeks"
            title="Faster every quarter"
            description="Across every Acme workspace, the last twelve weeks against the twelve before. Updated each Monday."
            link={{ label: "How we count →", href: "#methodology" }}
            stats={stats}
        />
    );
}
