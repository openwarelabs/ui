import { useId } from "react";

import { Badge, Card, cx, SectionHeading, Text, User } from "@openwarelabs/ui";

import type { Testimonial02Props } from "./Testimonial02.types";

/** Several quotes in cards, in columns like a wall of notes. */
export function Testimonial02({ eyebrow, title, description, badge, quotes, className, ...props }: Testimonial02Props) {
    const id = useId();
    return (
        <section className={cx("ow-testimonial02", className)} aria-labelledby={id} {...props}>
            <div className="ow-testimonial02__inner">
                <div className="ow-testimonial02__header">
                    <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
                    {badge ? (
                        <Badge size="sm" className="ow-testimonial02__sample">
                            {badge}
                        </Badge>
                    ) : null}
                </div>

                <ul className="ow-testimonial02__list">
                    {quotes.map((item, index) => (
                        <li key={index} className="ow-testimonial02__item">
                            <Card padding="lg" className="ow-testimonial02__card">
                                <figure className="ow-testimonial02__figure">
                                    <blockquote className="ow-testimonial02__quote">
                                        {/* Short quotes read as headlines. */}
                                        <Text as="p" variant={item.short ? "heading" : "copy"} tone={item.short ? "default" : "soft"}>
                                            {item.quote}
                                        </Text>
                                    </blockquote>
                                    <figcaption>
                                        <User name={item.name} description={item.jobTitle} src={item.avatar} />
                                    </figcaption>
                                </figure>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
