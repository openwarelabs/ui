import type { ReactNode } from "react";

import { Dashboard03, type BlockTableColumn } from "@openwarelabs/blocks";
import { ProgressBar, Text, toast } from "@openwarelabs/ui";
import { Download } from "lucide-react";

import "./DashboardUsage.css";

interface ProjectSpend {
    id: string;
    color: string;
    agents: number;
    builds: number;
}

const spend: ProjectSpend[] = [
    { id: "billing-api", color: "var(--ow-success-solid)", agents: 312.4, builds: 96.2 },
    { id: "marketing-site", color: "var(--ow-primary)", agents: 248.1, builds: 132.5 },
    { id: "mobile-app", color: "var(--ow-brass)", agents: 196.3, builds: 118.4 },
    { id: "docs", color: "var(--ow-danger-solid)", agents: 64.2, builds: 41.8 },
    { id: "design-system", color: "var(--ow-text-muted)", agents: 51.9, builds: 22.8 },
];

const euros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const wholeEuros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const total = spend.reduce((sum, project) => sum + project.agents + project.builds, 0);
// 13 of October's 31 days have gone; at the same pace, this is where the month ends.
const daysGone = 13;
const daysInMonth = 31;
const forecast = (total / daysGone) * daysInMonth;
const seats = 14;
const seatPrice = 24;

/** An amount in the forecast's sentence, set a step stronger than the words around it. */
function Strong({ children }: { children: ReactNode }) {
    return (
        <Text as="strong" variant="label" tone="default">
            {children}
        </Text>
    );
}

const columns: Array<BlockTableColumn<ProjectSpend>> = [
    {
        key: "id",
        header: "Project",
        sortable: true,
        render: (row) => (
            <Text as="span" className="dashboard-usage__project">
                <span className="dashboard-usage__dot" style={{ background: row.color }} aria-hidden="true" />
                {row.id}
            </Text>
        ),
    },
    {
        key: "agents",
        header: "Agent runs",
        align: "end",
        sortable: true,
        hideBelow: "phone",
        render: (row) => (
            <Text as="span" tone="muted">
                {euros.format(row.agents)}
            </Text>
        ),
    },
    {
        key: "builds",
        header: "Builds",
        align: "end",
        sortable: true,
        hideBelow: "phone",
        render: (row) => (
            <Text as="span" tone="muted">
                {euros.format(row.builds)}
            </Text>
        ),
    },
    {
        key: "total",
        header: "Total",
        align: "end",
        sortable: true,
        sortValue: (row) => row.agents + row.builds,
        render: (row) => euros.format(row.agents + row.builds),
    },
    {
        key: "share",
        header: "Share",
        width: "22%",
        render: (row) => {
            const share = ((row.agents + row.builds) / total) * 100;
            return (
                <span className="dashboard-usage__share">
                    <ProgressBar value={share} showValue={false} aria-label={`${row.id}: ${Math.round(share)}% of this month's spend`} />
                    <Text variant="caption">{Math.round(share)}%</Text>
                </span>
            );
        },
    },
];

export function DashboardUsage() {
    return (
        <Dashboard03
            title="Usage and billing"
            description="October 2026 on the Business plan. Usage resets on 1 November."
            spent={total}
            forecast={forecast}
            daysLeft={daysInMonth - daysGone}
            defaultBudget={3000}
            onBudgetChange={(budget, pauseAgents) =>
                toast.success(`Monthly budget set to ${wholeEuros.format(budget)}`, {
                    description: pauseAgents ? "Agent runs pause if spend reaches it." : "Agent runs carry on past it; we'll email the owners.",
                })
            }
            budgetOption={{ label: "Pause agent runs at the budget", description: "Builds and deploys keep running.", defaultChecked: true }}
            budgetNote="Owners get an email at 80% either way."
            table={{
                title: "By project",
                description: "So far this month",
                caption: "Spend by project this month",
                columns,
                rows: spend,
                defaultSort: { key: "total", direction: "descending" },
            }}
            invoice={{
                title: "Next invoice",
                due: "Due on 1 November 2026",
                lines: [
                    {
                        label: "Business plan",
                        hint: (
                            <>
                                {seats} people × {wholeEuros.format(seatPrice)}
                            </>
                        ),
                        amount: euros.format(seats * seatPrice),
                    },
                    {
                        label: "Agent runs",
                        hint: "Forecast to 31 October",
                        amount: euros.format((spend.reduce((sum, row) => sum + row.agents, 0) / daysGone) * daysInMonth),
                    },
                    {
                        label: "Builds",
                        hint: "Forecast to 31 October",
                        amount: euros.format((spend.reduce((sum, row) => sum + row.builds, 0) / daysGone) * daysInMonth),
                    },
                ],
                total: { label: "Estimated total", amount: euros.format(seats * seatPrice + forecast) },
                note: "Before VAT. The final amount follows your usage to the end of the month.",
                payment: {
                    label: "Visa ending 4242",
                    detail: "Expires 08/2028",
                    onChange: () => toast("Your card details open in a secure form from the payment provider."),
                },
                action: {
                    label: "Download past invoices",
                    icon: <Download size={16} />,
                    onClick: () => toast.success("Invoices for 2026 are downloading", { description: "Nine PDFs in one zip file." }),
                },
            }}
            labels={{
                budgetField: "Budget for agent runs and builds",
                meter: (percent) => `${percent}% of the monthly budget spent`,
                forecast: ({ over, difference, optionChecked }) =>
                    over ? (
                        <>
                            At this pace you'll spend about <Strong>{wholeEuros.format(forecast)}</Strong> by 31 October, {difference} over budget.
                            {optionChecked ? " Agent runs would pause on the last day or two." : ""}
                        </>
                    ) : (
                        <>
                            At this pace you'll spend about <Strong>{wholeEuros.format(forecast)}</Strong> by 31 October, {difference} under budget.
                        </>
                    ),
            }}
        />
    );
}
