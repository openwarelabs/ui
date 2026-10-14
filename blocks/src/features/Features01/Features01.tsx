import { useId } from "react";

import { cx, SectionHeading, Text } from "@openwarelabs/ui";

import type { Features01Props } from "./Features01.types";

/** An icon, a short title and a sentence for each feature, in a grid that drops to one column on phones. */
export function Features01({ eyebrow, title, description, features, footer, className, ...props }: Features01Props) {
    const id = useId();
    return (
        <section className={cx("ow-features01", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-features01__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />

                <ul className="ow-features01__grid">
                    {features.map((feature, index) => (
                        <li key={index} className="ow-features01__item">
                            {feature.icon ? (
                                <span className="ow-features01__icon" aria-hidden="true">
                                    {feature.icon}
                                </span>
                            ) : null}
                            <Text variant="card-title" className="ow-features01__title">
                                {feature.title}
                            </Text>
                            <Text variant="copy" className="ow-features01__text">
                                {feature.description}
                            </Text>
                        </li>
                    ))}
                </ul>

                {footer ? (
                    <Text variant="copy" align="center" className="ow-features01__more">
                        {footer}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
