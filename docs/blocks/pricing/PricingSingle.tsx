import { Pricing04 } from "@openwarelabs/blocks";
import { ArrowRight, CalendarClock, CreditCard, Users } from "lucide-react";

const included = [
    "Unlimited projects",
    "1,000 agent runs a person",
    "A preview deploy per pull request",
    "Required reviews and branch rules",
    "10,000 build minutes a month",
    "One-click rollback",
    "Google, GitHub or SAML sign-in",
    "Support within a working day",
];

const promises = [
    { icon: CalendarClock, text: "Cancel any time, from settings" },
    { icon: Users, text: "Add or remove people whenever you like" },
    { icon: CreditCard, text: "Invoices with your VAT number" },
];

export function PricingSingle() {
    return (
        <Pricing04
            eyebrow="Pricing"
            title="One plan, with everything in it"
            description="No tiers to compare and nothing held back for a pricier plan. You pay for the people on your team, and that's all."
            product={{
                name: "Acme for teams",
                description: "Plan the work, hand routine tasks to agents, review every change and ship it. Every feature is on from day one.",
                featuresTitle: "What's included",
                features: included,
            }}
            offer={{
                label: "Pay monthly, per person",
                price: "€12",
                currency: "EUR",
                unit: "a person a month, before VAT",
                action: { label: "Start a 14-day trial", href: "#trial", endIcon: <ArrowRight size={16} /> },
                note: "No card needed for the trial. We'll email you three days before it ends.",
            }}
            promises={promises.map(({ icon: Icon, text }) => ({ text, icon: <Icon size={16} aria-hidden="true" /> }))}
        />
    );
}
