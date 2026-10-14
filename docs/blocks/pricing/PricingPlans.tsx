import { Pricing01, type Pricing01Plan } from "@openwarelabs/blocks";
import { ArrowRight, Building2 } from "lucide-react";

const plans: Pricing01Plan[] = [
    {
        name: "Free",
        summary: "For a small team finding its feet.",
        price: "€0",
        unit: "for up to 5 people",
        action: { label: "Start for free", href: "#start" },
        featuresTitle: "Free for good:",
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
        name: "Team",
        summary: "For teams shipping every day.",
        price: "€12",
        unit: "a person a month",
        action: { label: "Start a 14-day trial", href: "#trial", endIcon: <ArrowRight size={16} /> },
        featuresTitle: "Everything in Free, plus:",
        features: [
            "Unlimited people and projects",
            "1,000 agent runs a person a month",
            "10,000 build minutes a month",
            "Required reviews and branch rules",
            "90 days of deploy history",
            "Email support within a working day",
        ],
        recommended: true,
        badge: "Most teams pick this",
    },
    {
        name: "Business",
        summary: "For companies with a security team.",
        price: "€24",
        unit: "a person a month",
        action: { label: "Start a 14-day trial", href: "#trial" },
        featuresTitle: "Everything in Team, plus:",
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
        <Pricing01
            eyebrow="Pricing"
            title="Start free, pay as your team grows"
            description="Every plan includes agents, reviews and preview deploys. As you grow, pay for more people, more runs and tighter controls."
            plans={plans}
            enterprise={{
                icon: <Building2 size={18} />,
                title: "Enterprise",
                description: "for over 200 people, self-hosted runners or data kept in the EU. We'll build the plan with you.",
                link: { label: "Talk to us", href: "#" },
            }}
            note="Prices in euro, before VAT. Pay monthly by card, or yearly by card or invoice."
        />
    );
}
