import { useState } from "react";

import { Button, Card, SectionHeading, Slider, Text } from "@openwarelabs/ui";

import "./PricingUsage.css";

/** Price bands: each run is charged at the band it falls in, like income tax. */
const tiers = [
    { from: 0, to: 500, price: 0 },
    { from: 500, to: 10_000, price: 0.04 },
    { from: 10_000, to: 50_000, price: 0.03 },
    { from: 50_000, to: Infinity, price: 0.02 },
];

const maxRuns = 100_000;
const number = new Intl.NumberFormat("en-IE");
const euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const unitPrice = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 3 });

function rangeLabel(tier: (typeof tiers)[number]) {
    if (tier.from === 0) return `First ${number.format(tier.to)} runs`;
    if (tier.to === Infinity) return `Over ${number.format(tier.from)}`;
    return `${number.format(tier.from + 1)} to ${number.format(tier.to)}`;
}

/** How many runs fall in each band, and what they cost. */
function estimate(runs: number) {
    const lines = tiers.map((tier) => {
        const count = Math.max(0, Math.min(runs, tier.to) - tier.from);
        return { tier, count, cost: count * tier.price };
    });
    return { lines, total: lines.reduce((sum, line) => sum + line.cost, 0) };
}

export function PricingUsage() {
    const [runs, setRuns] = useState(12_000);
    const { lines, total } = estimate(runs);
    const current = tiers.findIndex((tier) => runs <= tier.to);

    return (
        <section className="pricing-usage" aria-labelledby="pricing-usage-title">
            <div className="pricing-usage__inner">
                <div>
                    <SectionHeading
                        eyebrow="Pay as you go"
                        title={<span id="pricing-usage-title">Pay for the runs your agents make</span>}
                        intro="No seats and no minimum. The first 500 agent runs each month are free; after that you pay a few cents a run, and less as you use more."
                    />
                    <ul className="pricing-usage__tiers" aria-label="Price per agent run">
                        {tiers.map((tier, index) => (
                            <li key={tier.from} className="pricing-usage__tier" data-current={index === current || undefined}>
                                <span className="pricing-usage__tier-dot" aria-hidden="true" />
                                <Text variant={index === current ? "label" : "body"} tone={index === current ? "default" : "soft"}>
                                    {rangeLabel(tier)}
                                </Text>
                                <Text variant="label" className="pricing-usage__tier-price">
                                    {tier.price === 0 ? (
                                        "Free"
                                    ) : (
                                        <>
                                            {unitPrice.format(tier.price)}
                                            <Text as="small" variant="caption" className="pricing-usage__tier-unit">
                                                a run
                                            </Text>
                                        </>
                                    )}
                                </Text>
                            </li>
                        ))}
                    </ul>
                    <Text variant="copy" className="pricing-usage__aside">
                        A run is one task handed to an agent, from reading the issue to opening the pull request. Retries after a failed build are free.
                    </Text>
                </div>

                <Card padding="none" className="pricing-usage__card">
                    <Text variant="card-title">Estimate your month</Text>
                    <Text variant="copy" className="pricing-usage__card-intro">
                        Drag to the number of runs your team makes in a typical month.
                    </Text>

                    <Text as="p" variant="heading" className="pricing-usage__runs" aria-hidden="true">
                        {number.format(runs)}{" "}
                        <Text as="small" variant="body" tone="muted" className="pricing-usage__runs-unit">
                            runs a month
                        </Text>
                    </Text>
                    {/* The big number above is the slider's visible label; screen readers hear the runs and the cost. */}
                    <Slider
                        aria-label="Agent runs a month"
                        showValue={false}
                        min={0}
                        max={maxRuns}
                        step={500}
                        value={runs}
                        onChange={setRuns}
                        formatValue={(value) => `${number.format(value)} runs, about ${euro.format(estimate(value).total)} a month`}
                    />
                    <div className="pricing-usage__scale" aria-hidden="true">
                        {[0, 25_000, 50_000, 75_000, 100_000].map((mark) => (
                            <span key={mark}>{mark === 0 ? "0" : `${mark / 1000}k`}</span>
                        ))}
                    </div>

                    <div className="pricing-usage__breakdown">
                        {lines.map(({ tier, count, cost }) => (
                            <Text as="div" variant="body" tone="soft" key={tier.from} className="pricing-usage__line" data-idle={count === 0 || undefined}>
                                <span>
                                    {number.format(count)} runs {tier.price === 0 ? "free" : `at ${unitPrice.format(tier.price)}`}
                                </span>
                                <span>{euro.format(cost)}</span>
                            </Text>
                        ))}
                    </div>

                    <div className="pricing-usage__total">
                        <Text as="p" variant="label">
                            Estimated month
                            <Text as="small" variant="caption" className="pricing-usage__total-note">
                                Before VAT, billed on the 1st
                            </Text>
                        </Text>
                        <Text as="p" variant="section-title" className="pricing-usage__total-amount">
                            {euro.format(total)}
                        </Text>
                    </div>

                    <Button variant="primary" shape="pill" size="lg" fullWidth className="pricing-usage__action">
                        Start with 500 free runs
                    </Button>
                    <Text as="p" variant="caption" align="center" className="pricing-usage__fine">
                        Set a monthly cap in settings and Acme pauses agents at the cap rather than charging more.
                    </Text>
                </Card>
            </div>
        </section>
    );
}
