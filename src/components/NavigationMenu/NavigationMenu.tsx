import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MutableRefObject,
    type PointerEvent,
    type RefObject,
} from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { manualPopover, useDismiss, useFloating } from "@/hooks/useFloating";
import { usePresence } from "@/hooks/usePresence";
import { ChevronDownIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type {
    NavigationMenuContextValue,
    NavigationMenuGroupProps,
    NavigationMenuItemProps,
    NavigationMenuLinkProps,
    NavigationMenuProps,
} from "./NavigationMenu.types";

export type { NavigationMenuGroupProps, NavigationMenuItemProps, NavigationMenuLinkProps, NavigationMenuProps } from "./NavigationMenu.types";

const Context = createContext<NavigationMenuContextValue | null>(null);

const mouse = (event: PointerEvent) => event.pointerType === "mouse";
const isRtl = (element: Element) => getComputedStyle(element).direction === "rtl";
const focusables = (element: Element | null | undefined) =>
    Array.from(element?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), input:not(:disabled)") ?? []);

/**
 * A site's top navigation: buttons that open panels of links (with icons, descriptions and columns, up to full-width
 * mega-menus), and plain links. It's the disclosure pattern, not a menu: each trigger is a button with aria-expanded,
 * and its panel follows it in the Tab order.
 */
export function NavigationMenu({
    label,
    landmark = true,
    value,
    defaultValue = null,
    onValueChange,
    panelWidth = "auto",
    openDelay = 150,
    closeDelay = 300,
    children,
    className,
}: NavigationMenuProps) {
    const [current, setValue] = useControllableState(value, defaultValue, onValueChange);
    const rootRef = useRef<HTMLElement>(null);
    const triggers = useRef(new Map<string, HTMLElement>());
    const focusInto = useRef<string | null>(null);
    const timer = useRef(0);
    /** The open panel came from hovering, so leaving closes it; a click or a key keeps it until dismissed. */
    const byHover = useRef(false);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const context = useMemo<NavigationMenuContextValue>(() => {
        const cancel = () => window.clearTimeout(timer.current);
        const open = (next: string | null, hover = false) => {
            cancel();
            byHover.current = hover;
            setValue(next);
        };
        return {
            value: current,
            open,
            cancel,
            toggle: (next) => open(current === next && !byHover.current ? null : next),
            soon: (next) => {
                cancel();
                if (next === null && !byHover.current) return;
                timer.current = window.setTimeout(() => open(next, true), next === null ? closeDelay : openDelay);
            },
            rootRef,
            triggers,
            focusInto,
            panelWidth,
        };
    }, [current, setValue, openDelay, closeDelay, panelWidth]);

    const dismiss = useCallback(
        (reason: "outside" | "escape") => {
            const trigger = current === null ? undefined : triggers.current.get(current);
            context.open(null);
            if (reason === "escape" && rootRef.current?.contains(document.activeElement)) trigger?.focus();
        },
        [context, current],
    );
    useDismiss(current !== null, [rootRef], dismiss);

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const target = event.target as HTMLElement;
        const root = rootRef.current;
        if (!root) return;
        // Left and Right go along the top-level items, mirrored in right-to-left text.
        if (target.matches(".ow-navigation-menu__trigger") && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
            const items = Array.from(root.querySelectorAll<HTMLElement>(":scope > ul > li > .ow-navigation-menu__trigger"));
            const step = (event.key === "ArrowRight") !== isRtl(root) ? 1 : -1;
            event.preventDefault();
            items[(items.indexOf(target) + step + items.length) % items.length]?.focus();
            return;
        }
        // Up and Down go through the open panel's links; Up from the first goes back to its trigger.
        const panel = target.closest(".ow-navigation-menu__panel");
        if (!panel || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
        const links = focusables(panel);
        const index = links.indexOf(target);
        event.preventDefault();
        if (event.key === "ArrowUp" && index <= 0) {
            if (current !== null) triggers.current.get(current)?.focus();
        } else links[Math.min(links.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))]?.focus();
    };

    const Element = landmark ? "nav" : "div";
    return (
        <Context.Provider value={context}>
            <Element
                ref={rootRef as RefObject<HTMLDivElement>}
                aria-label={landmark ? label : undefined}
                className={cx("ow-navigation-menu", className)}
                onKeyDown={onKeyDown}
                onPointerEnter={(event) => {
                    if (mouse(event) && current !== null) context.cancel();
                }}
                onPointerLeave={(event) => {
                    if (mouse(event)) context.soon(null);
                }}
                onBlur={(event) => {
                    // Tabbing out of the menu, or on to another top-level item, closes the panel.
                    const next = event.relatedTarget as HTMLElement | null;
                    if (current === null || !next) return;
                    if (!rootRef.current?.contains(next) || (next.matches(".ow-navigation-menu__trigger") && next !== triggers.current.get(current)))
                        context.open(null);
                }}
            >
                <ul className="ow-navigation-menu__list">{children}</ul>
            </Element>
        </Context.Provider>
    );
}

