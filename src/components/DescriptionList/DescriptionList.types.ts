import type { HTMLAttributes, ReactNode } from "react";

export type DescriptionListLayout = "horizontal" | "vertical" | "grid";

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
    /**
     * `horizontal` puts each term in a column on the left and its value on the right, and stacks them when the list is
     * narrower than 420px; `vertical` puts each term above its value, one pair under another; `grid` lays the pairs out
     * in `columns`, term above value, for a summary at a glance.
     * @default "horizontal"
     */
    layout?: DescriptionListLayout;
    /** How many columns a `grid` has, at most: a column is at least 160px wide, so a narrow list has fewer. @default 2 */
    columns?: 2 | 3 | 4;
    /** A hairline between rows. In a grid, every row has one above it. @default false */
    divided?: boolean;
    /** `compact` rows have 8px above and below; `comfortable` 12px.
     * @default "comfortable" */
    density?: "compact" | "comfortable";
    /** How wide the term column is in a `horizontal` list: a number of pixels, or any CSS width. @default 160 */
    termWidth?: number | string;
    /** DescriptionItems. */
    children?: ReactNode;
}

export interface DescriptionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** What the value is, in a word or two: "Email", "Plan". It renders a `<dt>`. */
    term: ReactNode;
    /** The value: text, or a Badge, User, Link or Code. It renders a `<dd>`. */
    children?: ReactNode;
    /** Something to do with the value, at the end of the row: an "Edit" ghost Button or a CopyButton. Name it, as it's read after the value. */
    action?: ReactNode;
    /** How many columns it takes in a `grid`; `full` takes the whole row. It takes the whole row where the grid has fewer columns. @default 1 */
    span?: 1 | 2 | 3 | 4 | "full";
}
