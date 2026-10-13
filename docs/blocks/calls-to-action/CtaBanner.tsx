import { Button, DotGrid, Text } from "@openwarelabs/ui";
import { ArrowRight, Clock } from "lucide-react";

import "./CtaBanner.css";

export function CtaBanner() {
    return (
        <section className="cta-banner" aria-labelledby="cta-banner-title">
            <DotGrid fade className="cta-banner__panel">
                <div className="cta-banner__content">
                    <div className="cta-banner__text">
                        <Text variant="section-title" id="cta-banner-title">
                            Give an agent its first issue today
                        </Text>
                        <Text variant="lead" className="cta-banner__lead">
                            Connect a repository, hand over something routine, and review the pull request it opens. Free for teams of up to five.
                        </Text>
                    </div>
                    <div className="cta-banner__side">
                        <div className="cta-banner__actions">
                            <Button variant="primary" shape="pill" size="lg" endIcon={<ArrowRight size={16} />}>
                                Start for free
                            </Button>
                            <Button shape="pill" size="lg">
                                Book a demo
                            </Button>
                        </div>
                        <Text as="p" variant="caption" className="cta-banner__note">
                            <Clock size={14} aria-hidden="true" />
                            Most teams are set up in ten minutes.
                        </Text>
                    </div>
                </div>
            </DotGrid>
        </section>
    );
}
