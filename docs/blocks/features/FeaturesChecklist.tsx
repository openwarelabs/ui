import { Badge, Button, Link, SectionHeading, SettingsRow, Switch } from "@openwarelabs/ui";
import { ArrowRight, Bot, Building2, Check, KeyRound, Settings, ShieldCheck, Users } from "lucide-react";

import "./FeaturesChecklist.css";

const included = [
    "Reviews before deploys",
    "A preview for every branch",
    "Agents in a sandbox",
    "One-click rollbacks",
    "A full audit log",
    "API keys per project",
    "Single sign-on on Business",
    "Data kept in the EU",
];

const settingsNav = [
    { label: "General", icon: Settings },
    { label: "Members", icon: Users },
    { label: "Guardrails", icon: ShieldCheck, active: true },
    { label: "Agents", icon: Bot },
    { label: "API keys", icon: KeyRound },
    { label: "Organisation", icon: Building2 },
];

const guardrails = [
    { label: "Require a review before deploying", description: "Applies to people and agents alike.", on: true },
    { label: "Build a preview for every branch", description: "Previews stay up until the branch merges.", on: true },
    { label: "Let agents open pull requests", description: "Agents can never merge their own changes.", on: true },
    { label: "Keep an audit log", description: "Every setting, deploy and run, kept for 12 months.", on: true },
    { label: "Single sign-on", description: "Sign in through Okta, Google or any SAML provider.", on: false, plan: "Business" },
];

const noop = () => {};

/** Workspace settings, drawn: the guardrails the checklist promises, switched on. */
function SettingsShot() {
    return (
        <div
            className="features-checklist__shot"
            role="img"
            aria-label="Acme's guardrail settings: required reviews, branch previews, agent pull requests and the audit log are on; single sign-on is available on Business."
        >
            <div className="features-checklist__chrome">
                <span />
                <span />
                <span />
            </div>
            <div className="features-checklist__app">
                <div className="features-checklist__nav">
                    <span className="features-checklist__nav-heading">Settings</span>
                    {settingsNav.map(({ label, icon: Icon, active }) => (
                        <span key={label} className="features-checklist__nav-item" data-active={active || undefined}>
                            <Icon size={15} />
                            {label}
                        </span>
                    ))}
                </div>
                <div className="features-checklist__page">
                    <span className="features-checklist__page-title">Guardrails</span>
                    <span className="features-checklist__page-text">Rules for every change in the Acme workspace, whoever or whatever makes it.</span>
                    <div className="features-checklist__card">
                        {guardrails.map((row) => (
                            <SettingsRow
                                key={row.label}
                                label={
                                    row.plan ? (
                                        <span className="features-checklist__label">
                                            {row.label}
                                            <Badge size="sm">{row.plan}</Badge>
                                        </span>
                                    ) : (
                                        row.label
                                    )
                                }
                                description={row.description}
                            >
                                <Switch checked={row.on} onChange={noop} label={row.label} tabIndex={-1} />
                            </SettingsRow>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FeaturesChecklist() {
    return (
        <section className="features-checklist" aria-labelledby="features-checklist-title">
            <div className="features-checklist__inner">
                <div className="features-checklist__copy">
                    <SectionHeading
                        eyebrow="Included"
                        title={<span id="features-checklist-title">Move fast, with the guardrails on</span>}
                        intro="Every workspace comes with the checks that keep a quick team safe. They apply to people and agents alike, and take a minute to set up."
                    />
                    <ul className="features-checklist__list">
                        {included.map((item) => (
                            <li key={item} className="features-checklist__item">
                                <span className="features-checklist__tick" aria-hidden="true">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <div className="features-checklist__actions">
                        <Button variant="primary" shape="pill" size="lg" endIcon={<ArrowRight size={16} />}>
                            Start for free
                        </Button>
                        <Link href="#" variant="standalone">
                            Compare plans
                        </Link>
                    </div>
                </div>
                <div className="features-checklist__visual">
                    <SettingsShot />
                </div>
            </div>
        </section>
    );
}
