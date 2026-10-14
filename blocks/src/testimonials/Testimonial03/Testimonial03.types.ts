import type { HTMLAttributes, ReactNode } from "react";

export interface Testimonial03Fact {
    /** What it is: "Engineers". */
    label: ReactNode;
    /** Its value: "140", "310 → 1,120". */
    value: ReactNode;
}

export interface Testimonial03Story {
    /** The company, for the tab's key. Put it in the logo too, as the <img>'s alt or as text beside an SVG. */
    company: string;
    /** The company's logo in its tab, about 20px tall: muted until its tab is chosen. */
    logo: ReactNode;
    /** A larger logo at the top of the company's panel, about 28px tall. @default logo */
    largeLogo?: ReactNode;
    /** A line about the company, under the larger logo. */
    about?: ReactNode;
    /** A few facts about the company, at the foot of its panel. */
    facts?: Testimonial03Fact[];
    /** What they said. */
    quote: ReactNode;
    /** Who said it, beside their avatar (initials when there's no `avatar`). */
    name: string;
    /** Their role and company: "Lead developer, Halcyon". */
    jobTitle?: ReactNode;
    /** A photo of them, as an image URL. */
    avatar?: string;
}

export interface Testimonial03Labels {
    /** The row of logos, for screen readers. @default "Customers" */
    tabs?: string;
}

export interface Testimonial03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small line in a Chip above the title, such as the section's name. */
    eyebrow?: ReactNode;
    /** The section's heading, centred. */
    title: ReactNode;
    /** The stories, one to a tab: the companies' logos are the tabs. Four fit in a row on phones. */
    stories: Testimonial03Story[];
    /** The story open at first, by index. @default 0 */
    defaultStory?: number;
    /** A small centred line under the card, such as "Sample quotes". */
    note?: ReactNode;
    /** Words that aren't content (names for screen readers), in English unless you pass your own. */
    labels?: Testimonial03Labels;
}
