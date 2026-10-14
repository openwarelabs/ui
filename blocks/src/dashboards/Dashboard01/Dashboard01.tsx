import { useId, useState } from "react";

import { Card, cx, SegmentedControl, Select, Stat, Text } from "@openwarelabs/ui";

import type { Dashboard01Filter, Dashboard01Props } from "./Dashboard01.types";

/** One filter, keeping its own value unless it's given one. */
function Filter({ filter }: { filter: Dashboard01Filter }) {
    const [own, setOwn] = useState(filter.defaultValue ?? filter.options[0]?.value ?? "");
    const value = filter.value ?? own;
    const change = (next: string) => {
        setOwn(next);
        filter.onChange?.(next);
    };
    return filter.kind === "select" ? (
        <Select className="ow-dashboard01__select" size="sm" aria-label={filter.label} value={value} onChange={change} options={filter.options} />
    ) : (
        <SegmentedControl size="sm" aria-label={filter.label} options={filter.options} value={value} onChange={change} />
    );
}

/** A page title with its filters, a row of stats, then a chart across the page in a card. */
export function Dashboard01({ title, description, filters, stats, chart, labels = {}, className, ...props }: Dashboard01Props) {
    const id = useId();
    return (
        <section className={cx("ow-dashboard01", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-dashboard01__inner">
                <div className="ow-dashboard01__header">
                    <div>
                        <Text as="h1" variant="heading" id={`${id}-title`}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-dashboard01__lead">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    {filters?.length ? (
                        <div className="ow-dashboard01__filters">
                            {filters.map((filter, index) => (
                                <Filter key={index} filter={filter} />
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="ow-dashboard01__stats">
                    {stats.map((stat, index) => (
                        <Stat key={index} {...stat} />
                    ))}
                </div>

                {chart ? (
                    <Card className="ow-dashboard01__card" padding="none">
                        <div className="ow-dashboard01__card-header">
                            <div>
                                <Text as="h2" variant="card-title">
                                    {chart.title}
                                </Text>
                                {chart.description ? (
                                    <Text as="p" variant="caption" className="ow-dashboard01__summary">
                                        {chart.description}
                                    </Text>
                                ) : null}
                            </div>
                            {chart.legend?.length ? (
                                <ul className="ow-dashboard01__legend" aria-label={labels.legend ?? "Legend"}>
                                    {chart.legend.map((item, index) => (
                                        <Text key={index} as="li" variant="caption" className="ow-dashboard01__legend-item">
                                            {item.swatch}
                                            {item.label}
                                        </Text>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                        {chart.content}
                    </Card>
                ) : null}
            </div>
        </section>
    );
}
