import { useEffect, useRef, type RefObject } from "react";

/** Where focus goes when a trap activates. */
export type FocusTrapInitialFocus = RefObject<HTMLElement | null> | (() => HTMLElement | null) | "first" | "container";

/** Why a trap let go by itself. */
export type FocusTrapDeactivateReason = "escape" | "outside";

export interface UseFocusTrapOptions {
    /** Traps focus while true. @default true */
    active?: boolean;
    /**
     * Where focus goes when the trap activates: `"first"` for the first tabbable element, `"container"` for the
     * element itself (give it `tabIndex={-1}`), a ref, or a function that returns an element.
     * @default "first"
     */
    initialFocus?: FocusTrapInitialFocus;
    /** Puts focus back on the element that had it when the trap lets go. @default true */
    returnFocus?: boolean;
    /** Tab from the last element goes to the first, and Shift+Tab from the first to the last. Off, focus stays put. @default true */
    loop?: boolean;
    /** Escape lets go of the trap by itself, as well as calling `onEscape`. @default false */
    escapeDeactivates?: boolean;
    /** Called on Escape while the trap is active. Use it to close whatever the trap is in. */
    onEscape?(event: KeyboardEvent): void;
    /**
     * A press outside the container lets go of the trap and reaches what was pressed. Off, the press is swallowed
     * and focus stays inside. @default false
     */
    clickOutsideDeactivates?: boolean;
    /** Called when Escape or a press outside let go of the trap, so the state that set `active` can follow. */
    onDeactivate?(reason: FocusTrapDeactivateReason): void;
    /** Where focus goes when nothing in the container can take it: a ref or a function. Defaults to the container. */
    fallbackFocus?: RefObject<HTMLElement | null> | (() => HTMLElement | null);
}

interface TrapEntry {
    container: HTMLElement;
}

/** The active traps, innermost last. Only the innermost one acts, so a trap inside a trap works. */
const stack: TrapEntry[] = [];

const tabbableSelector = [
    "a[href]",
    "area[href]",
    "button",
    "input",
    "select",
    "textarea",
    "iframe",
    "summary",
    "audio[controls]",
    "video[controls]",
    '[contenteditable]:not([contenteditable="false"])',
    "[tabindex]",
].join(", ");

function isTabbable(element: HTMLElement): boolean {
    if (element.tabIndex < 0) return false;
    if (element.matches(":disabled, [disabled]")) return false;
    if (element instanceof HTMLInputElement && element.type === "hidden") return false;
    if (element.closest("[inert]")) return false;
    // Inside a closed <details>, only the summary can be reached.
    const details = element.closest("details:not([open])");
    if (details && !(element instanceof HTMLElement && element.tagName === "SUMMARY" && element.parentElement === details)) return false;
    return element.getClientRects().length > 0;
}

/** Every element Tab can reach inside `container`, in document order. */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(tabbableSelector)).filter(isTabbable);
}

function resolve(target: RefObject<HTMLElement | null> | (() => HTMLElement | null) | undefined): HTMLElement | null {
    if (!target) return null;
    return typeof target === "function" ? target() : target.current;
}

function focusQuietly(element: HTMLElement | null | undefined) {
    if (element && element.isConnected) element.focus();
}

/**
 * Keeps keyboard focus inside the element `ref` points at while `active`: Tab and Shift+Tab loop at the edges, focus
 * that leaves is pulled back, and when the trap lets go, focus returns to where it was. A `<dialog>` opened with
 * `showModal()` already does this, so this is for overlays that aren't one: a custom side panel, an inline edit mode.
 * Traps nest; only the innermost acts. Focus inside an open `<dialog>` is left alone.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, options: UseFocusTrapOptions = {}): void {
    const { active = true } = options;
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        const container = ref.current;
        if (!active || !container || typeof document === "undefined") return undefined;

        const entry: TrapEntry = { container };
        stack.push(entry);
        const isTop = () => stack[stack.length - 1] === entry;
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const fallback = () => resolve(optionsRef.current.fallbackFocus) ?? container;
        const focusInside = () => focusQuietly(getTabbableElements(container)[0] ?? fallback());
        const outside = (target: EventTarget | null) =>
            target instanceof Node &&
            !container.contains(target) &&
            // Something above the trap, such as a Dialog opened from inside it, keeps its focus.
            !(target instanceof Element && target.closest("dialog[open]"));

        let stopped = false;
        const stop = (reason?: FocusTrapDeactivateReason) => {
            if (stopped) return;
            stopped = true;
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("mousedown", onMouseDown, true);
            const at = stack.indexOf(entry);
            if (at !== -1) stack.splice(at, 1);
            const current = optionsRef.current;
            if (current.returnFocus ?? true) {
                const focused = document.activeElement;
                // Give focus back when it's still in the trap or lost, not when a press outside has moved it.
                if (!focused || focused === document.body || container.contains(focused)) focusQuietly(previous);
            }
            if (reason) current.onDeactivate?.(reason);
        };

        const onFocusIn = (event: FocusEvent) => {
            if (isTop() && outside(event.target)) focusInside();
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (!isTop() || event.defaultPrevented) return;
            const current = optionsRef.current;
            if (event.key === "Escape") {
                current.onEscape?.(event);
                if (current.escapeDeactivates) stop("escape");
                return;
            }
            if (event.key !== "Tab") return;
            const target = event.target;
            if (!(target instanceof HTMLElement) || !container.contains(target)) return;
            const tabbables = getTabbableElements(container);
            if (tabbables.length === 0) {
                event.preventDefault();
                focusQuietly(fallback());
                return;
            }
            const first = tabbables[0];
            const last = tabbables[tabbables.length - 1];
            const index = tabbables.indexOf(target);
            const loop = current.loop ?? true;
            if (index === -1) {
                // From the container itself, or something not in the tab order: start at an end.
                event.preventDefault();
                focusQuietly(event.shiftKey ? last : first);
            } else if (event.shiftKey && target === first) {
                event.preventDefault();
                if (loop) focusQuietly(last);
            } else if (!event.shiftKey && target === last) {
                event.preventDefault();
                if (loop) focusQuietly(first);
            }
        };

        const onMouseDown = (event: MouseEvent) => {
            if (!isTop() || !outside(event.target)) return;
            if (optionsRef.current.clickOutsideDeactivates) stop("outside");
            else event.preventDefault();
        };

        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("keydown", onKeyDown);
        // Capture, so the press is stopped before anything outside takes focus.
        document.addEventListener("mousedown", onMouseDown, true);

        const initial = optionsRef.current.initialFocus ?? "first";
        if (initial === "container") focusQuietly(container);
        else if (initial === "first") focusInside();
        else focusQuietly(resolve(initial) ?? getTabbableElements(container)[0] ?? fallback());

        return () => stop();
    }, [active, ref]);
}
