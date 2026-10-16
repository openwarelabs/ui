import { Cta03 } from "@openwarelabs/blocks";
import { Avatar, Badge, DotGrid, buttonClassName } from "@openwarelabs/ui";
import { ArrowRight, Check, CircleCheck, GitPullRequest, Rocket } from "lucide-react";

import "./CtaSplit.css";

const checks = [
    { name: "Tests", result: "214 passed" },
    { name: "Type check", result: "No errors" },
    { name: "Preview deploy", result: "Live in 48s" },
];

const diff = [
    { change: "context", text: "  export function dueDate(issued: Date, tz: string) {" },
    { change: "remove", text: "-   return addDays(issued, 30);" },
    { change: "add", text: "+   const local = inTimeZone(issued, tz);" },
    { change: "add", text: "+   return endOfDay(addDays(local, 30));" },
];

const points = ["Set up in about ten minutes", "Agents open pull requests; people merge them", "Free for up to five people"];

/** A pull request an agent opened, drawn with Openware components. Swap it for a screenshot: <img src="…" alt="…" />. */
function PullRequest() {
    return (
        <DotGrid
            fade
            className="cta-split__visual"
            role="img"
            aria-label="An Acme pull request opened by an agent: Fix invoice due dates in the customer's time zone, with tests, type check and preview deploy passing, approved by Siobhan Murphy and deployed to production."
        >
            <div className="cta-split__pr">
                <div className="cta-split__pr-head">
                    <span className="cta-split__pr-icon">
                        <GitPullRequest size={16} />
                    </span>
                    <span className="cta-split__pr-title">Fix invoice due dates in the customer's time zone</span>
                    <span className="cta-split__pr-meta">
                        billing-api #482
                        <span className="cta-split__pr-by">
                            · opened by an agent for
                            <Avatar name="Ciarán Kelly" size="sm" />
                            Ciarán
                        </span>
                    </span>
                    <Badge size="sm" variant="success">
                        Ready
                    </Badge>
                </div>
                <div className="cta-split__checks">
                    {checks.map((check) => (
                        <div key={check.name} className="cta-split__check">
                            <CircleCheck size={15} />
                            <span className="cta-split__check-name">{check.name}</span>
                            <span className="cta-split__check-result">{check.result}</span>
                        </div>
                    ))}
                </div>
                <div className="cta-split__diff">
                    <div className="cta-split__diff-file">
                        <span>src/invoices/due-date.ts</span>
                        <span className="cta-split__diff-stat">
                            <b>+12</b> <i>−4</i>
                        </span>
                    </div>
                    {diff.map((line) => (
                        <span key={line.text} className="cta-split__line" data-change={line.change}>
                            {line.text}
                        </span>
                    ))}
                </div>
                <div className="cta-split__pr-foot">
                    <span className="cta-split__approval">
                        <Avatar name="Siobhan Murphy" size="sm" />
                        Siobhan Murphy approved
                        <Check size={14} />
                    </span>
                    <span className={`${buttonClassName({ size: "sm" })} cta-split__fake-button`}>Merge and deploy</span>
                </div>
            </div>
            <div className="cta-split__deploy">
                <span className="cta-split__deploy-icon">
                    <Rocket size={16} />
                </span>
                <span>
                    <span className="cta-split__deploy-title">Deployed to production</span>
                    <span className="cta-split__deploy-meta">billing-api v2.18.0 · 4 min after review</span>
                </span>
            </div>
        </DotGrid>
    );
}

export function CtaSplit() {
    return (
        <Cta03
            eyebrow="Get started"
            title="Hand off the routine work this afternoon"
            description="Connect a repository, give an agent an issue, and review its pull request before the day is out. Every change still goes through your team."
            primaryAction={{ label: "Start for free", href: "#start", endIcon: <ArrowRight size={16} /> }}
            secondaryAction={{ label: "Book a demo", href: "#demo" }}
            points={points}
            visual={<PullRequest />}
        />
    );
}
