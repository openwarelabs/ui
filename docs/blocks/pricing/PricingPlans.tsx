import { Badge, Button, Card, Link, SectionHeading } from "@openwarelabs/ui";
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
                                    <h3 id={`pricing-plans-${plan.id}`} className="pricing-plans__name">
                                        {plan.name}
                                    </h3>
                                    {plan.recommended ? (
                                        <Badge size="sm" variant="active">
                                            Most teams pick this
                                        </Badge>
                                    ) : null}
                                </div>
                                <p className="pricing-plans__summary">{plan.summary}</p>
                                <p className="pricing-plans__price">
                                    <span className="pricing-plans__amount">{plan.price}</span>
                                    <span className="pricing-plans__unit">{plan.unit}</span>
                                </p>
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
                                <p className="pricing-plans__lead">{plan.lead}</p>
                                <ul className="pricing-plans__features">
                                    {plan.features.map((feature) => (
                                        <li key={feature}>
                                            <Check size={16} aria-hidden="true" />
                                            {feature}
                                        </li>
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
                    <p className="pricing-plans__enterprise-text">
                        <strong>Enterprise</strong> for over 200 people, self-hosted runners or data kept in the EU. We'll build the plan with you.
                    </p>
                    <Link href="#" variant="standalone" className="pricing-plans__enterprise-link">
                        Talk to us
                        <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                </div>

                <p className="pricing-plans__note">Prices in euro, before VAT. Pay monthly by card, or yearly by card or invoice.</p>
            </div>
        </section>
    );
}
