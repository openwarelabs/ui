import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export type Pricing02Period = "monthly" | "yearly";

/** What a plan costs in one period. */
export interface Pricing02Price {
    /** The amount, large: "€10". It fades in when it changes. */
    amount: string;
    /** Beside it: "a person a month". */
    unit?: ReactNode;
    /** A line under it about billing: "€120 billed yearly · save €24". */
    billing?: ReactNode;
    /** The amount is words, such as "Custom", so it's set a little smaller. */
    custom?: boolean;
}

export interface Pricing02Plan {
    /** The plan's name. */
    name: string;
    /** A line on who it's for. */
    summary?: ReactNode;
    /** The price each period, or one price for both (a free plan, a custom one). */
    price: Pricing02Price | Record<Pricing02Period, Pricing02Price>;
    /** Its button: primary for the recommended plan. */
    action: BlockAction;
    /** What's included, each with a tick. */
    features: ReactNode[];
    /** The plan most people pick, picked out with a brand edge and a primary button. */
    recommended?: boolean;
    /** A badge beside the name: "Popular". */
    badge?: ReactNode;
}

export interface Pricing02Labels {
    /** The switch's name. @default "Billing period" */
    period?: string;
    /** @default "Monthly" */
    monthly?: string;
    /** @default "Yearly" */
    yearly?: string;
    /** Read out when the switch changes. @default "Showing monthly prices." */
    showingMonthly?: string;
    /** @default "Showing yearly prices." */
    showingYearly?: string;
    /** Each plan's list, for screen readers. @default (name) => `${name} includes` */
    includes?(name: string): string;
}

export interface Pricing02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The plans in one panel, side by side; four fit. */
    plans: Pricing02Plan[];
    /** A line under the switch, such as "Pay yearly and get two months free." */
    periodNote?: ReactNode;
    /** @default "monthly" */
    defaultPeriod?: Pricing02Period;
    /** Runs when the period changes. */
    onPeriodChange?(period: Pricing02Period): void;
    /** Small print at the end. */
    note?: ReactNode;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Pricing02Labels;
}
