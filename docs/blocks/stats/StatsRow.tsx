import { Stats01 } from "@openwarelabs/blocks";

const stats = [
    { value: "4,200", label: "teams ship with Acme" },
    { value: "1.9", unit: "M", label: "agent runs last month" },
    { value: "42", unit: "min", label: "median wait for a review" },
    { value: "99.99", unit: "%", label: "deploy uptime this year" },
];

export function StatsRow() {
    return (
        <Stats01 eyebrow="By the numbers" title="Teams ship more when the busywork runs itself" stats={stats} note="From Acme's own figures, September 2026." />
    );
}
