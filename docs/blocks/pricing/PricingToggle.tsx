import { Pricing02, type Pricing02Plan, type Pricing02Price } from "@openwarelabs/blocks";
import { Text } from "@openwarelabs/ui";

// Paying yearly costs ten months: two months free.
const yearlyMonths = 10;

/** A paid plan's price each period, from its monthly price per person. */
function paid(monthly: number): Record<"monthly" | "yearly", Pricing02Price> {
    return {
        monthly: { amount: `€${monthly}`, unit: "a person a month", billing: "Billed monthly, cancel any time" },
        yearly: {
            amount: `€${(monthly * yearlyMonths) / 12}`,
            unit: "a person a month",
            billing: (
                <>
                    €{monthly * yearlyMonths} billed yearly ·{" "}
                    <Text variant="caption" tone="success">
                        save €{monthly * 2}
                    </Text>
                </>
            ),
        },
    };
}

const plans: Pricing02Plan[] = [
    {
        name: "Free",
        summary: "For side projects and small teams.",
        price: { amount: "€0", unit: "for up to 5 people", billing: "Free for good, no card needed" },
        action: { label: "Start for free", href: "#start" },
        features: ["Up to 5 people", "3 projects", "200 agent runs a month", "Community support"],
    },
    {
        name: "Team",
        summary: "For teams that ship every day.",
        price: paid(12),
        action: { label: "Start a 14-day trial", href: "#trial" },
        features: ["Unlimited projects", "1,000 agent runs a person", "Required reviews", "Email support"],
        recommended: true,
        badge: "Popular",
    },
    {
        name: "Business",
        summary: "For companies with a security team.",
        price: paid(24),
        action: { label: "Start a 14-day trial", href: "#trial" },
        features: ["3,000 agent runs a person", "SAML single sign-on", "Audit log for a year", "Replies within 4 hours"],
    },
    {
        name: "Enterprise",
        summary: "Your own runners, limits and terms.",
        price: { amount: "Custom", custom: true, billing: "Volume pricing, paid by invoice" },
        action: { label: "Talk to sales", href: "#sales" },
        features: ["Custom runs and minutes", "SCIM provisioning", "Self-hosted runners", "A named success manager"],
    },
];

export function PricingToggle() {
    return (
        <Pricing02
            eyebrow="Plans"
            title="One workspace, four ways to pay for it"
            description="Move between plans from settings whenever you like. We work out the difference to the day."
            plans={plans}
            defaultPeriod="yearly"
            periodNote="Pay yearly and get two months free."
            note="Prices in euro, before VAT. Yearly plans can add people at any time; we bill them for the months left."
        />
    );
}
