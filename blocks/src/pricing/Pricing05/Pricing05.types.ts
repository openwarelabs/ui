import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

/** A price band. Each unit is charged at the band it falls in, like income tax. */
export interface Pricing05Tier {
    /** Where the band starts: 0, 500, 10000. */
    from: number;
    /** Where it ends; Infinity for the last. */
    to: number;
    /** The price of one unit in it; 0 for free. */
    price: number;
}

export interface Pricing05Labels {
    /** One unit: "run". @default "unit" */
    unit?: string;
    /** More than one: "runs". @default "units" */
    units?: string;
    /** After the big number: "runs a month". @default `${units} a month` */
    perMonth?: string;
    /** A free band's price. @default "Free" */
    free?: string;
    /** The list of bands, for screen readers. @default `Price per ${unit}` */
    tiers?: string;
    /** The slider's name. @default `${units} a month`, capitalised */
    slider?: string;
}

export interface Pricing05Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The price bands, from 0 up, the last ending at Infinity. */
    tiers: Pricing05Tier[];
    /** A paragraph under the bands: what a unit is. */
    aside?: ReactNode;
    /** The estimate card's words. */
    estimate: {
        title: ReactNode;
        description?: ReactNode;
        /** Over the total: "Estimated month". */
        totalLabel: ReactNode;
        /** Small, under it: "Before VAT, billed on the 1st". */
        totalNote?: ReactNode;
    };
    /** The slider's end. */
    max: number;
    /** @default max / 200 */
    step?: number;
    /** Where the slider starts. */
    defaultValue: number;
    /** Values marked under the slider. @default 0, a quarter, half, three quarters and max */
    marks?: number[];
    /** The currency the prices are in. @default "EUR" */
    currency?: string;
    /** How numbers and money are written. @default the browser's language */
    locale?: string;
    /** The button under the total. */
    action: BlockAction;
    /** Small print under the button. */
    note?: ReactNode;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Pricing05Labels;
}
