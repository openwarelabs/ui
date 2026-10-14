import type { HTMLAttributes, ReactNode } from "react";

export interface Stats01Stat {
    /** The figure: "4,200", "1.9". */
    value: ReactNode;
    /** A unit after it at half its size, in the muted colour: "M", "min", "%". */
    unit?: ReactNode;
    /** What it counts, shown under the figure: "teams ship with Acme". */
    label: ReactNode;
}

export interface Stats01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading, centred over the numbers. */
    title: ReactNode;
    /** The numbers, in a row split by hairlines (two by two on smaller screens). Four look best. */
    stats: Stats01Stat[];
    /** A small line under the numbers, after a brass dot, such as where they come from. */
    note?: ReactNode;
}
