import type { ReactElement, ReactNode } from "react";

import type { Placement } from "@/hooks/useFloating";

export interface HoverCardProps {
    /** What people point at or tab to: usually a Link to a profile or a page. It keeps working as it is; touch opens the link, not the card. */
    trigger: ReactElement;
    /** The card's content: a preview of what the trigger leads to. It may hold links and buttons. */
    children: ReactNode;
    /** Whether it's showing, when you keep that in your own state. */
    open?: boolean;
    /** Whether it's showing at first, when it keeps its own state.
     * @default false */
    defaultOpen?: boolean;
    /** Called when it opens or closes. */
    onOpenChange?(open: boolean): void;
    /** Where it opens relative to the trigger; it flips when there's no room.
     * @default "bottom" */
    placement?: Placement;
    /** Milliseconds the pointer rests on the trigger before it opens. Keyboard focus opens it at once.
     * @default 500 */
    openDelay?: number;
    /** Milliseconds it waits after the pointer leaves before it closes, so the pointer can cross into the card.
     * @default 250 */
    closeDelay?: number;
    /** Pixels, or any CSS width.
     * @default 320 */
    width?: number | string;
    className?: string;
}
