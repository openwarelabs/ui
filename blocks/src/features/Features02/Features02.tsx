import { useId } from "react";

import { cx, DotGrid, Link, SectionHeading, Text } from "@openwarelabs/ui";

import { CheckIcon } from "@blocks/shared/icons";
import type { Features02Props } from "./Features02.types";

/** Rows that swap sides, each a few lines and points beside a picture on a dot grid. */
export function Features02({ eyebrow, title, description, rows, className, ...props }: Features02Props) {
    const id = useId();
    return (
        <section className={cx("ow-features02", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-features02__inner">
                <SectionHeading eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />

                <div className="ow-features02__rows">
                    {rows.map((row, index) => (
                        <article key={index} className="ow-features02__row" aria-labelledby={`${id}-row-${index}`}>
                            <div className="ow-features02__copy">
                                {row.kicker || row.icon ? (
                                    <Text variant="label" tone="primary" className="ow-features02__kicker">
                                        {row.icon}
                                        {row.kicker}
                                    </Text>
                                ) : null}
                                <Text variant="heading" id={`${id}-row-${index}`} className="ow-features02__title">
                                    {row.title}
                                </Text>
                                <Text variant="lead" className="ow-features02__text">
                                    {row.description}
                                </Text>
                                {row.points?.length ? (
                                    <ul className="ow-features02__points">
                                        {row.points.map((point, pointIndex) => (
                                            <Text as="li" key={pointIndex} tone="soft" className="ow-features02__point">
                                                <CheckIcon size={16} />
                                                {point}
                                            </Text>
                                        ))}
                                    </ul>
                                ) : null}
                                {row.link ? (
                                    <Link href={row.link.href} variant="standalone" className="ow-features02__link">
                                        {row.link.label} →
                                    </Link>
                                ) : null}
                            </div>
                            <DotGrid
                                className="ow-features02__stage"
                                role={row.visualLabel ? "img" : undefined}
                                aria-label={row.visualLabel}
                            >
                                {row.visual}
                            </DotGrid>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
