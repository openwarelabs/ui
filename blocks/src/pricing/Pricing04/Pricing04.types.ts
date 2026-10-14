import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction } from "@blocks/shared/shared.types";

export interface Pricing04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** The left of the card: what you get. */
    product: {
        name: ReactNode;
        description?: ReactNode;
        /** A heading over the list: "What's included". */
        featuresTitle?: ReactNode;
        /** In two columns, each with a tick. */
        features: ReactNode[];
    };
    /** The right of the card: what it costs, and the button. */
    offer: {
        /** Above the price: "Pay monthly, per person". */
        label?: ReactNode;
        /** The amount, large: "€12". */
        price: ReactNode;
        /** Small, beside it: "EUR". */
        currency?: ReactNode;
        /** Under it: "a person a month, before VAT". */
        unit?: ReactNode;
        action: BlockAction;
        /** Small print under the button. */
        note?: ReactNode;
    };
    /** Short reassurances in a row under the card, each with an icon: "Cancel any time". */
    promises?: Array<{ text: ReactNode; icon?: ReactNode }>;
}
