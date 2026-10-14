import { Stats03 } from "@openwarelabs/blocks";

const stats = [
    { value: "3.1", unit: "×", label: "more deploys a week", detail: "From 9 to 28 for the median team." },
    { value: "−58", unit: "%", label: "time waiting for review", detail: "Most pull requests get a first look within the hour." },
    { value: "1 in 4", label: "pull requests opened by agents", detail: "Mostly dependency bumps, tests and copy fixes." },
    { value: "6", unit: "days", label: "to move a team over", detail: "Issues, history and deploy settings included." },
];

export function StatsSplit() {
    return (
        <Stats03
            eyebrow="Results"
            title="Less waiting, more shipping"
            description="Teams that move to Acme spend less time in queues and more of it on the work. These are the medians for teams in their first six months."
            link={{ label: "Read how Halcyon doubled its deploys →", href: "#stories/halcyon" }}
            stats={stats}
        />
    );
}
