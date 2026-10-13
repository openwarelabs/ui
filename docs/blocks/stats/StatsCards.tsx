import { Link, SectionHeading, Stat, Text, type StatProps } from "@openwarelabs/ui";
import { Bot, Rocket, Timer, Undo2 } from "lucide-react";

import "./StatsCards.css";

// Twelve weeks of totals across every Acme workspace, oldest first.
const stats: Array<Omit<StatProps, "value"> & { label: string; value: string }> = [
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
        <section className="stats-cards" aria-labelledby="stats-cards-title">
            <div className="stats-cards__inner">
                <div className="stats-cards__header">
                    <SectionHeading
                        eyebrow="Last 12 weeks"
                        title={<span id="stats-cards-title">Faster every quarter</span>}
                        intro="Across every Acme workspace, the last twelve weeks against the twelve before. Updated each Monday."
                    />
                    <Link href="#" variant="standalone" className="stats-cards__link">
                        How we count →
                    </Link>
                </div>

                <div className="stats-cards__grid">
                    {/* Stat is sized for an app's overview; on a marketing page the number takes a display size. */}
                    {stats.map((stat) => (
                        <Stat
                            key={stat.label}
                            {...stat}
                            value={
                                <Text as="span" variant="section-title">
                                    {stat.value}
                                </Text>
                            }
                            className="stats-cards__stat"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
