import { useCallback, useId, useMemo, useState, type MouseEvent } from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { MenuIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { Button } from "../Button/Button";
import { Drawer } from "../Drawer/Drawer";
import { ScrollShadow } from "../Layout/Layout";
import { Tooltip } from "../Tooltip/Tooltip";
import { AppShellContext, useAppShell, type AppShellState } from "./AppShell.context";
import type { AppShellProps, SidebarSectionProps, SidebarToggleProps } from "./AppShell.types";

export { useAppShell } from "./AppShell.context";
export type { AppShellState } from "./AppShell.context";
export type { AppShellProps, SidebarSectionProps, SidebarToggleProps } from "./AppShell.types";

/**
 * An app's frame: a sidebar down the left and the page beside it. When the shell is narrower than its breakpoint
 * (900px by default) the sidebar folds into a drawer behind a bar at the top. With `collapsible`, people can fold the sidebar to its icons.
 */
export function AppShell({
    sidebar,
    children,
    variant = "inset",
    collapsible = false,
    collapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    breakpoint = "md",
    topbar,
    topbarActions,
    labels = {},
    className,
    ...props
}: AppShellProps) {
    const sidebarId = useId();
    const [ownCollapsed, setOwnCollapsed] = useControllableState(collapsed, defaultCollapsed, onCollapsedChange);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const folded = collapsible && ownCollapsed;

    const openNavigation = useCallback(() => setDrawerOpen(true), []);
    const closeNavigation = useCallback(() => setDrawerOpen(false), []);
    const shared = useMemo(
        () => ({
            collapsible,
            setCollapsed: setOwnCollapsed,
            toggleCollapsed: () => setOwnCollapsed((previous) => !previous),
            openNavigation,
            closeNavigation,
            sidebarId,
        }),
        [collapsible, setOwnCollapsed, openNavigation, closeNavigation, sidebarId],
    );
    const beside: AppShellState = useMemo(() => ({ ...shared, collapsed: folded, inDrawer: false }), [shared, folded]);
    const inDrawer: AppShellState = useMemo(() => ({ ...shared, collapsed: false, inDrawer: true }), [shared]);

    // Choosing a place in the drawer closes it, so the page shows.
    const closeOnChoice = (event: MouseEvent<HTMLDivElement>) => {
        if ((event.target as Element).closest(".ow-nav__item, [data-closes-navigation]")) setDrawerOpen(false);
    };

    return (
        <div
            className={cx("ow-app-shell", `ow-app-shell--${variant}`, `ow-app-shell--${breakpoint}`, folded && "ow-app-shell--collapsed", className)}
            {...props}
        >
            <div className="ow-app-shell__frame">
                <AppShellContext.Provider value={beside}>
                    <aside id={sidebarId} className="ow-app-shell__sidebar" aria-label={labels.navigation ?? "Main navigation"}>
                        <div className="ow-sidebar">{sidebar}</div>
                    </aside>
                </AppShellContext.Provider>

                <div className="ow-app-shell__body">
                    <header className="ow-app-shell__topbar">
                        <Button variant="ghost" iconOnly aria-label={labels.openNavigation ?? "Open navigation"} onClick={openNavigation}>
                            <MenuIcon size={18} />
                        </Button>
                        <div className="ow-app-shell__topbar-start">{topbar}</div>
                        {topbarActions ? <div className="ow-app-shell__topbar-end">{topbarActions}</div> : null}
                    </header>
                    <main className="ow-app-shell__main">{children}</main>
                </div>
            </div>

            <Drawer open={drawerOpen} onClose={closeNavigation} side="left" size={300} title={labels.menu ?? "Menu"} className="ow-app-shell__drawer">
                <AppShellContext.Provider value={inDrawer}>
                    <div className="ow-sidebar ow-sidebar--drawer" onClick={closeOnChoice}>
                        {sidebar}
                    </div>
                </AppShellContext.Provider>
            </Drawer>
        </div>
    );
}

/** The top of the sidebar: the logo, a workspace switcher, a search button. It stays put while the content scrolls. */
export function SidebarHeader({ className, ...props }: SidebarSectionProps) {
    return <div className={cx("ow-sidebar__header", className)} {...props} />;
}

/** The middle of the sidebar, usually NavLists. It scrolls when it's taller than the screen. */
export function SidebarContent({ className, children, ...props }: SidebarSectionProps) {
    return (
        <ScrollShadow className={cx("ow-sidebar__content", className)} {...props}>
            {children}
        </ScrollShadow>
    );
}

/** The bottom of the sidebar: the account, help, a SidebarToggle. */
export function SidebarFooter({ className, ...props }: SidebarSectionProps) {
    return <div className={cx("ow-sidebar__footer", className)} {...props} />;
}

/** Folds the sidebar to its icons and back. It shows only beside the page in a `collapsible` AppShell, not in the phone drawer. */
export function SidebarToggle({ labels = {}, className }: SidebarToggleProps) {
    const shell = useAppShell();
    if (!shell?.collapsible || shell.inDrawer) return null;
    const label = shell.collapsed ? (labels.expand ?? "Expand sidebar") : (labels.collapse ?? "Collapse sidebar");
    const Icon = shell.collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;
    return (
        <Tooltip label={label} placement="right">
            <Button
                variant="ghost"
                iconOnly
                size="sm"
                aria-label={label}
                aria-expanded={!shell.collapsed}
                aria-controls={shell.sidebarId}
                className={cx("ow-sidebar__toggle", className)}
                onClick={shell.toggleCollapsed}
            >
                <Icon size={16} />
            </Button>
        </Tooltip>
    );
}
