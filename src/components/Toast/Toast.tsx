import { useEffect, useRef } from "react";
import { Toaster as SonnerToaster, toast, type ExternalToast, type ToasterProps as SonnerToasterProps } from "sonner";

import { manualPopover } from "../../hooks/useFloating";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Spinner } from "../Spinner/Spinner";

/**
 * Shows a toast; needs one <Toaster /> on the page. This is sonner's `toast`:
 * `toast("Copied")`, `toast.success("Saved", { description })`, `toast.error(…)`, `toast.warning(…)`, `toast.info(…)`,
 * `toast.loading("Deploying…")`, `toast.promise(save(), { loading, success, error })`, `toast.dismiss(id)`.
 * Pass `action: { label: "Undo", onClick }` for a button, and reuse an `id` to replace a toast.
 */
export { toast };

/** Everything a toast takes besides its message: description, action, cancel, id, duration, icon, onDismiss… */
export type ToastOptions = ExternalToast;

export interface ToasterProps {
    /** @default "bottom-center" */
    position?: SonnerToasterProps["position"];
    /** Shows every toast in full, instead of a stack that fans out on hover.
     * @default false */
    expand?: boolean;
    /** How many show at once; the rest wait their turn.
     * @default 3 */
    visibleToasts?: number;
    /** Milliseconds before a toast goes. A toast's own `duration` wins; Infinity keeps it until closed.
     * @default 6000 */
    duration?: number;
    /** A ✕ on each toast.
     * @default true */
    closeButton?: boolean;
    /** Distance from the edge of the window, in pixels.
     * @default 16 */
    offset?: number;
    /** Gap between toasts when the stack is open, in pixels.
     * @default 10 */
    gap?: number;
    /** For a second toaster that only shows toasts sent with the same `toasterId`. */
    id?: string;
    className?: string;
}

const icons = {
    success: <CircleCheckIcon size={16} />,
    error: <CircleAlertIcon size={16} />,
    warning: <TriangleAlertIcon size={16} />,
    info: <InfoIcon size={16} />,
    loading: <Spinner size="sm" label="" />,
    close: <XIcon size={12} />,
};

/**
 * Where toasts appear: sonner's toaster in Openware's look. New toasts stack on top of each other; hovering
 * fans the stack out, a swipe dismisses one, and they pause while hovered or focused. Render one near the
 * root of the app. It keeps itself above modal dialogs, so a toast fired from a dialog shows over it.
 */
export function Toaster({
    position = "bottom-center",
    expand = false,
    visibleToasts = 3,
    duration = 6000,
    closeButton = true,
    offset = 16,
    gap = 10,
    id,
    className,
}: ToasterProps) {
    const layerRef = useRef<HTMLDivElement>(null);

    // The toaster lives in the browser's top layer, and moves back to the top of it whenever a dialog opens,
    // so modal dialogs and their backdrop never cover it.
    useEffect(() => {
        const layer = layerRef.current;
        if (!layer || typeof layer.showPopover !== "function") return undefined;
        const raise = () => {
            try {
                if (layer.matches(":popover-open")) layer.hidePopover();
                layer.showPopover();
            } catch {
                // Not connected yet, or no popover support: it still shows as a fixed layer.
            }
        };
        raise();
        const observer = new MutationObserver((records) => {
            if (records.some((record) => record.target instanceof HTMLDialogElement && record.target.open)) raise();
        });
        observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={layerRef} {...manualPopover} className="ow-toaster-layer">
            <SonnerToaster
                id={id}
                position={position}
                expand={expand}
                visibleToasts={visibleToasts}
                duration={duration}
                closeButton={closeButton}
                offset={offset}
                mobileOffset={offset}
                gap={gap}
                icons={icons}
                className={cx("ow-toaster", className)}
                containerAriaLabel="Notifications"
                toastOptions={{ className: "ow-toast" }}
            />
        </div>
    );
}
