import { useId, useState } from "react";

import { Badge, cx, SectionHeading, SegmentedControl, Text, VisuallyHidden } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { CheckIcon } from "@blocks/shared/icons";
import type { Pricing02Period, Pricing02Plan, Pricing02Price, Pricing02Props } from "./Pricing02.types";

const priceFor = (plan: Pricing02Plan, period: Pricing02Period): Pricing02Price => ("amount" in plan.price ? plan.price : plan.price[period]);

const includes = (name: string) => `${name} includes`;

/** Plans in one panel with a switch between monthly and yearly prices, which fade in as they change. */
export function Pricing02({
    eyebrow,
    title,
    description,
    plans,
    periodNote,
    defaultPeriod = "monthly",
    onPeriodChange,
    note,
    labels = {},
    className,
    ...props
}: Pricing02Props) {
    const [period, setPeriod] = useState<Pricing02Period>(defaultPeriod);
    const id = useId();

    return (
        <section className={cx("ow-pricing02", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-pricing02__inner">
                <div className="ow-pricing02__header">
                    <SectionHeading eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />
                    <div className="ow-pricing02__switch">
                        <SegmentedControl
                            aria-label={labels.period ?? "Billing period"}
                            value={period}
                            onChange={(value) => {
                                setPeriod(value as Pricing02Period);
                                onPeriodChange?.(value as Pricing02Period);
                            }}
                            options={[
                                { value: "monthly", label: labels.monthly ?? "Monthly" },
                                { value: "yearly", label: labels.yearly ?? "Yearly" },
                            ]}
                        />
                        {periodNote ? (
                            <Text as="p" variant="caption">
                                {periodNote}
                            </Text>
                        ) : null}
                    </div>
                </div>

                <VisuallyHidden aria-live="polite">
                    {period === "yearly" ? (labels.showingYearly ?? "Showing yearly prices.") : (labels.showingMonthly ?? "Showing monthly prices.")}
                </VisuallyHidden>

                <div className="ow-pricing02__panel">
                    {plans.map((plan, index) => {
                        const price = priceFor(plan, period);
                        return (
                            <div key={index} className="ow-pricing02__plan" data-popular={plan.recommended || undefined}>
                                <div className="ow-pricing02__name-row">
                                    <Text variant="card-title">{plan.name}</Text>
                                    {plan.badge ? (
                                        <Badge size="sm" variant="active">
                                            {plan.badge}
                                        </Badge>
                                    ) : null}
                                </div>
                                {plan.summary ? (
                                    <Text variant="copy" className="ow-pricing02__summary">
                                        {plan.summary}
                                    </Text>
                                ) : null}
                                <div className="ow-pricing02__price">
                                    <Text as="p" variant="body" tone="muted" className="ow-pricing02__figure">
                                        {/* The key restarts the fade when the amount changes. */}
                                        <Text
                                            as="span"
                                            variant="section-title"
                                            tone="default"
                                            key={price.amount}
                                            className={price.custom ? "ow-pricing02__amount ow-pricing02__amount--text" : "ow-pricing02__amount"}
                                        >
                                            {price.amount}
                                        </Text>
                                        {price.unit}
                                    </Text>
                                    {price.billing ? (
                                        <Text as="p" variant="caption" className="ow-pricing02__billing">
                                            {price.billing}
                                        </Text>
                                    ) : null}
                                </div>
                                <BlockActionButton action={plan.action} variant={plan.recommended ? "primary" : "secondary"} size="md" fullWidth />
                                <ul className="ow-pricing02__features" aria-label={(labels.includes ?? includes)(plan.name)}>
                                    {plan.features.map((feature, featureIndex) => (
                                        <Text as="li" variant="body" tone="soft" key={featureIndex}>
                                            <CheckIcon size={16} />
                                            {feature}
                                        </Text>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {note ? (
                    <Text as="p" variant="caption" align="center" className="ow-pricing02__note">
                        {note}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
