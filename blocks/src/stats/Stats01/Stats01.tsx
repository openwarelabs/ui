import { useId } from "react";

import { cx, SectionHeading, Text } from "@openwarelabs/ui";

import type { Stats01Props } from "./Stats01.types";

/** Three or four large numbers in a row, each with a short label. */
export function Stats01({ eyebrow, title, stats, note, className, ...props }: Stats01Props) {
    const id = useId();
    return (
        <section className={cx("ow-stats01", className)} aria-labelledby={id} {...props}>
            <div className="ow-stats01__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={id}>{title}</span>} />

                <dl className="ow-stats01__list">
                    {stats.map((stat, index) => (
                        <div key={index} className="ow-stats01__item">
                            <Text as="dt" variant="body" tone="muted">
                                {stat.label}
                            </Text>
                            <Text as="dd" variant="page-title" className="ow-stats01__value">
                                {stat.value}
                                {stat.unit ? (
                                    <Text as="span" variant="page-title" tone="muted" className="ow-stats01__unit">
                                        {stat.unit}
                                    </Text>
                                ) : null}
                            </Text>
                        </div>
                    ))}
                </dl>

                {note ? (
                    <Text as="p" variant="caption" className="ow-stats01__note">
                        {note}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
