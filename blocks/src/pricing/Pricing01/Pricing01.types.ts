import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockLink } from "@blocks/shared/shared.types";

export interface Pricing01Plan {
    /** The plan's name. */
    name: ReactNode;
    /** A line on who it's for: "For teams shipping every day." */
    summary?: ReactNode;
    /** The amount, large: "€12". */
    price: ReactNode;
    /** What the amount buys, beside it: "a person a month". */
    unit?: ReactNode;
    /** Its button: primary for the recommended plan, secondary for the rest. */
    action: BlockAction;
    /** A heading over the list: "Everything in Free, plus:". */
    featuresTitle?: ReactNode;
    /** What's included, each with a tick. */
    features: ReactNode[];
    /** The plan most people pick: raised, with a brand edge and a primary button. */
    recommended?: boolean;
    /** A badge beside the name, usually on the recommended plan: "Most teams pick this". */
    badge?: ReactNode;
}

export interface Pricing01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title: "Pricing". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The plans, side by side; three look best. They stack on phones. */
    plans: Pricing01Plan[];
    /** A line under the plans for a bigger, priced-by-hand plan, with a link. */
    enterprise?: {
        /** In bold: "Enterprise". */
        title: ReactNode;
        description: ReactNode;
        link: BlockLink;
        /** An 18px icon before it, usually from lucide-react. */
        icon?: ReactNode;
    };
    /** Small print at the end: currency, tax, how to pay. */
    note?: ReactNode;
}
