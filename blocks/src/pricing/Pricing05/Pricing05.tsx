import { useId, useMemo, useState } from "react";

import { Card, cx, SectionHeading, Slider, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import type { Pricing05Props, Pricing05Tier } from "./Pricing05.types";

/** How many units fall in each band, and what they cost. */
function estimate(tiers: Pricing05Tier[], units: number) {
    const lines = tiers.map((tier) => {
        const count = Math.max(0, Math.min(units, tier.to) - tier.from);
        return { tier, count, cost: count * tier.price };
    });
    return { lines, total: lines.reduce((sum, line) => sum + line.cost, 0) };
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** A price per unit in bands, with a slider to estimate the month and the cost of each band beside it. */
export function Pricing05({
    eyebrow,
    title,
    description,
    tiers,
    aside,
    estimate: words,
    max,
    step = max / 200,
    defaultValue,
    marks = [0, max / 4, max / 2, (max * 3) / 4, max],
    currency = "EUR",
    locale,
    action,
    note,
    labels = {},
    className,
    ...props
}: Pricing05Props) {
    const id = useId();
    const [units, setUnits] = useState(defaultValue);
    const { lines, total } = estimate(tiers, units);
    const current = tiers.findIndex((tier) => units <= tier.to);

    const unit = labels.unit ?? "unit";
    const plural = labels.units ?? "units";
    const perMonth = labels.perMonth ?? `${plural} a month`;

    const format = useMemo(() => {
        const number = new Intl.NumberFormat(locale);
        const money = new Intl.NumberFormat(locale, { style: "currency", currency });
        const unitPrice = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 3 });
        return { number: (value: number) => number.format(value), money: (value: number) => money.format(value), unitPrice: (value: number) => unitPrice.format(value) };
    }, [locale, currency]);

    const rangeLabel = (tier: Pricing05Tier) => {
        if (tier.from === 0) return `First ${format.number(tier.to)} ${plural}`;
        if (tier.to === Infinity) return `Over ${format.number(tier.from)}`;
        return `${format.number(tier.from + 1)} to ${format.number(tier.to)}`;
    };

    const mark = (value: number) => (value === 0 ? "0" : value >= 1000 && value % 1000 === 0 ? `${value / 1000}k` : format.number(value));

    return (
        <section className={cx("ow-pricing05", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-pricing05__inner">
                <div>
                    <SectionHeading eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />
                    <ul className="ow-pricing05__tiers" aria-label={labels.tiers ?? `Price per ${unit}`}>
                        {tiers.map((tier, index) => (
                            <li key={tier.from} className="ow-pricing05__tier" data-current={index === current || undefined}>
                                <span className="ow-pricing05__tier-dot" aria-hidden="true" />
                                <Text variant={index === current ? "label" : "body"} tone={index === current ? "default" : "soft"}>
                                    {rangeLabel(tier)}
                                </Text>
                                <Text variant="label" className="ow-pricing05__tier-price">
                                    {tier.price === 0 ? (
                                        (labels.free ?? "Free")
                                    ) : (
                                        <>
                                            {format.unitPrice(tier.price)}
                                            <Text as="small" variant="caption" className="ow-pricing05__tier-unit">
                                                a {unit}
                                            </Text>
                                        </>
                                    )}
                                </Text>
                            </li>
                        ))}
                    </ul>
                    {aside ? (
                        <Text variant="copy" className="ow-pricing05__aside">
                            {aside}
                        </Text>
                    ) : null}
                </div>

                <Card padding="none" className="ow-pricing05__card">
                    <Text variant="card-title">{words.title}</Text>
                    {words.description ? (
                        <Text variant="copy" className="ow-pricing05__card-intro">
                            {words.description}
                        </Text>
                    ) : null}

                    <Text as="p" variant="heading" className="ow-pricing05__runs" aria-hidden="true">
                        {format.number(units)}{" "}
                        <Text as="small" variant="body" tone="muted" className="ow-pricing05__runs-unit">
                            {perMonth}
                        </Text>
                    </Text>
                    {/* The big number above is the slider's visible label; screen readers hear the amount and the cost. */}
                    <Slider
                        aria-label={labels.slider ?? capitalise(perMonth)}
                        showValue={false}
                        min={0}
                        max={max}
                        step={step}
                        value={units}
                        onChange={setUnits}
                        formatValue={(value) => `${format.number(value)} ${plural}, about ${format.money(estimate(tiers, value).total)} a month`}
                    />
                    <div className="ow-pricing05__scale" aria-hidden="true">
                        {marks.map((value) => (
                            <span key={value}>{mark(value)}</span>
                        ))}
                    </div>

                    <div className="ow-pricing05__breakdown">
                        {lines.map(({ tier, count, cost }) => (
                            <Text as="div" variant="body" tone="soft" key={tier.from} className="ow-pricing05__line" data-idle={count === 0 || undefined}>
                                <span>
                                    {format.number(count)} {plural} {tier.price === 0 ? (labels.free ?? "Free").toLowerCase() : `at ${format.unitPrice(tier.price)}`}
                                </span>
                                <span>{format.money(cost)}</span>
                            </Text>
                        ))}
                    </div>

                    <div className="ow-pricing05__total">
                        <Text as="p" variant="label">
                            {words.totalLabel}
                            {words.totalNote ? (
                                <Text as="small" variant="caption" className="ow-pricing05__total-note">
                                    {words.totalNote}
                                </Text>
                            ) : null}
                        </Text>
                        <Text as="p" variant="section-title" className="ow-pricing05__total-amount">
                            {format.money(total)}
                        </Text>
                    </div>

                    <BlockActionButton action={action} variant="primary" fullWidth className="ow-pricing05__action" />
                    {note ? (
                        <Text as="p" variant="caption" align="center" className="ow-pricing05__fine">
                            {note}
                        </Text>
                    ) : null}
                </Card>
            </div>
        </section>
    );
}
