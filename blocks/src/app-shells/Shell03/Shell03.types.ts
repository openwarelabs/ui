import type { HTMLAttributes, ReactNode } from "react";

import type { AppAccount, AppMenuItem, AppWorkspace, BlockStatus } from "@blocks/shared/shared.types";

/** One thing in the list on the left. */
export interface Shell03Item {
    /** Unique in the list; what `selected` and `onSelect` use. */
    id: string;
    /** Its name. The list's filter matches it. */
    label: string;
    /** A small mark before the name: a coloured dot, a 15px icon. */
    icon?: ReactNode;
    /** A caption under the name: when it last changed. */
    caption?: ReactNode;
    /** Its state, as a badge at the item's end. */
    status?: BlockStatus;
}

export interface Shell03Labels {
    /** The workspace menu's name and heading. @default "Workspaces" */
    workspaces?: string;
    /** The last item in the workspace menu. @default "New workspace" */
    newWorkspace?: string;
    /** The filter field's placeholder and name. @default "Filter" */
    filter?: string;
    /** What the list says when the filter matches nothing. @default "Nothing matches “…”." */
    noMatch?(query: string): ReactNode;
    /** The account menu's name. @default "Account" */
    account?: string;
    /** The details button's name while the inspector shows. @default "Hide details" */
    hideDetails?: string;
    /** Its name while the inspector is hidden. @default "Show details" */
    showDetails?: string;
    /** The inspector's back button on tablets and phones. @default "Back to billing-api" */
    backTo?(label: string): string;
}

export interface Shell03Props extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
    /** The workspace's name, at the top of the list. */
    workspace: string;
    /** Its mark before the name, about 22px square. */
    logo?: ReactNode;
    /** The workspaces in its menu, the current one ticked. @default just this one */
    workspaces?: AppWorkspace[];
    /** Called by the workspace menu's last item, "New workspace". */
    onNewWorkspace?(): void;
    /** What the list holds, as its heading, its crumb and its back button's words: "Projects". */
    listTitle: string;
    /** The things in the list, which a field above it filters. */
    items: Shell03Item[];
    /** The open item's id, when you keep it yourself. */
    selected?: string;
    /** The item open to start with. @default the first */
    defaultSelected?: string;
    /** Called with an item's id when it's opened. */
    onSelect?(id: string): void;
    /** An icon button beside the list's heading, with a tooltip: "New project". */
    newItem?: { label: string; onClick?(): void };
    /** The person signed in, at the bottom of the list. */
    account: AppAccount;
    /** The account menu: profile, settings, sign out. */
    accountMenu?: AppMenuItem[];
    /** The open item's page, in the middle. Its h1 takes focus when a narrow screen swaps to it. */
    children?: ReactNode;
    /** The inspector's heading. @default "Details" */
    inspectorTitle?: ReactNode;
    /** What the inspector on the right shows about the open item. Under 1024px wide it takes the item's place. */
    inspector?: ReactNode;
    /** Whether the inspector shows to start with, on wide screens. @default true */
    defaultInspectorOpen?: boolean;
    /** Words that aren't content (names for screen readers, the filter), in English unless you pass your own. */
    labels?: Shell03Labels;
}
