import { Link, SectionHeading } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import "./SectionHeadingWithLink.css";

export function SectionHeadingWithLink() {
    return (
        <section className="section-heading-with-link" aria-labelledby="section-heading-with-link-title">
            <div className="section-heading-with-link__inner">
                <SectionHeading
                    eyebrow="Changelog"
                    title={<span id="section-heading-with-link-title">What we shipped this month</span>}
                    intro="Agents that open their own pull requests, rollbacks in one click, and forty smaller fixes."
                />
                <Link href="#" variant="standalone" className="section-heading-with-link__link">
                    All releases
                    <ArrowRight size={16} aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}
