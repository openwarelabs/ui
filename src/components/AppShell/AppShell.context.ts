import { createContext, useContext } from "react";

export interface AppShellState {
    /** The sidebar is folded down to its icons (wide screens only; the phone drawer is never folded). */
    collapsed: boolean;
    setCollapsed(collapsed: boolean): void;
    toggleCollapsed(): void;
    /** Whether the sidebar can fold at all: AppShell's `collapsible`. */
    collapsible: boolean;
    /** True inside the phone drawer, false in the sidebar beside the page. */
    inDrawer: boolean;
    /** Opens and closes the phone drawer. Choosing a NavItem closes it by itself. */
    openNavigation(): void;
    closeNavigation(): void;
    /** The sidebar's id, for aria-controls. */
    sidebarId: string;
}

export const AppShellContext = createContext<AppShellState | null>(null);

/**
 * The shell around the component: whether the sidebar is folded, and ways to fold it or open and close the phone
 * drawer. Null outside an AppShell.
 */
export function useAppShell(): AppShellState | null {
    return useContext(AppShellContext);
}
