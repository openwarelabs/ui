import type { HTMLAttributes, ReactNode } from "react";

/** A person in the grid. */
export interface Team01Person {
    /** Their name, which also gives the avatar's initials. */
    name: string;
    /** What they do: "Head of engineering". */
    jobTitle: ReactNode;
    /** A photo URL; the initials show without one. */
    avatar?: string;
    /** The colour of their initials' circle: the brand colour, a soft wash of it, or ink. Mix them so a row of initials doesn't read as one shape repeated.
     * @default "brand" */
    tone?: "brand" | "soft" | "ink";
}

export interface Team01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title, such as "Team". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence under the title. */
    description?: ReactNode;
    /** The people, four to a row (two on phones). */
    people: Team01Person[];
    /** A line under a hairline at the end, which can hold a link: "We're hiring for four roles. See open roles". */
    note?: ReactNode;
}
