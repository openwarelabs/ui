import { Pricing03, type Pricing03Group, type Pricing03Plan } from "@openwarelabs/blocks";

const plans: Pricing03Plan[] = [
    { id: "free", name: "Free", price: "€0", unit: "up to 5 people", action: { label: "Start for free", href: "#start" } },
    { id: "team", name: "Team", price: "€12", unit: "a person a month", action: { label: "Start a trial", href: "#trial" }, recommended: true, badge: "Popular" },
    { id: "business", name: "Business", price: "€24", unit: "a person a month", action: { label: "Start a trial", href: "#trial" } },
    { id: "enterprise", name: "Enterprise", price: "Custom", unit: "pricing", action: { label: "Talk to sales", href: "#sales" } },
];

const groups: Pricing03Group[] = [
    {
        title: "Usage",
        rows: [
            { feature: "People", values: { free: "Up to 5", team: "Unlimited", business: "Unlimited", enterprise: "Unlimited" } },
            { feature: "Projects", values: { free: "3", team: "Unlimited", business: "Unlimited", enterprise: "Unlimited" } },
            {
                feature: "Agent runs a month",
                note: "Pooled across the workspace",
                values: { free: "200", team: "1,000 a person", business: "3,000 a person", enterprise: "Custom" },
            },
            { feature: "Build minutes a month", values: { free: "1,000", team: "10,000", business: "40,000", enterprise: "Custom" } },
            { feature: "Builds at once", values: { free: "1", team: "3", business: "10", enterprise: "Custom" } },
            { feature: "Deploy history", values: { free: "7 days", team: "90 days", business: "1 year", enterprise: "Unlimited" } },
        ],
    },
    {
        title: "Agents",
        rows: [
            { feature: "Agents that open pull requests", values: { free: true, team: true, business: true, enterprise: true } },
            {
                feature: "Agent access by project",
                note: "Which repositories and secrets each agent can use",
                values: { free: false, team: true, business: true, enterprise: true },
            },
            { feature: "Your own model keys", values: { free: false, team: false, business: true, enterprise: true } },
            { feature: "Self-hosted runners", values: { free: false, team: false, business: false, enterprise: true } },
        ],
    },
    {
        title: "Review and deploy",
        rows: [
            { feature: "A preview deploy for every pull request", values: { free: true, team: true, business: true, enterprise: true } },
            { feature: "One-click rollback", values: { free: true, team: true, business: true, enterprise: true } },
            { feature: "Required reviews and branch rules", values: { free: false, team: true, business: true, enterprise: true } },
            { feature: "Deploy windows and freezes", values: { free: false, team: false, business: true, enterprise: true } },
        ],
    },
    {
        title: "Security",
        rows: [
            { feature: "Sign in with Google or GitHub", values: { free: true, team: true, business: true, enterprise: true } },
            { feature: "SAML single sign-on", values: { free: false, team: false, business: true, enterprise: true } },
            { feature: "SCIM provisioning", values: { free: false, team: false, business: false, enterprise: true } },
            { feature: "Roles", values: { free: "Owner, member", team: "Owner, member", business: "Custom", enterprise: "Custom" } },
            { feature: "Audit log", values: { free: false, team: false, business: "1 year", enterprise: "Unlimited" } },
            { feature: "Data kept in the EU", values: { free: false, team: false, business: false, enterprise: true } },
        ],
    },
    {
        title: "Support",
        rows: [
            { feature: "Community forum", values: { free: true, team: true, business: true, enterprise: true } },
            { feature: "Email replies within", values: { free: false, team: "1 working day", business: "4 hours", enterprise: "1 hour" } },
            { feature: "Uptime SLA", values: { free: false, team: false, business: "99.9%", enterprise: "99.99%" } },
            { feature: "A named success manager", values: { free: false, team: false, business: false, enterprise: true } },
        ],
    },
];

export function PricingComparison() {
    return (
        <Pricing03
            eyebrow="Compare plans"
            title="Everything in each plan, line by line"
            description="Limits reset on the first of each month. Go over and we'll ask before charging, never after."
            plans={plans}
            groups={groups}
            pricesNote="Prices a month, in euro, before VAT."
            note="Need a limit that isn't here? Enterprise plans set their own."
        />
    );
}
