import { useId } from "react";

import { cx, Link, SectionHeading, Text } from "@openwarelabs/ui";

import type { Stats03Props } from "./Stats03.types";

/** A heading and a paragraph on the left, numbers on the right. */
export function Stats03({ eyebrow, title, description, link, stats, className, ...props }: Stats03Props) {
    const id = useId();
    return (
        <section className={cx("ow-stats03", className)} aria-labelledby={id} {...props}>
            <div className="ow-stats03__inner">
                <div className="ow-stats03__copy">
                    <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
                    {link ? (
                        <Link href={link.href} variant="standalone" className="ow-stats03__link">
                            {link.label}
                        </Link>
                    ) : null}
                </div>

                <dl className="ow-stats03__grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="ow-stats03__item">
                            <Text as="dt" variant="card-title" className="ow-stats03__label">
                                {stat.label}
                            </Text>
                            <Text as="dd" variant="page-title" className="ow-stats03__value">
                                {stat.value}
                                {stat.unit ? (
                                    <Text as="span" variant="page-title" tone="muted" className="ow-stats03__unit">
                                        {stat.unit}
                                    </Text>
                                ) : null}
                            </Text>
                            {stat.detail ? (
                                <Text as="dd" variant="copy" className="ow-stats03__detail">
                                    {stat.detail}
                                </Text>
                            ) : null}
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
