import { Button, DotGrid } from "@openwarelabs/ui";
import { ArrowRight, Clock } from "lucide-react";

import "./CtaBanner.css";

export function CtaBanner() {
    return (
        <section className="cta-banner" aria-labelledby="cta-banner-title">
            <DotGrid fade className="cta-banner__panel">
                <div className="cta-banner__content">
                    <div className="cta-banner__text">
                        <h2 id="cta-banner-title" className="cta-banner__title">
                            Give an agent its first issue today
                        </h2>
                        <p className="cta-banner__lead">
                            Connect a repository, hand over something routine, and review the pull request it opens. Free for teams of up to five.
                        </p>
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
                        <p className="cta-banner__note">
                            <Clock size={14} aria-hidden="true" />
                            Most teams are set up in ten minutes.
                        </p>
                    </div>
                </div>
            </DotGrid>
        </section>
    );
}
