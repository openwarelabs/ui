import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Pricing03Plan {
    /** Ties the plan to its values in each row. */
    id: string;
    /** The plan's name. */
    name: string;
    /** The amount, in bold: "€12", or "Custom". */
    price: ReactNode;
    /** After it: "a person a month". */
    unit?: ReactNode;
    /** Its small button: primary for the recommended plan. */
    action: BlockAction;
    /** The plan most people pick: its button is primary. */
    recommended?: boolean;
    /** A badge beside the name: "Popular". */
    badge?: ReactNode;
}

/** true is a tick, false a dash, anything else is shown as it is (a limit, such as "1,000 a person"). */
export type Pricing03Value = boolean | ReactNode;

export interface Pricing03Row {
    /** The feature's name, down the side. */
    feature: ReactNode;
    /** A line under the feature, in small type. */
    note?: ReactNode;
    /** Each plan's value, by plan id. */
    values: Record<string, Pricing03Value>;
}

/** A table of rows under a heading: "Usage", "Security". */
export interface Pricing03Group {
    /** The group's heading, above its rows. */
    title: string;
    /** The features in the group. */
    rows: Pricing03Row[];
}

export interface Pricing03Labels {
    /** The phone plan picker's name. @default "Plan to compare" */
    picker?: string;
    /** Read out for a tick. @default "Included" */
    included?: string;
    /** Read out for a dash. @default "Not included" */
    notIncluded?: string;
    /** Each table's caption, for screen readers. @default (title) => `${title}, by plan` */
    caption?(title: string): string;
}

export interface Pricing03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The plans, as columns. On phones one shows at a time, picked above the table. */
    plans: Pricing03Plan[];
    /** The features, in groups, as rows. */
    groups: Pricing03Group[];
    /** A small line beside the plans' prices: "Prices a month, in euro, before VAT." */
    pricesNote?: ReactNode;
    /** The plan shown first on phones. @default the recommended plan, or the first */
    defaultPlan?: string;
    /** Small print at the end. */
    note?: ReactNode;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Pricing03Labels;
}
