import { Hero03 } from "@openwarelabs/blocks";
import { Badge } from "@openwarelabs/ui";
import { Bot } from "lucide-react";

import "./HeroEmail.css";

const overnight = [
    { project: "billing-api", change: "Retry failed card payments after a day", status: "Ready", tone: "success" },
    { project: "marketing-site", change: "Fix the broken links on the pricing page", status: "Ready", tone: "success" },
    { project: "mobile-app", change: "Stop the upload test timing out", status: "Needs you", tone: "warning" },
    { project: "docs", change: "Update the API examples for version 3", status: "Ready", tone: "success" },
] as const;

/** What an agent leaves by morning, drawn with Openware components. */
function Digest() {
    return (
        <div
            className="hero-email__digest"
            role="img"
            aria-label="A morning summary in Acme: agents opened four pull requests overnight, three ready to merge and one that needs a person."
        >
            <div className="hero-email__digest-header">
                <span className="hero-email__digest-icon">
                    <Bot size={17} />
                </span>
                <span className="hero-email__digest-titles">
                    <span className="hero-email__digest-title">While you were away</span>
                    <span className="hero-email__digest-summary">4 pull requests overnight, 3 ready to merge</span>
                </span>
                <span className="hero-email__digest-time">07:58</span>
            </div>
            <ul className="hero-email__digest-list">
                {overnight.map((item) => (
                    <li key={item.change} className="hero-email__digest-row">
                        <span className="hero-email__digest-project">{item.project}</span>
                        <span className="hero-email__digest-change">{item.change}</span>
                        <Badge size="sm" variant={item.tone}>
                            {item.status}
                        </Badge>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function HeroEmail() {
    return (
        <Hero03
            eyebrow="Early access: Acme Agents"
            title="Your backlog, handled overnight"
            description="Agents pick up the routine tickets after your team logs off and leave a pull request for each by morning, with their reasoning written down. We're letting new teams in every week."
            submitLabel="Join the waitlist"
            // Stands in for the request to your waitlist.
            onSubmit={() => new Promise((resolve) => window.setTimeout(resolve, 700))}
            note="One email when your place is ready. Nothing else."
            successTitle="You're on the list"
            successDescription={(email) => `We'll write to ${email} when your team's place is ready.`}
            visual={<Digest />}
        />
    );
}
