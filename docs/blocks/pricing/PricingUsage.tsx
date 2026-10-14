import { Pricing05, type Pricing05Tier } from "@openwarelabs/blocks";

/** Price bands: each run is charged at the band it falls in, like income tax. */
const tiers: Pricing05Tier[] = [
    { from: 0, to: 500, price: 0 },
    { from: 500, to: 10_000, price: 0.04 },
    { from: 10_000, to: 50_000, price: 0.03 },
    { from: 50_000, to: Infinity, price: 0.02 },
];

export function PricingUsage() {
    return (
        <Pricing05
            eyebrow="Pay as you go"
            title="Pay for the runs your agents make"
            description="No seats and no minimum. The first 500 agent runs each month are free; after that you pay a few cents a run, and less as you use more."
            tiers={tiers}
            aside="A run is one task handed to an agent, from reading the issue to opening the pull request. Retries after a failed build are free."
            estimate={{
                title: "Estimate your month",
                description: "Drag to the number of runs your team makes in a typical month.",
                totalLabel: "Estimated month",
                totalNote: "Before VAT, billed on the 1st",
            }}
            max={100_000}
            step={500}
            defaultValue={12_000}
            currency="EUR"
            locale="en-IE"
            action={{ label: "Start with 500 free runs", href: "#start" }}
            note="Set a monthly cap in settings and Acme pauses agents at the cap rather than charging more."
            labels={{ unit: "run", units: "runs", tiers: "Price per agent run", slider: "Agent runs a month" }}
        />
    );
}
