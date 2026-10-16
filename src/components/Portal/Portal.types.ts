import type { ReactNode } from "react";

export interface PortalProps {
    /** What to render in the container. */
    children: ReactNode;
    /**
     * Where to render it: an element, or a function that returns one (read once mounted, so it may look up an
     * element that only exists in the browser). `null` renders nothing until a container is given.
     * @default document.body
     */
    container?: Element | null | (() => Element | null);
    /** Renders the children where they are instead, as if the Portal weren't there. @default false */
    disabled?: boolean;
}
