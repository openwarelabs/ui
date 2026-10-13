import { useState, useSyncExternalStore } from "react";

import { Badge, Button, SectionHeading, SegmentedControl, Table, Text, VisuallyHidden, type TableColumn } from "@openwarelabs/ui";
import { Check, Minus } from "lucide-react";

import "./PricingComparison.css";

type PlanId = "free" | "team" | "business" | "enterprise";

const plans: Array<{ id: PlanId; name: string; price: string; unit: string; action: string; popular?: boolean }> = [
    { id: "free", name: "Free", price: "€0", unit: "up to 5 people", action: "Start for free" },
    { id: "team", name: "Team", price: "€12", unit: "a person a month", action: "Start a trial", popular: true },
    { id: "business", name: "Business", price: "€24", unit: "a person a month", action: "Start a trial" },
    { id: "enterprise", name: "Enterprise", price: "Custom", unit: "pricing", action: "Talk to sales" },
];

/** true is a tick, false a dash, and text is a limit. */
type Value = boolean | string;

interface Row {
    id: string;
    feature: string;
    note?: string;
    values: Record<PlanId, Value>;
}

const groups: Array<{ id: string; title: string; rows: Row[] }> = [
    {
        id: "usage",
        title: "Usage",
        rows: [
            { id: "people", feature: "People", values: { free: "Up to 5", team: "Unlimited", business: "Unlimited", enterprise: "Unlimited" } },
            { id: "projects", feature: "Projects", values: { free: "3", team: "Unlimited", business: "Unlimited", enterprise: "Unlimited" } },
            {
                id: "runs",
                feature: "Agent runs a month",
                note: "Pooled across the workspace",
                values: { free: "200", team: "1,000 a person", business: "3,000 a person", enterprise: "Custom" },
            },
            { id: "minutes", feature: "Build minutes a month", values: { free: "1,000", team: "10,000", business: "40,000", enterprise: "Custom" } },
            { id: "concurrent", feature: "Builds at once", values: { free: "1", team: "3", business: "10", enterprise: "Custom" } },
            { id: "history", feature: "Deploy history", values: { free: "7 days", team: "90 days", business: "1 year", enterprise: "Unlimited" } },
        ],
    },
    {
        id: "agents",
        title: "Agents",
        rows: [
            { id: "prs", feature: "Agents that open pull requests", values: { free: true, team: true, business: true, enterprise: true } },
            {
                id: "scopes",
                feature: "Agent access by project",
                note: "Which repositories and secrets each agent can use",
                values: { free: false, team: true, business: true, enterprise: true },
            },
            { id: "keys", feature: "Your own model keys", values: { free: false, team: false, business: true, enterprise: true } },
            { id: "runners", feature: "Self-hosted runners", values: { free: false, team: false, business: false, enterprise: true } },
        ],
    },
    {
        id: "ship",
        title: "Review and deploy",
        rows: [
            { id: "previews", feature: "A preview deploy for every pull request", values: { free: true, team: true, business: true, enterprise: true } },
            { id: "rollback", feature: "One-click rollback", values: { free: true, team: true, business: true, enterprise: true } },
            { id: "rules", feature: "Required reviews and branch rules", values: { free: false, team: true, business: true, enterprise: true } },
            { id: "windows", feature: "Deploy windows and freezes", values: { free: false, team: false, business: true, enterprise: true } },
        ],
    },
    {
        id: "security",
        title: "Security",
        rows: [
            { id: "oauth", feature: "Sign in with Google or GitHub", values: { free: true, team: true, business: true, enterprise: true } },
            { id: "sso", feature: "SAML single sign-on", values: { free: false, team: false, business: true, enterprise: true } },
            { id: "scim", feature: "SCIM provisioning", values: { free: false, team: false, business: false, enterprise: true } },
            { id: "roles", feature: "Roles", values: { free: "Owner, member", team: "Owner, member", business: "Custom", enterprise: "Custom" } },
            { id: "audit", feature: "Audit log", values: { free: false, team: false, business: "1 year", enterprise: "Unlimited" } },
            { id: "residency", feature: "Data kept in the EU", values: { free: false, team: false, business: false, enterprise: true } },
        ],
    },
    {
        id: "support",
        title: "Support",
        rows: [
            { id: "forum", feature: "Community forum", values: { free: true, team: true, business: true, enterprise: true } },
            { id: "email", feature: "Email replies within", values: { free: false, team: "1 working day", business: "4 hours", enterprise: "1 hour" } },
            { id: "sla", feature: "Uptime SLA", values: { free: false, team: false, business: "99.9%", enterprise: "99.99%" } },
            { id: "manager", feature: "A named success manager", values: { free: false, team: false, business: false, enterprise: true } },
        ],
    },
];

