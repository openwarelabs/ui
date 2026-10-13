import { Badge, Button, Card, Link, SectionHeading, Text } from "@openwarelabs/ui";
import { ArrowRight, Building2, Check } from "lucide-react";

import "./PricingPlans.css";

interface Plan {
    id: string;
    name: string;
    summary: string;
    price: string;
    unit: string;
    action: string;
    lead: string;
    features: string[];
    recommended?: boolean;
}

const plans: Plan[] = [
    {
        id: "free",
        name: "Free",
        summary: "For a small team finding its feet.",
        price: "€0",
        unit: "for up to 5 people",
        action: "Start for free",
        lead: "Free for good:",
        features: [
            "3 projects",
            "200 agent runs a month",
            "1,000 build minutes a month",
            "A preview deploy for every pull request",
            "7 days of deploy history",
            "Help from the community forum",
        ],
    },
    {
        id: "team",
        name: "Team",
        summary: "For teams shipping every day.",
        price: "€12",
        unit: "a person a month",
        action: "Start a 14-day trial",
        lead: "Everything in Free, plus:",
        features: [
            "Unlimited people and projects",
            "1,000 agent runs a person a month",
            "10,000 build minutes a month",
            "Required reviews and branch rules",
            "90 days of deploy history",
            "Email support within a working day",
        ],
        recommended: true,
    },
    {
        id: "business",
        name: "Business",
        summary: "For companies with a security team.",
        price: "€24",
        unit: "a person a month",
        action: "Start a 14-day trial",
        lead: "Everything in Team, plus:",
        features: [
            "3,000 agent runs a person a month",
            "40,000 build minutes a month",
            "SAML single sign-on",
            "Audit log, kept for a year",
            "Custom roles and permissions",
            "Support replies within 4 hours",
        ],
    },
];

export function PricingPlans() {
    return (
        <section className="pricing-plans" aria-labelledby="pricing-plans-title">
            <div className="pricing-plans__inner">
                <SectionHeading
                    align="center"
                    eyebrow="Pricing"
                    title={<span id="pricing-plans-title">Start free, pay as your team grows</span>}
                    intro="Every plan includes agents, reviews and preview deploys. As you grow, pay for more people, more runs and tighter controls."
                />

                <div className="pricing-plans__grid">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            padding="none"
                            className="pricing-plans__card"
                            data-recommended={plan.recommended || undefined}
                            aria-labelledby={`pricing-plans-${plan.id}`}
                            role="group"
                        >
                            <div className="pricing-plans__head">
                                <div className="pricing-plans__name-row">
                                    <Text variant="card-title" id={`pricing-plans-${plan.id}`}>
                                        {plan.name}
                                    </Text>
                                    {plan.recommended ? (
                                        <Badge size="sm" variant="active">
                                            Most teams pick this
                                        </Badge>
                                    ) : null}
                                </div>
                                <Text variant="copy" className="pricing-plans__summary">
                                    {plan.summary}
                                </Text>
                                <Text as="p" variant="body" tone="muted" className="pricing-plans__price">
                                    <Text as="span" variant="section-title" tone="default" className="pricing-plans__amount">
                                        {plan.price}
                                    </Text>
                                    {plan.unit}
                                </Text>
                                <Button
                                    variant={plan.recommended ? "primary" : "secondary"}
                                    shape="pill"
                                    fullWidth
                                    endIcon={plan.recommended ? <ArrowRight size={16} /> : undefined}
                                >
                                    {plan.action}
                                </Button>
                            </div>
                            <div className="pricing-plans__body">
                                <Text as="p" variant="label">
                                    {plan.lead}
                                </Text>
                                <ul className="pricing-plans__features">
                                    {plan.features.map((feature) => (
                                        <Text as="li" variant="body" tone="soft" key={feature}>
                                            <Check size={16} aria-hidden="true" />
                                            {feature}
                                        </Text>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="pricing-plans__enterprise">
                    <span className="pricing-plans__enterprise-icon" aria-hidden="true">
                        <Building2 size={18} />
                    </span>
                    <Text variant="copy" className="pricing-plans__enterprise-text">
                        <Text as="strong" variant="label" tone="default">
                            Enterprise
                        </Text>{" "}
                        for over 200 people, self-hosted runners or data kept in the EU. We'll build the plan with you.
                    </Text>
                    <Link href="#" variant="standalone" className="pricing-plans__enterprise-link">
                        Talk to us
                        <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>

                <Text as="p" variant="caption" align="center" className="pricing-plans__note">
                    Prices in euro, before VAT. Pay monthly by card, or yearly by card or invoice.
                </Text>
            </div>
        </section>
    );
}
