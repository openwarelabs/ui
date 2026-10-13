import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    type FocusEvent,
    type HTMLAttributes,
    type KeyboardEvent,
} from "react";

import { cx } from "../../utils/cx";

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
    /** Names the toolbar for screen readers, e.g. "Formatting". Every toolbar needs a name, from this or aria-labelledby. */
    "aria-label"?: string;
    /** The id of a visible heading that names the toolbar, in place of aria-label. */
    "aria-labelledby"?: string;
    /** Which way it runs. The arrow keys follow it: Left and Right across a horizontal toolbar, Up and Down a vertical one.
     * @default "horizontal" */
    orientation?: "horizontal" | "vertical";
    /** `raised` is a bar of its own: a surface with a hairline border and a soft shadow. `plain` has no ground, for a
     * toolbar in a card or panel header.
     * @default "raised" */
    variant?: "raised" | "plain";
    /** The bar's padding and gaps, and the size its ToggleButtonGroups and separators take. Give its Buttons the same size.
     * @default "md" */
    size?: "sm" | "md";
}

export interface ToolbarSeparatorProps {
    /** Extra classes for the line. */
    className?: string;
}

interface ToolbarContextValue {
    orientation: "horizontal" | "vertical";
    size: "sm" | "md";
}

/** Lets what's inside a Toolbar follow its orientation and size, and leave the arrow keys to it. */
export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

const candidates =
    'button, a[href], input:not([type="hidden"]), select, textarea, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"], [tabindex]';

/** Input types that edit text on one line: Left and Right move the caret, and only leave the field from its edge. */
const textTypes = ["text", "search", "url", "tel", "password", "email"];
/** Input types that don't use the arrow keys at all. */
const pressTypes = ["button", "checkbox", "submit", "reset", "image", "file", "color"];

/**
 * The controls the toolbar moves between, in DOM order: every enabled, visible, focusable element, except those in
 * a popover (a menu or listbox opened from the toolbar) or a nested toolbar, and those whose own tabindex of -1 says
 * they're not tab stops (the toolbar remembers the ones it set itself).
 */
function itemsOf(root: HTMLElement, managed: WeakSet<HTMLElement>): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(candidates)).filter((element) => {
        if (element.matches(":disabled") || element.closest("[inert]")) return false;
        const tabIndex = element.getAttribute("tabindex");
        if (tabIndex !== null && Number(tabIndex) < 0 && !managed.has(element)) return false;
        if (!ownedBy(root, element)) return false;
        return element.getClientRects().length > 0;
    });
}

/** Whether an element belongs to this toolbar rather than to a popover or another toolbar inside it. */
function ownedBy(root: HTMLElement, element: HTMLElement): boolean {
    for (let node = element.parentElement; node && node !== root; node = node.parentElement) {
        if (node.hasAttribute("popover") || node.getAttribute("role") === "toolbar") return false;
    }
    return root.contains(element);
}

/** Whether a control needs the key itself: fields keep their caret keys, an open select keeps every arrow. */
function keepsKey(element: HTMLElement, key: string, forward: boolean): boolean {
    if (element.isContentEditable || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) return true;
    if (element.getAttribute("aria-expanded") === "true" && element.hasAttribute("aria-haspopup")) return true;
    const role = element.getAttribute("role");
    if (role === "slider" || role === "spinbutton") return true;
    if (!(element instanceof HTMLInputElement) || pressTypes.includes(element.type)) return false;
    if (!textTypes.includes(element.type)) return true;
    if (key === "ArrowUp" || key === "ArrowDown") return false;
    if (key === "Home" || key === "End") return true;
    const { selectionStart, selectionEnd, value } = element;
    if (selectionStart === null || selectionEnd === null || selectionStart !== selectionEnd) return true;
    return forward ? selectionEnd < value.length : selectionStart > 0;
}

