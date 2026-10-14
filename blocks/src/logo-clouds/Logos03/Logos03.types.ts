import type { HTMLAttributes, ReactNode } from "react";

export interface Logos03Logo {
    /** The company, for the list's key. Put it in the logo too: as the <img>'s alt, or as text beside an SVG. */
    name: string;
    /** The logo: an `<img src alt>` or an inline SVG, in one colour (currentColor), about 22px tall. */
    logo: ReactNode;
}

export interface Logos03Labels {
    /** The button that stops the logos moving. @default "Pause the logos" */
    pause?: string;
    /** The same button once they're stopped. @default "Play the logos" */
    play?: string;
    /** The moving strip, for screen readers. @default "Customer logos" */
    region?: string;
}

export interface Logos03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small, muted heading over the logos: "Teams that ship with Acme". */
    title: ReactNode;
    /** Customers' logos, in a slow, endless row that pauses on hover and focus, and stands still in rows with reduced motion. Eight look best. */
    logos: Logos03Logo[];
    /** Words that aren't content (names for screen readers, a button's name), in English unless you pass your own. */
    labels?: Logos03Labels;
}
