import type { HTMLAttributes, ReactNode } from "react";

import type { BlockBrand, BlockLink } from "@blocks/shared/shared.types";

export interface Footer02Labels {
    /** The logo link's name. @default `${brand.name} home`, when the name is text */
    home?: string;
    /** The links' name for screen readers. @default "Footer" */
    nav?: string;
}

export interface Footer02Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** Only its logo shows, as a link home; the name is its accessible name. */
    brand: BlockBrand;
    /** One line of links, centred; it wraps on phones. */
    links: BlockLink[];
    /** The small print under them: "© 2026 Acme Ltd. All rights reserved." */
    legal: ReactNode;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Footer02Labels;
}
