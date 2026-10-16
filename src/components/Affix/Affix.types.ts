import type { ElementType, HTMLAttributes, ReactNode, RefObject } from "react";

/** Which edge of the scroll area the element sticks to. */
export type AffixPosition = "top" | "bottom";

/** `sticky` keeps the element in flow and lets the browser pin it; `fixed` takes it out of flow when it reaches the edge. */
export type AffixMode = "sticky" | "fixed";

/** What a render-function child gets. */
export interface AffixState {
    /** True while the element is pinned to the edge. */
    affixed: boolean;
}

export interface AffixProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onChange"> {
    /** The content, or a function of `{ affixed }` to restyle it while it's pinned. */
    children?: ReactNode | ((state: AffixState) => ReactNode);
    /** The edge it sticks to.
     * @default "top" */
    position?: AffixPosition;
    /** Space between the edge and the element while pinned, in pixels.
     * @default 0 */
    offset?: number;
    /** A ref to the element that scrolls, when it isn't the window. */
    container?: RefObject<HTMLElement | null>;
    /** `sticky` uses `position: sticky`, which needs no ancestor between it and the scroll container to clip overflow.
     * `fixed` leaves a placeholder of its height and pins the element with `position: fixed`, for layouts where sticky
     * can't work.
     * @default "sticky" */
    mode?: AffixMode;
    /** Called when it pins or unpins. */
    onChange?: (affixed: boolean) => void;
    /** Its stacking order; it sits over the content that scrolls under it.
     * @default 1 */
    zIndex?: number;
    /** A soft shadow and a hairline on the inner edge while pinned, so it reads as floating over the content.
     * @default true */
    shadow?: boolean;
    /** In `fixed` mode, keeps a spacer of the element's height in flow while it's pinned so the layout doesn't jump.
     * @default true */
    placeholder?: boolean;
    /** Leaves the element in flow and never pins it.
     * @default false */
    disabled?: boolean;
    /** The element to render, such as `header` or `nav`.
     * @default "div" */
    as?: ElementType;
}
