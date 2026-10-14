import type { HTMLAttributes, ReactNode } from "react";

/** A person's card. */
export interface Team02Person {
    /** Their name, which also gives the avatar's initials. */
    name: string;
    /** What they do: "Head of engineering". */
    jobTitle: ReactNode;
    /** A photo URL; the initials show without one. */
    avatar?: string;
    /** A line about what they do, in the card's middle. */
    bio?: ReactNode;
    /** Where they work from, with a pin, at the card's foot: "Dublin". */
    location?: ReactNode;
    /** Their email address, for a mail button at the foot. */
    email?: string;
    /** A link to their site or profile, for a link button beside it. */
    website?: string;
}

/** The words on the cards that aren't content, in English unless you pass your own. */
export interface Team02Labels {
    /** The mail button's accessible name, given the person's name. @default `Email ${name}` */
    email?(name: string): string;
    /** The link button's accessible name, given the person's name. @default `${name}'s website` */
    website?(name: string): string;
}

export interface Team02Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A short line in a Chip above the title, such as "Team". */
    eyebrow?: ReactNode;
    /** The section's heading. */
    title: ReactNode;
    /** A sentence under the title. */
    description?: ReactNode;
    /** The people, a card each, three to a row. */
    people: Team02Person[];
    /** Words that aren't content (field labels, names for screen readers, messages), in English unless you pass your own. */
    labels?: Team02Labels;
}
