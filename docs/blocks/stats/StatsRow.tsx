import { SectionHeading } from "@openwarelabs/ui";

import "./StatsRow.css";

const stats = [
    { value: "4,200", unit: "", label: "teams ship with Acme" },
    { value: "1.9", unit: "M", label: "agent runs last month" },
    { value: "42", unit: "min", label: "median wait for a review" },
    { value: "99.99", unit: "%", label: "deploy uptime this year" },
];

export function StatsRow() {
    return (
        <section className="stats-row" aria-labelledby="stats-row-title">
            <div className="stats-row__inner">
                <SectionHeading
                    align="center"
                    eyebrow="By the numbers"
                    title={<span id="stats-row-title">Teams ship more when the busywork runs itself</span>}
                />

                <dl className="stats-row__list">
                    {stats.map((stat) => (
                        <div key={stat.label} className="stats-row__item">
                            <dt className="stats-row__label">{stat.label}</dt>
                            <dd className="stats-row__value">
                                {stat.value}
                                {stat.unit ? <span className="stats-row__unit">{stat.unit}</span> : null}
                            </dd>
                        </div>
                    ))}
                </dl>

                <p className="stats-row__note">From Acme's own figures, September 2026.</p>
            </div>
        </section>
    );
}
