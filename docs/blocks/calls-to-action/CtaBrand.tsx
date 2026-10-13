import { Button, DotGrid } from "@openwarelabs/ui";
import { ArrowRight, Check } from "lucide-react";

import "./CtaBrand.css";

const facts = ["Free for up to five people", "No card needed", "Your code stays in the EU"];

export function CtaBrand() {
    return (
        <section className="cta-brand" aria-labelledby="cta-brand-title">
            <DotGrid fade className="cta-brand__plate">
                <div className="cta-brand__content">
                    <p className="cta-brand__eyebrow">Ready when you are</p>
                    <h2 id="cta-brand-title" className="cta-brand__title">
                        Spend this week on the work only your team can do
                    </h2>
                    <p className="cta-brand__lead">
                        Hand the dependency bumps, flaky tests and copy changes to agents. Review what they open, and ship it the same afternoon.
                    </p>
                    <div className="cta-brand__actions">
                        <Button shape="pill" size="lg" className="cta-brand__action" endIcon={<ArrowRight size={16} />}>
                            Start for free
                        </Button>
                        <a href="#" className="cta-brand__link">
                            Talk to sales
                            <ArrowRight size={16} aria-hidden="true" />
                        </a>
                    </div>
                    <ul className="cta-brand__facts">
                        {facts.map((fact) => (
                            <li key={fact}>
                                <Check size={15} aria-hidden="true" />
                                {fact}
                            </li>
                        ))}
                    </ul>
                </div>
            </DotGrid>
        </section>
    );
}