/** A top-level item: a button that opens a panel of links, or a plain link when given an `href`. */
export function NavigationMenuItem({ trigger, value, href, active = false, columns = 1, width, children, className }: NavigationMenuItemProps) {
    const context = useContext(Context);
    if (!context) throw new Error("NavigationMenuItem must be inside a NavigationMenu.");
    const { rootRef, triggers, focusInto } = context;
    const generated = useId();
    const id = value ?? generated;
    const isOpen = context.value === id;
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const { mounted, state } = usePresence(isOpen);
    const full = (width ?? context.panelWidth) === "full";
    // A full-width panel lines up with the header around the menu, such as SiteHeader's pill, or the menu itself.
    const boundsRef = useMemo(
        () => ({
            get current() {
                return (rootRef.current?.closest("header") as HTMLElement | null) ?? rootRef.current;
            },
        }),
        [rootRef],
    );
    // When another panel opens, this one goes at once instead of fading out under it.
    const shown = mounted && (isOpen || context.value === null);
    // In right-to-left text the panel lines up with the trigger's right edge.
    const [rtl, setRtl] = useState(false);
    useLayoutEffect(() => {
        if (shown && triggerRef.current) setRtl(isRtl(triggerRef.current));
    }, [shown]);
    const floating = useFloating({
        open: shown,
        anchorRef: full ? boundsRef : triggerRef,
        floatingRef: panelRef,
        placement: rtl ? "bottom-end" : "bottom-start",
        offset: 8,
        matchWidth: full,
        maxHeight: 640,
    });

    // Down on the trigger opened it: move into the panel once it's on screen.
    useLayoutEffect(() => {
        if (!shown || focusInto.current !== id) return;
        focusInto.current = null;
        focusables(panelRef.current)[0]?.focus();
    }, [shown, id, focusInto]);

    const hover = {
        onPointerEnter: (event: PointerEvent) => {
            if (!mouse(event)) return;
            if (href !== undefined) context.soon(null);
            // Moving between triggers while a panel is open switches at once.
            else if (context.value !== null) {
                if (!isOpen) context.open(id, true);
            } else context.soon(id);
        },
        onPointerLeave: (event: PointerEvent) => {
            if (mouse(event) && context.value === null) context.cancel();
        },
    };

    if (href !== undefined) {
        return (
            <li className={cx("ow-navigation-menu__item", className)}>
                <a href={href} aria-current={active ? "page" : undefined} className="ow-navigation-menu__trigger" onClick={() => context.open(null)} {...hover}>
                    {trigger}
                </a>
            </li>
        );
    }

    const panelId = `${generated}-panel`;
    const style = {
        ...floating,
        width: typeof width === "number" ? width : full ? 0 : width,
        "--ow-navigation-menu-columns": columns,
    } as CSSProperties;

    return (
        <li className={cx("ow-navigation-menu__item", className)}>
            <button
                ref={(node) => {
                    triggerRef.current = node;
                    if (node) triggers.current.set(id, node);
                    else triggers.current.delete(id);
                }}
                type="button"
                aria-expanded={isOpen}
                aria-controls={shown ? panelId : undefined}
                data-active={active || undefined}
                className="ow-navigation-menu__trigger"
                onClick={() => context.toggle(id)}
                onKeyDown={(event) => {
                    if (event.key !== "ArrowDown" || event.altKey) return;
                    event.preventDefault();
                    if (isOpen) focusables(panelRef.current)[0]?.focus();
                    else {
                        focusInto.current = id;
                        context.open(id);
                    }
                }}
                {...hover}
            >
                {trigger}
                <ChevronDownIcon size={14} className="ow-navigation-menu__chevron" />
            </button>
            {shown ? (
                <div
                    ref={panelRef}
                    {...manualPopover}
                    id={panelId}
                    tabIndex={-1}
                    data-state={state}
                    className={cx("ow-popover", "ow-floating", "ow-navigation-menu__panel", full && "ow-navigation-menu__panel--full")}
                    style={style}
                    onClick={(event) => {
                        // Following a link closes the menu, for apps that route without reloading.
                        if ((event.target as Element).closest("a[href]")) context.open(null);
                    }}
                >
                    {children}
                </div>
            ) : null}
        </li>
    );
}

/** A link in a panel, with an optional icon and a line of description. */
export function NavigationMenuLink({ title, description, icon, active = false, featured = false, className, ...props }: NavigationMenuLinkProps) {
    return (
        <a
            aria-current={active ? "page" : undefined}
            className={cx("ow-navigation-menu__link", featured && "ow-navigation-menu__link--featured", className)}
            {...props}
        >
            {icon ? <span className="ow-navigation-menu__icon">{icon}</span> : null}
            <span className="ow-navigation-menu__text">
                <span className="ow-navigation-menu__title">{title}</span>
                {description ? <span className="ow-navigation-menu__description">{description}</span> : null}
            </span>
        </a>
    );
}

/** A titled column of links in a panel. */
export function NavigationMenuGroup({ title, children, className }: NavigationMenuGroupProps) {
    const id = useId();
    return (
        <div role="group" aria-labelledby={id} className={cx("ow-navigation-menu__group", className)}>
            <div id={id} className="ow-navigation-menu__group-title">
                {title}
            </div>
            {children}
        </div>
    );
}
