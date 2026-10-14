import type { HTMLAttributes, ReactNode } from "react";

import type { AppAccount, AppCommand, AppMenuItem, AppNavItem, AppWorkspace } from "@blocks/shared/shared.types";

export interface Shell02Labels {
    /** The workspace menu's name and heading. @default "Workspaces" */
    workspaces?: string;
    /** The last item in the workspace menu. @default "New workspace" */
    newWorkspace?: string;
    /** The search button's words, and the search icon's name. @default "Search" */
    search?: string;
    /** The search box's placeholder. @default "Search…" */
    searchPlaceholder?: string;
    /** Names the navigation for screen readers. @default "Main navigation" */
    navigation?: string;
    /** The account menu's name. @default "Account" */
    account?: string;
    /** The avatar button's name. @default "Account: Maya Chen" */
    accountButton?(name: string): string;
    /** The phone menu button's name. @default "Open navigation" */
    openNavigation?: string;
    /** The phone drawer's title. @default "Menu" */
    menu?: string;
}

export interface Shell02Props extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** The workspace's name, at the start of the bar. */
    workspace: string;
    /** Its mark before the name, about 22px square. */
    logo?: ReactNode;
    /** The workspaces in its menu, the current one ticked. @default just this one */
    workspaces?: AppWorkspace[];
    /** Called by the workspace menu's last item, "New workspace". */
    onNewWorkspace?(): void;
    /** The app's few sections, across the bar. Their icons show in the phone drawer only. */
    navigation: AppNavItem[];
    /** The current section's id, when you keep it yourself. */
    current?: string;
    /** The section that's current to start with. @default the first */
    defaultCurrent?: string;
    /** Called with a section's id when it's chosen, from the bar, the drawer, a menu or the search. */
    onNavigate?(id: string): void;
    /** The person signed in: an avatar at the end of the bar, and the foot of the phone drawer. */
    account: AppAccount;
    /** The account menu: profile, settings, sign out. */
    accountMenu?: AppMenuItem[];
    /** What the search finds (⌘K). Without any, there's no search. */
    commands?: AppCommand[];
    /** The page, in a centred column on a raised panel under the bar. */
    children?: ReactNode;
    /** Words that aren't content (menus' names, buttons for screen readers), in English unless you pass your own. */
    labels?: Shell02Labels;
}
