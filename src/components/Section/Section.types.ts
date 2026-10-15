import type { ElementType, HTMLAttributes } from "react";

import type { ContainerSize } from "@/components/Container/Container.types";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
    /**
     * The band's ground: `paper` for marketing pages, as the blocks use; `canvas` for the app's grey; `surface` for a
     * white band that stands out from the paper; `none` to show what's behind it.
     * @default "paper"
     */
    tone?: "paper" | "canvas" | "surface" | "none";
    /** The space above and below: `md` is a block's (96px, 72px on phones), `sm` half that. @default "md" */
    spacing?: "sm" | "md" | "none";
    /** How wide the content inside can get, as for Container. `false` leaves the content full width, without one. @default "page" */
    size?: ContainerSize | false;
    /** The element to render. @default "section" */
    as?: ElementType;
}
