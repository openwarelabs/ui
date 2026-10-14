import type { HTMLAttributes, ReactNode } from "react";

import type { AppAccount, AppCommand, AppMenuItem, AppNavGroup, AppNavItem, AppWorkspace } from "@blocks/shared/shared.types";

/** A place in the sidebar, which can mark something new on its icon while the sidebar is folded. */
export interface Shell04NavItem extends AppNavItem {
    /** Puts a small brass dot on the icon while the sidebar is folded, where the count can't show. */
    unread?: boolean;
}

/** A group of places in the sidebar. */
export interface Shell04NavGroup extends Omit<AppNavGroup, "items"> {
    /** Its places, in order. */
    items: Shell04NavItem[];
}

export interface Shell04Labels {
    /** The workspace menu's name and heading. @default "Workspaces" */
    workspaces?: string;
    /** The last item in the workspace menu. @default "New workspace" */
    newWorkspace?: string;
    /** The search button's words, and the phone bar's search button's name. @default "Search" */
    search?: string;
    /** The search box's placeholder. @default "Search…" */
    searchPlaceholder?: string;
    /** Names the sidebar for screen readers. @default "Main navigation" */
    navigation?: string;
    /** The account menu's name. @default "Account" */
    account?: string;
    /** The phone bar's menu button's name. @default "Open navigation" */
    openNavigation?: string;
    /** The phone drawer's title. @default "Menu" */
    menu?: string;
    /** The fold button's name while the sidebar is open. @default "Collapse sidebar" */
    collapse?: string;
    /** Its name while it's folded. @default "Expand sidebar" */
    expand?: string;
}

export interface Shell04Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The workspace's name, at the top of the sidebar. */
    workspace: string;
    /** Its mark before the name, about 22px square: it stays in view when the sidebar folds. */
    logo?: ReactNode;
    /** The workspaces in its menu, the current one ticked. @default just this one */
    workspaces?: AppWorkspace[];
    /** Called by the workspace menu's last item, "New workspace". */
    onNewWorkspace?(): void;
    /** The places down the sidebar, in groups. Folded, only their icons show, each named in a tooltip. */
    navigation: Shell04NavGroup[];
    /** The current place's id, when you keep it yourself. */
    current?: string;
    /** The place that's current to start with. */
    defaultCurrent?: string;
    /** Called with a place's id when it's chosen, from the sidebar, a menu or the search. */
    onNavigate?(id: string): void;
    /** Whether the sidebar starts folded to its icons. @default folded under 1024px wide, open above */
    defaultCollapsed?: boolean;
    /** Called when the sidebar folds or opens. */
    onCollapsedChange?(collapsed: boolean): void;
    /** The person signed in, at the bottom of the sidebar. */
    account: AppAccount;
    /** The account menu: profile, settings, sign out. */
    accountMenu?: AppMenuItem[];
    /** What the search finds (⌘K). Without any, there's no search. */
    commands?: AppCommand[];
    /** Where the page sits, in the toolbar beside the fold button: the last is the page itself. */
    breadcrumbs?: ReactNode[];
    /** The page, on a raised panel beside the sidebar. */
    children?: ReactNode;
    /** Words that aren't content (menus' names, buttons for screen readers), in English unless you pass your own. */
    labels?: Shell04Labels;
}
