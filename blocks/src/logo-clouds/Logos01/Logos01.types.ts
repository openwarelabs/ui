import type { HTMLAttributes, ReactNode } from "react";

export interface Logos01Logo {
    /** The company, for the list's key. Put it in the logo too: as the <img>'s alt, or as text beside an SVG. */
    name: string;
    /** The logo: an `<img src alt>` or an inline SVG, in one colour (currentColor), about 22px tall. */
    logo: ReactNode;
}

export interface Logos01Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** A small, muted heading over the logos: "Trusted by more than 4,000 software teams". */
    title: ReactNode;
    /** Customers' logos, in one row that wraps to a grid on smaller screens. Five or six look best. */
    logos: Logos01Logo[];
}
