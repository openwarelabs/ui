import { Hero02 } from "@openwarelabs/blocks";
import { Avatar, Badge, buttonClassName, Steps } from "@openwarelabs/ui";
import { ArrowRight, Bot, GitPullRequest, Play } from "lucide-react";

import "./HeroSplit.css";

const run = [
    { title: "Ticket", description: "BIL-482" },
    { title: "Change", description: "1 file" },
    { title: "Tests", description: "214 passed" },
    { title: "Review", description: "Clara Novak" },
];

const diff = [
    { number: 12, change: null, text: "export function formatInvoiceDate(date: Date, workspace: Workspace) {" },
    { number: 13, change: "removed", text: '    return date.toLocaleDateString("en-US");' },
    { number: 13, change: "added", text: "    return date.toLocaleDateString(workspace.locale, {" },
    { number: 14, change: "added", text: '        day: "numeric", month: "long", year: "numeric",' },
    { number: 15, change: "added", text: "    });" },
    { number: 16, change: null, text: "}" },
] as const;

/** The product, drawn with Openware components. Swap it for a screenshot: <img src="…" alt="…" />. */
function ProductShot() {
    return (
        <div
            className="hero-split__shot"
            role="img"
            aria-label="An agent's pull request in Acme: it fixed invoice dates in billing-api, the tests passed, and it is waiting for Clara Novak's review."
        >
            <div className="hero-split__shot-header">
                <div className="hero-split__pr">
                    <span className="hero-split__pr-icon">
                        <GitPullRequest size={15} />
                    </span>
                    <span className="hero-split__pr-title">Fix invoice dates in the EU</span>
                    <Badge size="sm" variant="active">
                        In review
                    </Badge>
                </div>
                <div className="hero-split__pr-meta">
                    billing-api · <span className="hero-split__mono">fix/invoice-dates</span> · opened by an agent for Tomás Reyes
                </div>
            </div>

            <Steps className="hero-split__steps" orientation="horizontal" items={run} current={3} label="Agent run" />

            <div className="hero-split__diff">
                <div className="hero-split__file">
                    <span className="hero-split__mono">src/invoices/format.ts</span>
                    <span className="hero-split__counts hero-split__mono">
                        <span className="hero-split__added-count">+3</span>
                        <span className="hero-split__removed-count">−1</span>
                    </span>
                </div>
                <div className="hero-split__lines">
                    {diff.map((line, index) => (
                        <div key={index} className="hero-split__line" data-change={line.change ?? undefined}>
                            <span className="hero-split__line-number">{line.number}</span>
                            <span className="hero-split__sign">{line.change === "added" ? "+" : line.change === "removed" ? "−" : " "}</span>
                            <span>{line.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="hero-split__reasoning">
                <Bot size={16} />
                <p>
                    <strong>Why this change.</strong> Invoices used the US date format everywhere. They now follow the workspace's locale, so an invoice in
                    Dublin reads 9 October 2026.
                </p>
            </div>

            <div className="hero-split__shot-footer">
                <span className="hero-split__reviewer">
                    <Avatar name="Clara Novak" size="sm" />
                    <span>Clara Novak is reviewing</span>
                </span>
                <span className="hero-split__buttons">
                    <span className={buttonClassName({ size: "sm" })}>Request changes</span>
                    <span className={buttonClassName({ variant: "primary", size: "sm" })}>Approve and merge</span>
                </span>
            </div>
        </div>
    );
}

export function HeroSplit() {
    return (
        <Hero02
            eyebrow="Acme Agents"
            title="Hand the routine work to agents"
            description="Assign a ticket and an agent branches, writes the change and runs your tests. It comes back as a pull request with its reasoning, ready for your review."
            primaryAction={{ label: "Start for free", href: "#start", endIcon: <ArrowRight size={16} /> }}
            secondaryAction={{ label: "Watch the demo", href: "#demo", startIcon: <Play size={16} /> }}
            points={["Runs in your own CI", "Never merges without a person", "Free for up to five people"]}
            visual={<ProductShot />}
        />
    );
}
