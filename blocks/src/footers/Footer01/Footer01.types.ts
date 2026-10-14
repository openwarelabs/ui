import type { HTMLAttributes, ReactNode } from "react";

import type { BlockBrand, BlockLink, FooterColumn } from "@blocks/shared/shared.types";

export interface Footer01Labels {
    /** The logo link's name. @default `${brand.name} home`, when the name is text */
    home?: string;
    /** Beside the theme switch. @default "Theme" */
    theme?: string;
    /** @default "Light" */
    light?: string;
    /** @default "Dark" */
    dark?: string;
    /** @default "Match the system" */
    system?: string;
}

export interface Footer01Props extends Omit<HTMLAttributes<HTMLElement>, "children"> {
    /** The logo and name at the top left. */
    brand: BlockBrand;
    /** A line under it about the product. */
    description?: ReactNode;
    /** A link with a green dot under that: "All systems normal". */
    status?: BlockLink;
    /** Three or four columns of links beside the brand. A link's badge ("New") shows after it. */
    columns: FooterColumn[];
    /** The small print at the bottom left: "© 2026 Acme Ltd." */
    legal: ReactNode;
    /** Links after it: "Cookie settings". */
    legalLinks?: BlockLink[];
    /** A light, dark and system switch at the bottom right, which sets data-theme on <html>. */
    themeSwitch?: boolean;
    /** Words that aren't content (names for screen readers, a menu's name), in English unless you pass your own. */
    labels?: Footer01Labels;
}
