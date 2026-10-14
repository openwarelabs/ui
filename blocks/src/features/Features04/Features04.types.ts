import type { HTMLAttributes, ReactNode } from "react";

export interface Features04Tab {
    /** The tab's name: "Plan". */
    label: ReactNode;
    /** A 16px icon before it. */
    icon?: ReactNode;
    /** A sentence above the picture when the tab is open. */
    caption?: ReactNode;
    /** The part of the product it shows: a screenshot, or something drawn. */
    visual: ReactNode;
}

export interface Features04Labels {
    /** The row of tabs, for screen readers. @default "Features" */
    tabs?: string;
}

export interface Features04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence or two under the title. */
    description?: ReactNode;
    /** A row of tabs; each shows its part of the product. */
    tabs: Features04Tab[];
    /** The tab open at first, by index. @default 0 */
    defaultTab?: number;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Features04Labels;
}
