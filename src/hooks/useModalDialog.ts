import { useEffect, useRef, useState } from "react";

/** Matches the dialog exit transition in dialog.css. */
const closeAnimationMs = 160;

/**
 * Shows a <dialog> as a modal while `open` is true, and keeps it mounted long enough for its exit animation
 * once `open` turns false. Escape and a click on the backdrop fire the dialog's `cancel` event; the hook turns
 * that into `onCancel`, so a dialog that must stay open while it works can ignore it.
 */
export function useModalDialog(open: boolean, onCancel: () => void) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const onCancelRef = useRef(onCancel);
    const [mounted, setMounted] = useState(open);

    onCancelRef.current = onCancel;

    useEffect(() => {
        if (open) setMounted(true);
    }, [open]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            if (!dialog.open) dialog.showModal();
            return;
        }

        if (dialog.open) dialog.close();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const timer = window.setTimeout(() => setMounted(false), reduceMotion ? 0 : closeAnimationMs);
        return () => window.clearTimeout(timer);
    }, [open, mounted]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !mounted) return;

        const onCancelEvent = (event: Event) => {
            event.preventDefault();
            onCancelRef.current();
        };

        // A click on the backdrop (outside the dialog's box) counts as Escape. Both the press and the release
        // must be outside, so selecting text and dragging out doesn't close it.
        const isOutside = (event: MouseEvent) => {
            const rect = dialog.getBoundingClientRect();
            return (
                event.clientX < rect.left ||
                event.clientX > rect.right ||
                event.clientY < rect.top ||
                event.clientY > rect.bottom
            );
        };
        let pressedOutside = false;
        const onPointerDown = (event: PointerEvent) => {
            pressedOutside = event.target === dialog && isOutside(event);
        };
        const onClick = (event: MouseEvent) => {
            if (
                pressedOutside &&
                event.target === dialog &&
                isOutside(event) &&
                // Clicks from the keyboard (Enter on a button) report 0,0.
                event.detail > 0
            )
                dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
            pressedOutside = false;
        };

        dialog.addEventListener("cancel", onCancelEvent);
        dialog.addEventListener("pointerdown", onPointerDown);
        dialog.addEventListener("click", onClick);
        return () => {
            dialog.removeEventListener("cancel", onCancelEvent);
            dialog.removeEventListener("pointerdown", onPointerDown);
            dialog.removeEventListener("click", onClick);
        };
    }, [mounted]);

    return { dialogRef, mounted };
}
