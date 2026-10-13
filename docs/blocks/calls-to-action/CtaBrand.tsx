import { Button, DotGrid, Link, Text } from "@openwarelabs/ui";
import { ArrowRight, Check } from "lucide-react";

import "./CtaBrand.css";

const facts = ["Free for up to five people", "No card needed", "Your code stays in the EU"];

export function CtaBrand() {
    return (
        <section className="cta-brand" aria-labelledby="cta-brand-title">
            <DotGrid fade className="cta-brand__plate">
                <div className="cta-brand__content">
                    {/* A Chip, redrawn for the plate: the library's white Chip would glare on the brand colour. */}
                    <Text as="p" variant="body" className="cta-brand__eyebrow">
                        Ready when you are
                    </Text>
                    <Text as="h2" variant="page-title" id="cta-brand-title" className="cta-brand__title">
                        Spend this week on the work only your team can do
                    </Text>
                    <Text variant="lead" className="cta-brand__lead">
                        Hand the dependency bumps, flaky tests and copy changes to agents. Review what they open, and ship it the same afternoon.
                    </Text>
                    <div className="cta-brand__actions">
                        <Button shape="pill" size="lg" className="cta-brand__action" endIcon={<ArrowRight size={16} />}>
                            Start for free
                        </Button>
                        <Link href="#" variant="standalone" className="cta-brand__link">
                            <Text variant="label">Talk to sales</Text>
                            <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                    </div>
                    <ul className="cta-brand__facts">
                        {facts.map((fact) => (
                            <Text as="li" variant="body" key={fact}>
                                <Check size={15} aria-hidden="true" />
                                {fact}
                            </Text>
                        ))}
                    </ul>
                </div>
            </DotGrid>
        </section>
    );
}
