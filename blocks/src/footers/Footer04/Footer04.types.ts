import type { HTMLAttributes, ReactNode } from "react";

import type { BlockAction, BlockLink, FooterColumn } from "@blocks/shared/shared.types";

export interface Footer04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A last line of pitch at the top left, in the heading style. */
    title: ReactNode;
    /** Words after the title, in a muted colour: "All in one place." */
    titleMuted?: ReactNode;
    /** A button under it. */
    primaryAction?: BlockAction;
    /** Columns of links on the right. */
    columns: FooterColumn[];
    /** The small print. */
    legal: ReactNode;
    /** Links beside it. */
    legalLinks?: BlockLink[];
    /** The product's name, set very large across the bottom and cropped at the edge. It's decoration; screen readers skip it. */
    wordmark: string;
}
