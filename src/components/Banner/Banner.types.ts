import type { HTMLAttributes, ReactNode } from "react";

import type { ContainerSize } from "@/components/Container/Container.types";

export type BannerTone = "brand" | "neutral" | "info" | "success" | "warning" | "danger";

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
    /**
     * The bar's colour: `brand` a solid bar in the brand colour for news, `neutral` a quiet grey one, `info`, `success`,
     * `warning` and `danger` the tinted grounds Alert uses, for notices about the app itself.
     * @default "brand"
     */
    tone?: BannerTone;
    /** Replaces the tone's icon; `false` hides it. */
    icon?: ReactNode | false;
    /** A link or a small button after the message, such as `<Link href="…">Read the post</Link>`. It moves below the message on narrow screens. */
    action?: ReactNode;
    /** Shows a ✕ that hides the bar. @default false */
    dismissible?: boolean;
    /** Called when the person dismisses the bar. */
    onDismiss?(): void;
    /**
     * Remembers the dismissal in this browser (localStorage, as `ow-banner:<key>`), so the bar stays hidden on the next
     * visit. Change the key for a new announcement.
     */
    dismissKey?: string;
    /** Keeps the bar at the top of the window as the page scrolls. @default false */
    sticky?: boolean;
    /** Where the message sits: in the middle of the bar, or at its start. @default "center" */
    align?: "center" | "start";
    /**
     * Lines the content up with a Container of this size, so it starts where the page below does. `true` is `page`.
     * @default false
     */
    contained?: boolean | ContainerSize;
    /**
     * Reads the message out when it appears: `polite` (role="status") waits for a pause, `assertive` (role="alert")
     * interrupts, for something urgent like going offline. Leave it out for an announcement that's there when the page
     * loads: it's then a region the person can find.
     */
    live?: "polite" | "assertive";
    /** The region's name for screen readers, when it isn't live. @default "Announcement" */
    label?: string;
    /** The ✕'s name for screen readers. @default "Dismiss" */
    dismissLabel?: string;
    children?: ReactNode;
}
