import { Link, SectionHeading, Text } from "@openwarelabs/ui";

import "./StatsSplit.css";

const stats = [
    { value: "3.1", unit: "×", label: "more deploys a week", detail: "From 9 to 28 for the median team." },
    { value: "−58", unit: "%", label: "time waiting for review", detail: "Most pull requests get a first look within the hour." },
    { value: "1 in 4", unit: "", label: "pull requests opened by agents", detail: "Mostly dependency bumps, tests and copy fixes." },
    { value: "6", unit: "days", label: "to move a team over", detail: "Issues, history and deploy settings included." },
];

export function StatsSplit() {
    return (
        <section className="stats-split" aria-labelledby="stats-split-title">
            <div className="stats-split__inner">
                <div className="stats-split__copy">
                    <SectionHeading
                        eyebrow="Results"
                        title={<span id="stats-split-title">Less waiting, more shipping</span>}
                        intro="Teams that move to Acme spend less time in queues and more of it on the work. These are the medians for teams in their first six months."
                    />
                    <Link href="#" variant="standalone" className="stats-split__link">
                        Read how Halcyon doubled its deploys →
                    </Link>
                </div>

                <dl className="stats-split__grid">
                    {stats.map((stat) => (
                        <div key={stat.label} className="stats-split__item">
                            <Text as="dt" variant="card-title" className="stats-split__label">
                                {stat.label}
                            </Text>
                            <Text as="dd" variant="page-title" className="stats-split__value">
                                {stat.value}
                                {stat.unit ? (
                                    <Text as="span" variant="page-title" tone="muted" className="stats-split__unit">
                                        {stat.unit}
                                    </Text>
                                ) : null}
                            </Text>
                            <Text as="dd" variant="copy" className="stats-split__detail">
                                {stat.detail}
                            </Text>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
