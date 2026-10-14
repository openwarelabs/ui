import { useId } from "react";

import { cx, Link, SectionHeading, Stat, Text } from "@openwarelabs/ui";

import type { Stats02Props } from "./Stats02.types";

/** Each number on its own card, with its change and a trend line. */
export function Stats02({ eyebrow, title, description, link, stats, className, ...props }: Stats02Props) {
    const id = useId();
    return (
        <section className={cx("ow-stats02", className)} aria-labelledby={id} {...props}>
            <div className="ow-stats02__inner">
                <div className="ow-stats02__header">
                    <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
                    {link ? (
                        <Link href={link.href} variant="standalone" className="ow-stats02__link">
                            {link.label}
                        </Link>
                    ) : null}
                </div>

                <div className="ow-stats02__grid">
                    {/* Stat is sized for an app's overview; on a marketing page the number takes a display size. */}
                    {stats.map((stat, index) => (
                        <Stat
                            key={index}
                            {...stat}
                            value={
                                <Text as="span" variant="section-title">
                                    {stat.value}
                                </Text>
                            }
                            className="ow-stats02__stat"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
