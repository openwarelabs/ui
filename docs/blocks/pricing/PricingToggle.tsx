import { useState } from "react";

import { Badge, Button, SectionHeading, SegmentedControl, VisuallyHidden } from "@openwarelabs/ui";
import { Check } from "lucide-react";

import "./PricingToggle.css";

type Period = "monthly" | "yearly";

interface Plan {
    id: string;
    name: string;
    summary: string;
    /** Per person a month, or null for a plan that's free or priced by hand. */
    monthly: number | null;
    action: string;
    features: string[];
    popular?: boolean;
}

const plans: Plan[] = [
    {
        id: "free",
        name: "Free",
        summary: "For side projects and small teams.",
        monthly: 0,
        action: "Start for free",
        features: ["Up to 5 people", "3 projects", "200 agent runs a month", "Community support"],
    },
    {
        id: "team",
        name: "Team",
        summary: "For teams that ship every day.",
        monthly: 12,
        action: "Start a 14-day trial",
        features: ["Unlimited projects", "1,000 agent runs a person", "Required reviews", "Email support"],
        popular: true,
    },
    {
        id: "business",
        name: "Business",
        summary: "For companies with a security team.",
        monthly: 24,
        action: "Start a 14-day trial",
        features: ["3,000 agent runs a person", "SAML single sign-on", "Audit log for a year", "Replies within 4 hours"],
    },
    {
        id: "enterprise",
        name: "Enterprise",
        summary: "Your own runners, limits and terms.",
        monthly: null,
        action: "Talk to sales",
        features: ["Custom runs and minutes", "SCIM provisioning", "Self-hosted runners", "A named success manager"],
    },
];

// Paying yearly costs ten months: two months free.
const yearlyMonths = 10;

function Price({ plan, period }: { plan: Plan; period: Period }) {
    if (plan.monthly === null) {
        return (
            <div className="pricing-toggle__price">
                <p className="pricing-toggle__figure">
                    <span className="pricing-toggle__amount pricing-toggle__amount--text">Custom</span>
                </p>
                <p className="pricing-toggle__billing">Volume pricing, paid by invoice</p>
            </div>
        );
    }
    if (plan.monthly === 0) {
        return (
            <div className="pricing-toggle__price">
                <p className="pricing-toggle__figure">
                    <span className="pricing-toggle__amount">€0</span>
                    <span className="pricing-toggle__unit">for up to 5 people</span>
                </p>
                <p className="pricing-toggle__billing">Free for good, no card needed</p>
            </div>
        );
    }
    const perMonth = period === "yearly" ? (plan.monthly * yearlyMonths) / 12 : plan.monthly;
    const perYear = plan.monthly * yearlyMonths;
    return (
        <div className="pricing-toggle__price">
            <p className="pricing-toggle__figure">
                {/* The key restarts the fade when the period changes. */}
                <span key={period} className="pricing-toggle__amount">
                    €{perMonth}
                </span>
                <span className="pricing-toggle__unit">a person a month</span>
            </p>
            <p className="pricing-toggle__billing">
                {period === "yearly" ? (
                    <>
                        €{perYear} billed yearly · <span className="pricing-toggle__saving">save €{plan.monthly * 2}</span>
                    </>
                ) : (
                    "Billed monthly, cancel any time"
                )}
            </p>
        </div>
    );
}

export function PricingToggle() {
    const [period, setPeriod] = useState<Period>("yearly");

    return (
        <section className="pricing-toggle" aria-labelledby="pricing-toggle-title">
            <div className="pricing-toggle__inner">
                <div className="pricing-toggle__header">
                    <SectionHeading
                        eyebrow="Plans"
                        title={<span id="pricing-toggle-title">One workspace, four ways to pay for it</span>}
                        intro="Move between plans from settings whenever you like. We work out the difference to the day."
                    />
                    <div className="pricing-toggle__switch">
                        <SegmentedControl
                            aria-label="Billing period"
                            value={period}
                            onChange={(value) => setPeriod(value as Period)}
                            options={[
                                { value: "monthly", label: "Monthly" },
                                { value: "yearly", label: "Yearly" },
                            ]}
                        />
                        <p className="pricing-toggle__switch-note">Pay yearly and get two months free.</p>
                    </div>
                </div>

                <VisuallyHidden aria-live="polite">{period === "yearly" ? "Showing yearly prices." : "Showing monthly prices."}</VisuallyHidden>

                <div className="pricing-toggle__panel">
                    {plans.map((plan) => (
                        <div key={plan.id} className="pricing-toggle__plan" data-popular={plan.popular || undefined}>
                            <div className="pricing-toggle__name-row">
                                <h3 className="pricing-toggle__name">{plan.name}</h3>
                                {plan.popular ? (
                                    <Badge size="sm" variant="active">
                                        Popular
                                    </Badge>
                                ) : null}
                            </div>
                            <p className="pricing-toggle__summary">{plan.summary}</p>
                            <Price plan={plan} period={period} />
                            <Button variant={plan.popular ? "primary" : "secondary"} shape="pill" fullWidth>
                                {plan.action}
                            </Button>
                            <ul className="pricing-toggle__features" aria-label={`${plan.name} includes`}>
                                {plan.features.map((feature) => (
                                    <li key={feature}>
                                        <Check size={16} aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <p className="pricing-toggle__note">Prices in euro, before VAT. Yearly plans can add people at any time; we bill them for the months left.</p>
            </div>
        </section>
    );
}
