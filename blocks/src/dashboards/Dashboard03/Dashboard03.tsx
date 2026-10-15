import { useId, useState } from "react";

import { Button, Card, Checkbox, cx, Field, NumberField, Popover, ProgressBar, Table, Text } from "@openwarelabs/ui";

import { CircleCheckIcon, CreditCardIcon, PencilIcon, TriangleAlertIcon } from "@blocks/shared/icons";
import { hiddenColumns } from "@blocks/shared/tableColumns";
import type { Dashboard03Props } from "./Dashboard03.types";

/**
 * This month's spend against a budget the person can change, the same spend broken down in a table, and what the
 * next invoice will be. The meter turns amber at 80% and red at the budget.
 */
export function Dashboard03<Row extends object>({
    title,
    description,
    spendTitle = "Spend this month",
    spent,
    forecast,
    daysLeft,
    budget: budgetProp,
    defaultBudget = 1000,
    onBudgetChange,
    budgetOption,
    budgetNote,
    currency = "EUR",
    locale = "en-IE",
    table,
    invoice,
    labels = {},
    className,
    ...props
}: Dashboard03Props<Row>) {
    const id = useId();
    const [ownBudget, setOwnBudget] = useState(defaultBudget);
    const budget = budgetProp ?? ownBudget;
    const [draft, setDraft] = useState<number | null>(budget);
    const [optionChecked, setOptionChecked] = useState(budgetOption?.defaultChecked ?? false);
    const [editing, setEditing] = useState(false);

    const amount = new Intl.NumberFormat(locale, { style: "currency", currency });
    const whole = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
    const used = (spent / budget) * 100;
    const over = forecast - budget;
    const tone = used >= 100 ? "danger" : used >= 80 ? "warning" : "primary";
    const forecastInfo = { forecast: whole.format(forecast), difference: whole.format(Math.abs(over)), over: over > 0, optionChecked };

    const save = () => {
        if (!draft || draft < 1) return;
        setOwnBudget(draft);
        setEditing(false);
        onBudgetChange?.(draft, optionChecked);
    };

    return (
        <section className={cx("ow-dashboard03", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-dashboard03__inner">
                <div className="ow-dashboard03__header">
                    <Text as="h1" variant="heading" id={`${id}-title`}>
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-dashboard03__lead">
                            {description}
                        </Text>
                    ) : null}
                </div>

                <Card padding="none" className="ow-dashboard03__budget">
                    <div className="ow-dashboard03__card-header">
                        <Text as="h2" variant="card-title">
                            {spendTitle}
                        </Text>
                        <Popover
                            title={labels.budgetTitle ?? "Monthly budget"}
                            width={300}
                            open={editing}
                            onOpenChange={(open) => {
                                setEditing(open);
                                if (open) setDraft(budget);
                            }}
                            placement="bottom-end"
                            trigger={
                                <Button size="sm" startIcon={<PencilIcon size={14} />}>
                                    {labels.editBudget ?? "Edit budget"}
                                </Button>
                            }
                        >
                            <form
                                className="ow-dashboard03__popover-body"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    save();
                                }}
                            >
                                <Field
                                    label={labels.budgetField ?? "Budget"}
                                    error={draft && draft >= 1 ? undefined : (labels.budgetError ?? `Enter a budget of at least ${whole.format(1)}.`)}
                                >
                                    <NumberField
                                        value={draft}
                                        onChange={setDraft}
                                        min={0}
                                        step={100}
                                        formatOptions={{ style: "currency", currency, maximumFractionDigits: 0 }}
                                    />
                                </Field>
                                {budgetOption ? (
                                    <Checkbox
                                        checked={optionChecked}
                                        onChange={(event) => setOptionChecked(event.target.checked)}
                                        description={budgetOption.description}
                                    >
                                        {budgetOption.label}
                                    </Checkbox>
                                ) : null}
                                {budgetNote ? (
                                    <Text as="p" variant="caption">
                                        {budgetNote}
                                    </Text>
                                ) : null}
                                <div className="ow-dashboard03__popover-actions">
                                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                                        {labels.cancel ?? "Cancel"}
                                    </Button>
                                    <Button size="sm" variant="primary" type="submit">
                                        {labels.saveBudget ?? "Save budget"}
                                    </Button>
                                </div>
                            </form>
                        </Popover>
                    </div>

                    <div className="ow-dashboard03__figure">
                        <Text as="span" variant="heading" className="ow-dashboard03__spent">
                            {amount.format(spent)}
                        </Text>
                        <Text as="span" tone="muted">
                            {labels.ofBudget ? labels.ofBudget(whole.format(budget)) : <>of a {whole.format(budget)} budget</>}
                        </Text>
                    </div>

                    <div className="ow-dashboard03__meter">
                        <ProgressBar
                            size="md"
                            tone={tone}
                            value={Math.min(used, 100)}
                            showValue={false}
                            aria-label={labels.meter?.(Math.round(used)) ?? `${Math.round(used)}% of the budget spent`}
                        />
                        <div className="ow-dashboard03__scale">
                            <Text variant="caption">{labels.used ? labels.used(Math.round(used)) : <>{Math.round(used)}% used</>}</Text>
                            <Text variant="caption">{labels.daysLeft ? labels.daysLeft(daysLeft) : <>{daysLeft} days left</>}</Text>
                        </div>
                    </div>

                    <Text tone="soft" className="ow-dashboard03__forecast" data-tone={over > 0 ? "warning" : "success"}>
                        {over > 0 ? <TriangleAlertIcon size={16} /> : <CircleCheckIcon size={16} />}
                        <span>
                            {labels.forecast ? (
                                labels.forecast(forecastInfo)
                            ) : (
                                <>
                                    At this pace you'll spend about{" "}
                                    <Text as="strong" variant="label" tone="default">
                                        {forecastInfo.forecast}
                                    </Text>{" "}
                                    by the end of the month, {forecastInfo.difference} {over > 0 ? "over" : "under"} budget.
                                </>
                            )}
                        </span>
                    </Text>
                </Card>

                {table ? (
                    <Card padding="none" className="ow-dashboard03__projects" {...hiddenColumns(table.columns)}>
                        <div className="ow-dashboard03__card-header">
                            <Text as="h2" variant="card-title">
                                {table.title}
                            </Text>
                            {table.description ? <Text variant="caption">{table.description}</Text> : null}
                        </div>
                        <Table
                            variant="plain"
                            caption={table.caption}
                            hideCaption
                            density="compact"
                            columns={table.columns}
                            rows={table.rows}
                            defaultSort={table.defaultSort}
                        />
                    </Card>
                ) : null}

                {invoice ? (
                    <Card padding="none" className="ow-dashboard03__invoice">
                        <div>
                            <Text as="h2" variant="card-title">
                                {invoice.title}
                            </Text>
                            {invoice.due ? (
                                <Text as="p" variant="caption" className="ow-dashboard03__due">
                                    {invoice.due}
                                </Text>
                            ) : null}
                        </div>
                        <dl className="ow-dashboard03__lines">
                            {invoice.lines.map((line, index) => (
                                <div key={index} className="ow-dashboard03__line">
                                    <Text as="dt" tone="soft" className="ow-dashboard03__item">
                                        {line.label}
                                        {line.hint ? (
                                            <Text variant="caption" className="ow-dashboard03__hint">
                                                {line.hint}
                                            </Text>
                                        ) : null}
                                    </Text>
                                    <Text as="dd" className="ow-dashboard03__amount">
                                        {line.amount}
                                    </Text>
                                </div>
                            ))}
                            {invoice.total ? (
                                <div className="ow-dashboard03__line ow-dashboard03__total">
                                    <Text as="dt" variant="label" className="ow-dashboard03__item">
                                        {invoice.total.label}
                                    </Text>
                                    <Text as="dd" variant="dialog-title" className="ow-dashboard03__amount">
                                        {invoice.total.amount}
                                    </Text>
                                </div>
                            ) : null}
                        </dl>
                        {invoice.note ? (
                            <Text as="p" variant="caption" className="ow-dashboard03__note">
                                {invoice.note}
                            </Text>
                        ) : null}

                        {invoice.payment ? (
                            <div className="ow-dashboard03__payment">
                                <span className="ow-dashboard03__card-mark" aria-hidden="true">
                                    <CreditCardIcon size={15} />
                                </span>
                                <span className="ow-dashboard03__payment-text">
                                    <Text as="span">{invoice.payment.label}</Text>
                                    {invoice.payment.detail ? <Text variant="caption">{invoice.payment.detail}</Text> : null}
                                </span>
                                <Button size="sm" variant="ghost" onClick={invoice.payment.onChange}>
                                    {labels.changePayment ?? "Change"}
                                </Button>
                            </div>
                        ) : null}

                        {invoice.action ? (
                            <Button
                                startIcon={invoice.action.icon}
                                loading={invoice.action.loading}
                                disabled={invoice.action.disabled}
                                onClick={invoice.action.onClick}
                            >
                                {invoice.action.label}
                            </Button>
                        ) : null}
                    </Card>
                ) : null}
            </div>
        </section>
    );
}
