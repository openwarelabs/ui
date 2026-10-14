import type { HTMLAttributes, ReactNode } from "react";

import type { AppAccount, AppCommand, AppMenuItem, AppNavGroup, AppWorkspace } from "@blocks/shared/shared.types";

export interface Shell01Labels {
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
}

export interface Shell01Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The workspace's name, at the top of the sidebar. */
    workspace: string;
    /** Its mark before the name, about 22px square. */
    logo?: ReactNode;
    /** The workspaces in its menu, the current one ticked. @default just this one */
    workspaces?: AppWorkspace[];
    /** Called by the workspace menu's last item, "New workspace". */
    onNewWorkspace?(): void;
    /** The places down the sidebar, in groups. On phones they move into a drawer behind a menu button. */
    navigation: AppNavGroup[];
    /** The current place's id, when you keep it yourself. */
    current?: string;
    /** The place that's current to start with. */
    defaultCurrent?: string;
    /** Called with a place's id when it's chosen, from the sidebar, a menu or the search. */
    onNavigate?(id: string): void;
    /** The person signed in, at the bottom of the sidebar. */
    account: AppAccount;
    /** The account menu: profile, settings, sign out. */
    accountMenu?: AppMenuItem[];
    /** What the search finds (⌘K). Without any, there's no search. */
    commands?: AppCommand[];
    /** The page, on a raised panel beside the sidebar. */
    children?: ReactNode;
    /** Words that aren't content (menus' names, buttons for screen readers), in English unless you pass your own. */
    labels?: Shell01Labels;
}