function Cell({ value }: { value: Value }) {
    if (value === true) {
        return (
            <span className="pricing-comparison__yes">
                <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                <VisuallyHidden>Included</VisuallyHidden>
            </span>
        );
    }
    if (value === false) {
        return (
            <span className="pricing-comparison__no">
                <Minus size={16} aria-hidden="true" />
                <VisuallyHidden>Not included</VisuallyHidden>
            </span>
        );
    }
    return value;
}

const phoneQuery = "(max-width: 760px)";

/** Whether the window is phone-sized, following it as it changes. */
function useIsPhone() {
    return useSyncExternalStore(
        (onChange) => {
            const list = window.matchMedia(phoneQuery);
            list.addEventListener("change", onChange);
            return () => list.removeEventListener("change", onChange);
        },
        () => window.matchMedia(phoneQuery).matches,
        () => false,
    );
}

export function PricingComparison() {
    const isPhone = useIsPhone();
    const [picked, setPicked] = useState<PlanId>("team");
    const shown = isPhone ? plans.filter((plan) => plan.id === picked) : plans;

    const columns = (title: string): Array<TableColumn<Row>> => [
        {
            key: "feature",
            header: title,
            render: (row) => (
                <Text as="span" variant="body" className="pricing-comparison__feature">
                    {row.feature}
                    {row.note ? (
                        <Text variant="caption" className="pricing-comparison__feature-note">
                            {row.note}
                        </Text>
                    ) : null}
                </Text>
            ),
        },
        ...shown.map((plan) => ({
            key: plan.id,
            header: plan.name,
            render: (row: Row) => <Cell value={row.values[plan.id]} />,
        })),
    ];

    return (
        <section className="pricing-comparison" aria-labelledby="pricing-comparison-title">
            <div className="pricing-comparison__inner">
                <SectionHeading
                    align="center"
                    eyebrow="Compare plans"
                    title={<span id="pricing-comparison-title">Everything in each plan, line by line</span>}
                    intro="Limits reset on the first of each month. Go over and we'll ask before charging, never after."
                />

                <div className="pricing-comparison__picker">
                    <SegmentedControl
                        aria-label="Plan to compare"
                        fullWidth
                        value={picked}
                        onChange={(value) => setPicked(value as PlanId)}
                        options={plans.map((plan) => ({ value: plan.id, label: plan.name }))}
                    />
                </div>

                <div className="pricing-comparison__plans">
                    <Text as="p" variant="caption" className="pricing-comparison__plans-label">
                        Prices a month, in euro, before VAT.
                    </Text>
                    {shown.map((plan) => (
                        <div key={plan.id} className="pricing-comparison__plan">
                            <Text as="p" variant="card-title" className="pricing-comparison__plan-name">
                                {plan.name}
                                {plan.popular ? (
                                    <Badge size="sm" variant="active">
                                        Popular
                                    </Badge>
                                ) : null}
                            </Text>
                            <Text as="p" variant="caption" className="pricing-comparison__plan-price">
                                <Text as="strong" variant="label" tone="default" className="pricing-comparison__plan-amount">
                                    {plan.price}
                                </Text>{" "}
                                {plan.unit}
                            </Text>
                            <Button size="sm" shape="pill" variant={plan.popular ? "primary" : "secondary"}>
                                {plan.action}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="pricing-comparison__groups">
                    {groups.map((group) => (
                        <Table
                            key={group.id}
                            className="pricing-comparison__group"
                            caption={`${group.title}, by plan`}
                            hideCaption
                            columns={columns(group.title)}
                            rows={group.rows}
                        />
                    ))}
                </div>

                <Text as="p" variant="caption" align="center" className="pricing-comparison__note">
                    Need a limit that isn't here? Enterprise plans set their own.
                </Text>
            </div>
        </section>
    );
}
