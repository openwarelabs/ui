import { Button, SectionHeading, Text } from "@openwarelabs/ui";
import { ArrowRight } from "lucide-react";

import "./SectionHeadingSplit.css";

export function SectionHeadingSplit() {
    return (
        <section className="section-heading-split" aria-labelledby="section-heading-split-title">
            <div className="section-heading-split__inner">
                {/* The intro sits beside the title instead of under it, so SectionHeading gets none. */}
                <SectionHeading eyebrow="Agents" title={<span id="section-heading-split-title">Hand the routine work to agents, and keep the final say</span>} />
                <div className="section-heading-split__aside">
                    <Text variant="lead" className="section-heading-split__intro">
                        Assign an issue and an agent branches, writes the change and runs your tests. It comes back as a pull request with its reasoning, ready for review.
                    </Text>
                    <Button shape="pill" endIcon={<ArrowRight size={16} />}>
                        How agents work
                    </Button>
                </div>
            </div>
        </section>
    );
}
