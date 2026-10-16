import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import type { PortalProps } from "./Portal.types";
export type { PortalProps } from "./Portal.types";

const subscribe = () => () => {};
const mountedInBrowser = () => true;
const mountedOnServer = () => false;

/**
 * Renders its children somewhere else in the document, `document.body` by default, so they escape a parent's
 * `overflow: hidden`, `transform` or stacking context. On the server, and on the first render in the browser, it
 * renders nothing. The library's own Dialog, Drawer and Popover don't need it: they use the browser's top layer.
 */
export function Portal({ children, container, disabled = false }: PortalProps) {
    const mounted = useSyncExternalStore(subscribe, mountedInBrowser, mountedOnServer);
    if (disabled) return <>{children}</>;
    if (!mounted) return null;
    const target = container === undefined ? document.body : typeof container === "function" ? container() : container;
    if (!target) return null;
    return createPortal(children, target);
}