/**
 * A row of controls for one context: an editor's formatting bar, a table's actions. It's a single tab stop: the
 * arrow keys move between every control inside it, ToggleButtonGroups' buttons included, and Tab leaves it, coming
 * back to the control that was focused last.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
    { orientation = "horizontal", variant = "raised", size = "md", className, children, onKeyDown, onFocus, ...props },
    forwardedRef,
) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const activeRef = useRef<HTMLElement | null>(null);
    const activeIndex = useRef(0);
    const managed = useRef(new WeakSet<HTMLElement>());
    const context = useMemo(() => ({ orientation, size }), [orientation, size]);

    const setRef = useCallback(
        (element: HTMLDivElement | null) => {
            rootRef.current = element;
            if (typeof forwardedRef === "function") forwardedRef(element);
            else if (forwardedRef) forwardedRef.current = element;
        },
        [forwardedRef],
    );

    // Roving tabindex: the active control is the one tab stop; the rest are -1. When it goes (removed or disabled),
    // the control that took its place in the order becomes the tab stop.
    const sync = useCallback(() => {
        const root = rootRef.current;
        if (!root) return;
        const items = itemsOf(root, managed.current);
        let active = activeRef.current && items.includes(activeRef.current) ? activeRef.current : null;
        if (!active) {
            const focused = items.find((item) => item === document.activeElement);
            active = focused ?? items[Math.min(activeIndex.current, items.length - 1)] ?? null;
        }
        // With every control disabled there's nothing to move to; keep the memory for when they come back.
        if (active) {
            activeRef.current = active;
            activeIndex.current = items.indexOf(active);
        }
        for (const item of items) {
            const tabIndex = item === active ? "0" : "-1";
            if (item.getAttribute("tabindex") !== tabIndex) item.setAttribute("tabindex", tabIndex);
            managed.current.add(item);
        }
    }, []);

    useLayoutEffect(sync);

    // Controls inside can appear, go or be disabled without the toolbar rendering again. Writes only happen when
    // something differs, so the observer settles after its own changes.
    useEffect(() => {
        const root = rootRef.current;
        if (!root || typeof MutationObserver === "undefined") return undefined;
        const observer = new MutationObserver(sync);
        observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["disabled", "hidden", "inert", "tabindex"] });
        return () => observer.disconnect();
    }, [sync]);

    function handleFocus(event: FocusEvent<HTMLDivElement>) {
        onFocus?.(event);
        const root = rootRef.current;
        const target = event.target as HTMLElement;
        if (!root || target === root || !ownedBy(root, target)) return;
        // Whatever takes focus (a click, a menu handing focus back, a control that moves focus itself) becomes the tab stop.
        managed.current.add(target);
        activeRef.current = target;
        sync();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);
        const root = rootRef.current;
        if (!root || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const target = event.target as HTMLElement;
        const items = itemsOf(root, managed.current);
        const index = items.indexOf(target);
        if (index < 0) return;
        const rtl = getComputedStyle(root).direction === "rtl";
        const nextKey = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
        const previousKey = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
        let next: number;
        if (event.key === nextKey) next = (index + 1) % items.length;
        else if (event.key === previousKey) next = (index - 1 + items.length) % items.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = items.length - 1;
        else return;
        if (keepsKey(target, event.key, event.key === nextKey || event.key === "End")) return;
        event.preventDefault();
        items[next]?.focus();
    }

    return (
        <div
            ref={setRef}
            role="toolbar"
            aria-orientation={orientation}
            className={cx("ow-toolbar", `ow-toolbar--${variant}`, `ow-toolbar--${size}`, orientation === "vertical" && "ow-toolbar--vertical", className)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            {...props}
        >
            <ToolbarContext.Provider value={context}>{children}</ToolbarContext.Provider>
        </div>
    );
});

/** A line between groups of controls in a Toolbar, across the toolbar's direction. */
export function ToolbarSeparator({ className }: ToolbarSeparatorProps) {
    const toolbar = useContext(ToolbarContext);
    return (
        <div
            role="separator"
            aria-orientation={toolbar?.orientation === "vertical" ? "horizontal" : "vertical"}
            className={cx("ow-toolbar__separator", className)}
        />
    );
}
