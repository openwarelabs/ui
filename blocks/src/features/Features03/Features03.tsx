import { useId } from "react";

import { cx, SectionHeading, Text } from "@openwarelabs/ui";

import type { Features03Props } from "./Features03.types";

/** A bento grid: cards of different sizes, the biggest for the feature that matters most. */
export function Features03({ eyebrow, title, description, cards, className, ...props }: Features03Props) {
    const id = useId();
    return (
        <section className={cx("ow-features03", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-features03__inner">
                <div className="ow-features03__header">
                    <SectionHeading eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} />
                    {description ? (
                        <Text variant="lead" className="ow-features03__intro">
                            {description}
                        </Text>
                    ) : null}
                </div>

                {/* The first card is the big one, with a heading and a lead; the rest are dense cards. */}
                <div className="ow-features03__grid">
                    {cards.map((card, index) => {
                        const featured = index === 0;
                        return (
                            <article
                                key={index}
                                className={cx(
                                    "ow-features03__card",
                                    featured && "ow-features03__card--featured",
                                    index === cards.length - 1 && index > 0 && "ow-features03__card--last",
                                )}
                                aria-labelledby={`${id}-card-${index}`}
                            >
                                <div className="ow-features03__copy">
                                    <Text variant={featured ? "heading" : "card-title"} id={`${id}-card-${index}`}>
                                        {card.title}
                                    </Text>
                                    <Text variant={featured ? "lead" : "copy"} className="ow-features03__text">
                                        {card.description}
                                    </Text>
                                </div>
                                <div className="ow-features03__visual" role={card.visualLabel ? "img" : undefined} aria-label={card.visualLabel}>
                                    {card.visual}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
