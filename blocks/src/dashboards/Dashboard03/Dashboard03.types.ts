import type { HTMLAttributes, ReactNode } from "react";

import type { TableSort } from "@openwarelabs/ui";

import type { BlockButton, BlockTableColumn } from "@blocks/shared/shared.types";

/** A choice in the budget's editor, such as pausing work when spend reaches it. */
export interface Dashboard03BudgetOption {
    /** The checkbox's words. */
    label: ReactNode;
    /** A muted line under them. */
    description?: ReactNode;
    /** Whether it starts ticked. @default false */
    defaultChecked?: boolean;
}

/** The table of spend, in its own card under the budget. */
export interface Dashboard03Table<Row> {
    /** The card's heading: "By project". */
    title: ReactNode;
    /** A caption on the right of the heading: "So far this month". */
    description?: ReactNode;
    /** Describes the table for screen readers. */
    caption: string;
    /** Its columns. */
    columns: Array<BlockTableColumn<Row>>;
    /** Its rows. */
    rows: Row[];
    /** The order to start with. */
    defaultSort?: TableSort;
}

/** One line of the next invoice. */
export interface Dashboard03InvoiceLine {
    /** What it's for: "Business plan". */
    label: ReactNode;
    /** A caption under it: "14 people × €24". */
    hint?: ReactNode;
    /** The amount, formatted. */
    amount: ReactNode;
}

/** The next invoice, in a card on the right. */
export interface Dashboard03Invoice {
    /** The card's heading: "Next invoice". */
    title: ReactNode;
    /** A caption under it: when it's due. */
    due?: ReactNode;
    /** Its lines. */
    lines: Dashboard03InvoiceLine[];
    /** The total, under a hairline. */
    total?: { label: ReactNode; amount: ReactNode };
    /** A caption under the total: "Before VAT". */
    note?: ReactNode;
    /** The card it's paid with, and a button to change it. */
    payment?: { label: ReactNode; detail?: ReactNode; onChange?(): void };
    /** A button at the foot of the card: "Download past invoices". */
    action?: BlockButton;
}

/** What the forecast's sentence is made from. */
export interface Dashboard03Forecast {
    /** The month's forecast spend, formatted in whole units. */
    forecast: string;
    /** How far over or under the budget it is, formatted in whole units. */
    difference: string;
    /** Whether the forecast goes over the budget. */
    over: boolean;
    /** Whether the budget option is ticked. */
    optionChecked: boolean;
}

export interface Dashboard03Labels {
    /** The button that opens the budget's editor. @default "Edit budget" */
    editBudget?: string;
    /** The editor's title. @default "Monthly budget" */
    budgetTitle?: string;
    /** The budget field's label. @default "Budget" */
    budgetField?: string;
    /** The field's error when the budget is missing or under 1. @default "Enter a budget of at least €1." */
    budgetError?: string;
    /** @default "Cancel" */
    cancel?: string;
    /** @default "Save budget" */
    saveBudget?: string;
    /** After the amount spent. @default "of a €3,000 budget" */
    ofBudget?(budget: string): ReactNode;
    /** Under the meter, on the left. @default "98% used" */
    used?(percent: number): ReactNode;
    /** Under the meter, on the right. @default "18 days left" */
    daysLeft?(days: number): ReactNode;
    /** Names the meter for screen readers. @default "98% of the budget spent" */
    meter?(percent: number): string;
    /** The sentence under the meter: where spend is heading. @default "At this pace you'll spend about €3,124 by the end of the month, €124 over budget." */
    forecast?(forecast: Dashboard03Forecast): ReactNode;
    /** The button that changes the payment card. @default "Change" */
    changePayment?: string;
}

export interface Dashboard03Props<Row extends object> extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The page's name, as its h1. */
    title: ReactNode;
    /** A line under it: the month and the plan. */
    description?: ReactNode;
    /** The budget card's heading. @default "Spend this month" */
    spendTitle?: ReactNode;
    /** What's been spent so far this month. */
    spent: number;
    /** The month's forecast spend, at the pace so far. */
    forecast: number;
    /** Days left in the month. */
    daysLeft: number;
    /** The monthly budget, when you keep it yourself. */
    budget?: number;
    /** The budget to start with. @default 1000 */
    defaultBudget?: number;
    /** Called when the person saves a new budget, with whether the option is ticked. */
    onBudgetChange?(budget: number, optionChecked: boolean): void;
    /** A checkbox in the budget's editor. */
    budgetOption?: Dashboard03BudgetOption;
    /** A caption in the editor, under the checkbox. */
    budgetNote?: ReactNode;
    /** The currency amounts are in. @default "EUR" */
    currency?: string;
    /** The locale amounts are formatted for. @default "en-IE" */
    locale?: string;
    /** The spend broken down, in a table under the budget. */
    table?: Dashboard03Table<Row>;
    /** The next invoice, on the right. */
    invoice?: Dashboard03Invoice;
    /** Words that aren't content (button labels, the meter's captions, the forecast), in English unless you pass your own. */
    labels?: Dashboard03Labels;
}
