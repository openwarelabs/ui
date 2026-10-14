import { Hero04 } from "@openwarelabs/blocks";
import { Avatar, Badge, ProgressBar } from "@openwarelabs/ui";
import { ArrowRight, Bot, Check, GitPullRequest, Rocket, SquareKanban } from "lucide-react";

import "./HeroDotGrid.css";

/** Work in progress, drawn with Openware components: a ticket, an agent on it, a review and a deploy. */
function PlanCards({ side }: { side: "start" | "end" }) {
    if (side === "start") {
        return (
            <div className="hero-dot-grid__side hero-dot-grid__side--start" role="img" aria-label="A planned ticket, and an agent running its tests.">
                <div className="hero-dot-grid__card">
                    <span className="hero-dot-grid__card-top">
                        <span className="hero-dot-grid__card-label">
                            <SquareKanban size={14} />
                            <span className="hero-dot-grid__mono">BIL-482</span>
                        </span>
                        <Badge size="sm">Planned</Badge>
                    </span>
                    <span className="hero-dot-grid__card-title">Fix invoice dates in the EU</span>
                    <span className="hero-dot-grid__card-foot">
                        <Avatar name="Tomás Reyes" size="sm" />
                        Tomás Reyes
                    </span>
                </div>
                <div className="hero-dot-grid__card">
                    <span className="hero-dot-grid__card-top">
                        <span className="hero-dot-grid__card-label">
                            <Bot size={14} />
                            Agent run
                        </span>
                        <span className="hero-dot-grid__mono">2m 14s</span>
                    </span>
                    <span className="hero-dot-grid__card-title">Writing the fix for BIL-482</span>
                    <ProgressBar label="Tests" value={128} max={214} valueLabel="128 of 214" />
                </div>
            </div>
        );
    }
    return (
        <div className="hero-dot-grid__side hero-dot-grid__side--end" role="img" aria-label="A review approved by Maya Chen, and a deploy that's live.">
            <div className="hero-dot-grid__card">
                <span className="hero-dot-grid__card-top">
                    <span className="hero-dot-grid__card-label">
                        <GitPullRequest size={14} />
                        Review
                    </span>
                    <Badge size="sm" variant="success" icon={<Check size={12} />}>
                        Approved
                    </Badge>
                </span>
                <span className="hero-dot-grid__card-title">Pricing page copy</span>
                <span className="hero-dot-grid__card-foot">
                    <Avatar name="Maya Chen" size="sm" />
                    Maya Chen
                </span>
            </div>
            <div className="hero-dot-grid__card">
                <span className="hero-dot-grid__card-top">
                    <span className="hero-dot-grid__card-label">
                        <Rocket size={14} />
                        Deploy
                    </span>
                    <Badge size="sm" variant="success">
                        Live
                    </Badge>
                </span>
                <span className="hero-dot-grid__card-title">
                    <span className="hero-dot-grid__mono">marketing-site</span>
                </span>
                <span className="hero-dot-grid__card-foot">main · 4 minutes ago</span>
            </div>
        </div>
    );
}

export function HeroDotGrid() {
    return (
        <Hero04
            eyebrow="Planning"
            title="Lay out the plan. Watch it ship."
            description="Sketch a project as tickets on one sheet, hand the routine ones to agents, and follow each piece from the first idea to a live deploy."
            primaryAction={{ label: "Start planning", href: "#start", endIcon: <ArrowRight size={16} /> }}
            secondaryAction={{ label: "See a sample plan", href: "#sample" }}
            start={<PlanCards side="start" />}
            end={<PlanCards side="end" />}
        />
    );
}
