import { useState } from "react";

import { Button, Card, Checkbox, Field, NumberField, Popover, ProgressBar, Table, toast, type TableColumn } from "@openwarelabs/ui";
import { CircleCheck, CreditCard, Download, Pencil, TriangleAlert } from "lucide-react";

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

const columns: Array<TableColumn<ProjectSpend>> = [
    {
        key: "id",
        header: "Project",
        sortable: true,
        render: (row) => (
            <span className="dashboard-usage__project">
                <span className="dashboard-usage__dot" style={{ background: row.color }} aria-hidden="true" />
                {row.id}
            </span>
        ),
    },
    {
        key: "agents",
        header: "Agent runs",
        align: "end",
        sortable: true,
        render: (row) => <span className="dashboard-usage__muted">{euros.format(row.agents)}</span>,
    },
    {
        key: "builds",
        header: "Builds",
        align: "end",
        sortable: true,
        render: (row) => <span className="dashboard-usage__muted">{euros.format(row.builds)}</span>,
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
                    {Math.round(share)}%
                </span>
            );
        },
    },
];

export function DashboardUsage() {
    const [budget, setBudget] = useState(3000);
    const [draft, setDraft] = useState<number | null>(3000);
    const [pauseAgents, setPauseAgents] = useState(true);
    const [editing, setEditing] = useState(false);

    const used = (total / budget) * 100;
    const over = forecast - budget;
    const tone = used >= 100 ? "danger" : used >= 80 ? "warning" : "primary";

    const save = () => {
        if (!draft || draft < 1) return;
        setBudget(draft);
        setEditing(false);
        toast.success(`Monthly budget set to ${wholeEuros.format(draft)}`, {
            description: pauseAgents ? "Agent runs pause if spend reaches it." : "Agent runs carry on past it; we'll email the owners.",
        });
    };

    return (
        <section className="dashboard-usage" aria-labelledby="dashboard-usage-title">
            <div className="dashboard-usage__inner">
                <div className="dashboard-usage__header">
                    <h1 id="dashboard-usage-title" className="dashboard-usage__title">
                        Usage and billing
                    </h1>
                    <p className="dashboard-usage__lead">October 2026 on the Business plan. Usage resets on 1 November.</p>
                </div>

                <Card padding="none" className="dashboard-usage__budget">
                    <div className="dashboard-usage__card-header">
                        <h2 className="dashboard-usage__card-title">Spend this month</h2>
                        <Popover
                            title="Monthly budget"
                            width={300}
                            open={editing}
                            onOpenChange={(open) => {
                                setEditing(open);
                                if (open) setDraft(budget);
                            }}
                            placement="bottom-end"
                            trigger={
                                <Button size="sm" startIcon={<Pencil size={14} />}>
                                    Edit budget
                                </Button>
                            }
                        >
                            <form
                                className="dashboard-usage__popover-body"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    save();
                                }}
                            >
                                <Field label="Budget for agent runs and builds" error={draft && draft >= 1 ? undefined : "Enter a budget of at least €1."}>
                                    <NumberField
                                        value={draft}
                                        onChange={setDraft}
                                        min={0}
                                        step={100}
                                        formatOptions={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
                                    />
                                </Field>
                                <Checkbox
                                    checked={pauseAgents}
                                    onChange={(event) => setPauseAgents(event.target.checked)}
                                    description="Builds and deploys keep running."
                                >
                                    Pause agent runs at the budget
                                </Checkbox>
                                <p className="dashboard-usage__popover-note">Owners get an email at 80% either way.</p>
                                <div className="dashboard-usage__popover-actions">
                                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" variant="primary" type="submit">
                                        Save budget
                                    </Button>
                                </div>
                            </form>
                        </Popover>
                    </div>

                    <div className="dashboard-usage__figure">
                        <span className="dashboard-usage__spent">{euros.format(total)}</span>
                        <span className="dashboard-usage__of">of a {wholeEuros.format(budget)} budget</span>
                    </div>

                    <div className="dashboard-usage__meter">
                        <ProgressBar
                            size="md"
                            tone={tone}
                            value={Math.min(used, 100)}
                            showValue={false}
                            aria-label={`${Math.round(used)}% of the monthly budget spent`}
                        />
                        <div className="dashboard-usage__scale">
                            <span>{Math.round(used)}% used</span>
                            <span>{daysInMonth - daysGone} days left</span>
                        </div>
                    </div>

                    {over > 0 ? (
                        <p className="dashboard-usage__forecast" data-tone="warning">
                            <TriangleAlert size={16} aria-hidden="true" />
                            <span>
                                At this pace you'll spend about <strong>{wholeEuros.format(forecast)}</strong> by 31 October, {wholeEuros.format(over)} over
                                budget.
                                {pauseAgents ? " Agent runs would pause on the last day or two." : ""}
                            </span>
                        </p>
                    ) : (
                        <p className="dashboard-usage__forecast" data-tone="success">
                            <CircleCheck size={16} aria-hidden="true" />
                            <span>
                                At this pace you'll spend about <strong>{wholeEuros.format(forecast)}</strong> by 31 October, {wholeEuros.format(-over)} under
                                budget.
                            </span>
                        </p>
                    )}
                </Card>

                <Card padding="none" className="dashboard-usage__projects">
                    <div className="dashboard-usage__card-header">
                        <h2 className="dashboard-usage__card-title">By project</h2>
                        <span className="dashboard-usage__legend">So far this month</span>
                    </div>
                    <Table
                        caption="Spend by project this month"
                        hideCaption
                        density="compact"
                        columns={columns}
                        rows={spend}
                        defaultSort={{ key: "total", direction: "descending" }}
                    />
                </Card>

                <Card padding="none" className="dashboard-usage__invoice">
                    <div>
                        <h2 className="dashboard-usage__card-title">Next invoice</h2>
                        <p className="dashboard-usage__due">Due on 1 November 2026</p>
                    </div>
                    <dl className="dashboard-usage__lines">
                        <div className="dashboard-usage__line">
                            <dt>
                                Business plan
                                <span>
                                    {seats} people × {wholeEuros.format(seatPrice)}
                                </span>
                            </dt>
                            <dd>{euros.format(seats * seatPrice)}</dd>
                        </div>
                        <div className="dashboard-usage__line">
                            <dt>
                                Agent runs
                                <span>Forecast to 31 October</span>
                            </dt>
                            <dd>{euros.format((spend.reduce((sum, row) => sum + row.agents, 0) / daysGone) * daysInMonth)}</dd>
                        </div>
                        <div className="dashboard-usage__line">
                            <dt>
                                Builds
                                <span>Forecast to 31 October</span>
                            </dt>
                            <dd>{euros.format((spend.reduce((sum, row) => sum + row.builds, 0) / daysGone) * daysInMonth)}</dd>
                        </div>
                        <div className="dashboard-usage__line dashboard-usage__total">
                            <dt>Estimated total</dt>
                            <dd>{euros.format(seats * seatPrice + forecast)}</dd>
                        </div>
                    </dl>
                    <p className="dashboard-usage__note">Before VAT. The final amount follows your usage to the end of the month.</p>

                    <div className="dashboard-usage__payment">
                        <span className="dashboard-usage__card-mark" aria-hidden="true">
                            <CreditCard size={15} />
                        </span>
                        <span className="dashboard-usage__payment-text">
                            <span>Visa ending 4242</span>
                            <span>Expires 08/2028</span>
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => toast("Your card details open in a secure form from the payment provider.")}>
                            Change
                        </Button>
                    </div>

                    <Button
                        startIcon={<Download size={16} />}
                        onClick={() => toast.success("Invoices for 2026 are downloading", { description: "Nine PDFs in one zip file." })}
                    >
                        Download past invoices
                    </Button>
                </Card>
            </div>
        </section>
    );
}
