import { Button, Card, SectionHeading, Text } from "@openwarelabs/ui";
import { ArrowRight, CalendarClock, Check, CreditCard, Users } from "lucide-react";

import "./PricingSingle.css";

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
        <section className="pricing-single" aria-labelledby="pricing-single-title">
            <div className="pricing-single__inner">
                <SectionHeading
                    align="center"
                    eyebrow="Pricing"
                    title={<span id="pricing-single-title">One plan, with everything in it</span>}
                    intro="No tiers to compare and nothing held back for a pricier plan. You pay for the people on your team, and that's all."
                />

                <Card padding="none" className="pricing-single__card">
                    <div className="pricing-single__details">
                        <Text variant="heading">Acme for teams</Text>
                        <Text variant="copy" className="pricing-single__description">
                            Plan the work, hand routine tasks to agents, review every change and ship it. Every feature is on from day one.
                        </Text>
                        <Text as="p" variant="label" tone="primary" className="pricing-single__included">
                            What's included
                        </Text>
                        <ul className="pricing-single__features">
                            {included.map((item) => (
                                <Text as="li" variant="body" tone="soft" key={item}>
                                    <Check size={16} aria-hidden="true" />
                                    {item}
                                </Text>
                            ))}
                        </ul>
                    </div>

                    <div className="pricing-single__offer">
                        <Text as="p" variant="label" tone="soft">
                            Pay monthly, per person
                        </Text>
                        <Text as="p" variant="label" tone="muted" className="pricing-single__price">
                            <Text as="span" variant="page-title" tone="default" className="pricing-single__amount">
                                €12
                            </Text>
                            EUR
                        </Text>
                        <Text variant="body" tone="muted" className="pricing-single__unit">
                            a person a month, before VAT
                        </Text>
                        <Button variant="primary" shape="pill" size="lg" fullWidth endIcon={<ArrowRight size={16} />}>
                            Start a 14-day trial
                        </Button>
                        <Text as="p" variant="caption" className="pricing-single__fine">
                            No card needed for the trial. We'll email you three days before it ends.
                        </Text>
                    </div>
                </Card>

                <ul className="pricing-single__promises">
                    {promises.map(({ icon: Icon, text }) => (
                        <Text as="li" variant="body" tone="muted" key={text}>
                            <Icon size={16} aria-hidden="true" />
                            {text}
                        </Text>
                    ))}
                </ul>
            </div>
        </section>
    );
}
