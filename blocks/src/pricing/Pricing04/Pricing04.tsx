import { useId } from "react";

import { Card, cx, SectionHeading, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { CheckIcon } from "@blocks/shared/icons";
import type { Pricing04Props } from "./Pricing04.types";

/** One price with what's included, for a simple product: a wide card with the features on the left and the offer on the right. */
export function Pricing04({ eyebrow, title, description, product, offer, promises, className, ...props }: Pricing04Props) {
    const id = useId();
    return (
        <section className={cx("ow-pricing04", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-pricing04__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />

                <Card padding="none" className="ow-pricing04__card">
                    <div className="ow-pricing04__details">
                        <Text variant="heading">{product.name}</Text>
                        {product.description ? (
                            <Text variant="copy" className="ow-pricing04__description">
                                {product.description}
                            </Text>
                        ) : null}
                        {product.featuresTitle ? (
                            <Text as="p" variant="label" tone="primary" className="ow-pricing04__included">
                                {product.featuresTitle}
                            </Text>
                        ) : null}
                        <ul className="ow-pricing04__features">
                            {product.features.map((feature, index) => (
                                <Text as="li" variant="body" tone="soft" key={index}>
                                    <CheckIcon size={16} />
                                    {feature}
                                </Text>
                            ))}
                        </ul>
                    </div>

                    <div className="ow-pricing04__offer">
                        {offer.label ? (
                            <Text as="p" variant="label" tone="soft">
                                {offer.label}
                            </Text>
                        ) : null}
                        <Text as="p" variant="label" tone="muted" className="ow-pricing04__price">
                            <Text as="span" variant="page-title" tone="default" className="ow-pricing04__amount">
                                {offer.price}
                            </Text>
                            {offer.currency}
                        </Text>
                        {offer.unit ? (
                            <Text variant="body" tone="muted" className="ow-pricing04__unit">
                                {offer.unit}
                            </Text>
                        ) : null}
                        <BlockActionButton action={offer.action} variant="primary" fullWidth />
                        {offer.note ? (
                            <Text as="p" variant="caption" className="ow-pricing04__fine">
                                {offer.note}
                            </Text>
                        ) : null}
                    </div>
                </Card>

                {promises?.length ? (
                    <ul className="ow-pricing04__promises">
                        {promises.map((promise, index) => (
                            <Text as="li" variant="body" tone="muted" key={index}>
                                {promise.icon}
                                {promise.text}
                            </Text>
                        ))}
                    </ul>
                ) : null}
            </div>
        </section>
    );
}
