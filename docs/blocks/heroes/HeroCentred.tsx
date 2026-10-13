import { Avatar, Badge, Button, Chip, Stat } from "@openwarelabs/ui";
import { ArrowRight, FolderKanban, Gauge, Inbox, Rocket, Settings } from "lucide-react";

import "./HeroCentred.css";

const nav = [
    { label: "Overview", icon: Gauge, active: true },
    { label: "Projects", icon: FolderKanban },
    { label: "Deploys", icon: Rocket },
    { label: "Inbox", icon: Inbox },
    { label: "Settings", icon: Settings },
];

const deploys = [
    { project: "marketing-site", branch: "main", by: "Maya Chen", status: "Live", tone: "success" },
    { project: "billing-api", branch: "fix/invoice-dates", by: "Tomás Reyes", status: "Building", tone: "active" },
    { project: "mobile-app", branch: "release/2.4", by: "Clara Novak", status: "Live", tone: "success" },
] as const;

/** The product, drawn with Openware components. Swap it for a screenshot: <img src="…" alt="…" />. */
function ProductShot() {
    return (
        <div className="hero-centred__shot" role="img" aria-label="The Acme overview: this week's deploys, review time and agent runs, and the latest deploys.">
            <div className="hero-centred__chrome" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <div className="hero-centred__app">
                <div className="hero-centred__sidebar">
                    <span className="hero-centred__workspace">
                        <span className="hero-centred__mark" />
                        Acme
                    </span>
                    {nav.map(({ label, icon: Icon, active }) => (
                        <span key={label} className="hero-centred__nav-item" data-active={active || undefined}>
                            <Icon size={15} />
                            {label}
                        </span>
                    ))}
                </div>
                <div className="hero-centred__main">
                    <p className="hero-centred__page-title">Overview</p>
                    <div className="hero-centred__stats">
                        <Stat label="Deploys this week" value="128" change="+12%" trend={[8, 12, 10, 15, 14, 19, 22]} />
                        <Stat label="Median review" value="42m" change="−18%" changeTone="positive" trend={[70, 64, 66, 55, 50, 46, 42]} />
                        <Stat label="Agent runs" value="1,904" change="+31%" trend={[20, 26, 25, 33, 38, 41, 52]} />
                    </div>
                    <div className="hero-centred__table">
                        {deploys.map((deploy) => (
                            <div key={deploy.project} className="hero-centred__row">
                                <span className="hero-centred__project">{deploy.project}</span>
                                <span className="hero-centred__branch">{deploy.branch}</span>
                                <span className="hero-centred__by">
                                    <Avatar name={deploy.by} size="sm" />
                                    {deploy.by}
                                </span>
                                <Badge size="sm" variant={deploy.tone}>
                                    {deploy.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function HeroCentred() {
    return (
        <section className="hero-centred" aria-labelledby="hero-centred-title">
            <div className="hero-centred__inner">
                <Chip>New: agents that open their own pull requests</Chip>
                <h1 id="hero-centred-title" className="hero-centred__title">
                    The workspace for shipping software
                </h1>
                <p className="hero-centred__lead">
                    Plan the work, hand the routine parts to agents, review every change and ship it. One place for your team, from the first idea to the
                    deploy.
                </p>
                <div className="hero-centred__actions">
                    <Button variant="primary" shape="pill" size="lg" endIcon={<ArrowRight size={16} />}>
                        Start for free
                    </Button>
                    <Button shape="pill" size="lg">
                        Book a demo
                    </Button>
                </div>
                <p className="hero-centred__note">Free for teams of up to five. No card needed.</p>
            </div>
            <div className="hero-centred__visual">
                <ProductShot />
            </div>
        </section>
    );
}
