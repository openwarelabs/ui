import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

export type Placement = "bottom-start" | "bottom-end" | "bottom" | "top-start" | "top-end" | "top" | "left" | "right";

interface Options {
    open: boolean;
    anchorRef: RefObject<HTMLElement | null>;
    floatingRef: RefObject<HTMLElement | null>;
    placement?: Placement;
    /** Distance from the anchor in pixels. */
    offset?: number;
    /** Make the floating element at least as wide as the anchor. */
    matchWidth?: boolean;
    /** The tallest it gets before scrolling. */
    maxHeight?: number;
}

const margin = 8;

/**
 * Positions a floating element (a popover, a listbox) against its anchor with fixed coordinates, flips it above
 * or below (or, for "left" and "right", to the other side) when there's no room, keeps it on screen, and follows the anchor when the page scrolls or resizes.
 * It also puts the element in the browser's top layer (popover="manual"), so dialogs and overflow can't clip it.
 * Pass the element's `mounted` from usePresence as `open`, so it stays placed while it animates out.
 */
export function useFloating({
    open,
    anchorRef,
    floatingRef,
    placement = "bottom-start",
    offset = 4,
    matchWidth = false,
    maxHeight = 360,
}: Options): CSSProperties {
    const [style, setStyle] = useState<CSSProperties>({
        position: "fixed",
        inset: "auto",
        left: 0,
        right: "auto",
        top: 0,
        bottom: "auto",
        visibility: "hidden",
    });

    const place = useCallback(() => {
        const anchor = anchorRef.current;
        const floating = floatingRef.current;
        if (!anchor || !floating) return;
        const rect = anchor.getBoundingClientRect();
        const width = Math.max(floating.offsetWidth, matchWidth ? rect.width : 0);
        const height = floating.scrollHeight;

        // Beside the anchor, centred on it: for a tooltip on a folded sidebar's icons.
        if (placement === "left" || placement === "right") {
            const roomLeft = rect.left - offset - margin;
            const roomRight = window.innerWidth - rect.right - offset - margin;
            const onLeft = placement === "left" ? width <= roomLeft || roomLeft > roomRight : width > roomRight && roomLeft > roomRight;
            const top = Math.min(Math.max(margin, rect.top + rect.height / 2 - height / 2), window.innerHeight - height - margin);
            floating.dataset.side = onLeft ? "left" : "right";
            setStyle({
                position: "fixed",
                inset: "auto",
                margin: 0,
                left: onLeft ? "auto" : rect.right + offset,
                right: onLeft ? window.innerWidth - rect.left + offset : "auto",
                top,
                bottom: "auto",
                maxHeight: Math.max(120, Math.min(maxHeight, window.innerHeight - 2 * margin)),
                ["--ow-floating-origin" as string]: `${onLeft ? "right" : "left"} center`,
            });
            return;
        }
        const below = window.innerHeight - rect.bottom - offset - margin;
        const above = rect.top - offset - margin;
        const wantsTop = placement.startsWith("top");
        const fitsBelow = height <= below;
        const fitsAbove = height <= above;
        const top = wantsTop ? fitsAbove || above > below : !fitsBelow && above > below;

        const align = placement.endsWith("start") ? "start" : placement.endsWith("end") ? "end" : "center";
        let left = align === "start" ? rect.left : align === "end" ? rect.right - width : rect.left + rect.width / 2 - width / 2;
        left = Math.min(Math.max(margin, left), window.innerWidth - width - margin);

        // Which way it opened, for the enter and exit animations (base.css: .ow-floating).
        floating.dataset.side = top ? "top" : "bottom";
        // Every edge is set, every time: a value React clears falls back to the browser's
        // [popover] { inset: 0 }, which pins the layer to the top of the window.
        setStyle({
            position: "fixed",
            inset: "auto",
            margin: 0,
            left,
            right: "auto",
            top: top ? "auto" : rect.bottom + offset,
            bottom: top ? window.innerHeight - rect.top + offset : "auto",
            minWidth: matchWidth ? rect.width : undefined,
            maxHeight: Math.max(120, Math.min(maxHeight, top ? above : below)),
            ["--ow-floating-origin" as string]: `${top ? "bottom" : "top"} ${align === "start" ? "left" : align === "end" ? "right" : "center"}`,
        });
    }, [anchorRef, floatingRef, placement, offset, matchWidth, maxHeight]);

    // Top layer: above modal dialogs and outside any overflow: hidden.
    useLayoutEffect(() => {
        const floating = floatingRef.current;
        if (!open || !floating) return;
        try {
            if (!floating.matches(":popover-open")) floating.showPopover();
        } catch {
            // Without popover support it still shows as a fixed element.
        }
        place();
        return () => {
            try {
                if (floating.matches(":popover-open")) floating.hidePopover();
            } catch {
                // Already hidden.
            }
        };
    }, [open, floatingRef, place]);

    useEffect(() => {
        if (!open) return;
        const onScroll = (event: Event) => {
            if (floatingRef.current?.contains(event.target as Node)) return;
            place();
        };
        const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => place());
        if (floatingRef.current) observer?.observe(floatingRef.current);
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", place);
        return () => {
            observer?.disconnect();
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", place);
        };
    }, [open, place, floatingRef]);

    return style;
}

/** Calls `onDismiss` on a press outside every given element, or on Escape. */
export function useDismiss(open: boolean, refs: Array<RefObject<HTMLElement | null>>, onDismiss: (reason: "outside" | "escape") => void) {
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (refs.every((ref) => !ref.current?.contains(target))) onDismiss("outside");
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape" || event.defaultPrevented) return;
            // Close this layer, not the dialog around it.
            event.preventDefault();
            event.stopPropagation();
            onDismiss("escape");
        };
        document.addEventListener("pointerdown", onPointerDown, true);
        document.addEventListener("keydown", onKeyDown, true);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown, true);
            document.removeEventListener("keydown", onKeyDown, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable objects.
    }, [open, onDismiss]);
}

/** The attribute that makes an element a manual popover, typed loosely for React 18. */
export const manualPopover = { popover: "manual" } as Record<string, string>;
