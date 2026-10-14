import { useId } from "react";

import { Badge, Card, cx, Link, SectionHeading, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { ArrowRightIcon, CheckIcon } from "@blocks/shared/icons";
import type { Pricing01Props } from "./Pricing01.types";

/** Plans side by side as cards, the recommended one raised, with a line for an enterprise plan below. */
export function Pricing01({ eyebrow, title, description, plans, enterprise, note, className, ...props }: Pricing01Props) {
    const id = useId();
    return (
        <section className={cx("ow-pricing01", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-pricing01__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />

                <div className="ow-pricing01__grid">
                    {plans.map((plan, index) => (
                        <Card
                            key={index}
                            padding="none"
                            className="ow-pricing01__card"
                            data-recommended={plan.recommended || undefined}
                            aria-labelledby={`${id}-plan-${index}`}
                            role="group"
                        >
                            <div className="ow-pricing01__head">
                                <div className="ow-pricing01__name-row">
                                    <Text variant="card-title" id={`${id}-plan-${index}`}>
                                        {plan.name}
                                    </Text>
                                    {plan.badge ? (
                                        <Badge size="sm" variant="active">
                                            {plan.badge}
                                        </Badge>
                                    ) : null}
                                </div>
                                {plan.summary ? (
                                    <Text variant="copy" className="ow-pricing01__summary">
                                        {plan.summary}
                                    </Text>
                                ) : null}
                                <Text as="p" variant="body" tone="muted" className="ow-pricing01__price">
                                    <Text as="span" variant="section-title" tone="default" className="ow-pricing01__amount">
                                        {plan.price}
                                    </Text>
                                    {plan.unit}
                                </Text>
                                <BlockActionButton action={plan.action} variant={plan.recommended ? "primary" : "secondary"} size="md" fullWidth />
                            </div>
                            <div className="ow-pricing01__body">
                                {plan.featuresTitle ? (
                                    <Text as="p" variant="label">
                                        {plan.featuresTitle}
                                    </Text>
                                ) : null}
                                <ul className="ow-pricing01__features">
                                    {plan.features.map((feature, featureIndex) => (
                                        <Text as="li" variant="body" tone="soft" key={featureIndex}>
                                            <CheckIcon size={16} />
                                            {feature}
                                        </Text>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    ))}
                </div>

                {enterprise ? (
                    <div className="ow-pricing01__enterprise">
                        {enterprise.icon ? (
                            <span className="ow-pricing01__enterprise-icon" aria-hidden="true">
                                {enterprise.icon}
                            </span>
                        ) : null}
                        <Text variant="copy" className="ow-pricing01__enterprise-text">
                            <Text as="strong" variant="label" tone="default">
                                {enterprise.title}
                            </Text>{" "}
                            {enterprise.description}
                        </Text>
                        <Link href={enterprise.link.href} variant="standalone" className="ow-pricing01__enterprise-link">
                            {enterprise.link.label}
                            <ArrowRightIcon size={14} />
                        </Link>
                    </div>
                ) : null}

                {note ? (
                    <Text as="p" variant="caption" align="center" className="ow-pricing01__note">
                        {note}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
