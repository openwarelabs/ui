import type { HTMLAttributes, ReactNode } from "react";

import type { BlockButton, BlockMenuItem, BlockStatus } from "@blocks/shared/shared.types";

/** One row: a title, one line of detail and a status, with its actions in a menu at its end. */
export interface List03Item {
    /** Unique in the list. */
    id: string;
    /** Its name, on the first line. */
    title: string;
    /** A short code in mono after the name: a key's last characters, a version. */
    code?: ReactNode;
    /** One line of detail under it: who made it, when it was last used. On phones it may wrap. */
    detail?: ReactNode;
    /** Its state, as a badge. */
    status?: BlockStatus;
    /** Mutes the name and the icon, for something expired, revoked or archived. */
    inactive?: boolean;
    /** A 16px icon on a tile at the start of the row, usually from lucide-react. */
    icon?: ReactNode;
    /** What can be done to it, in a menu behind a button at the row's end. */
    menu?: BlockMenuItem[];
}

export interface List03Labels {
    /** Names a row's menu button. @default "Actions for Production deploys" */
    actions?(title: string): string;
    /** Names a row's menu. @default "Production deploys actions" */
    menu?(title: string): string;
}

export interface List03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading. */
    title: ReactNode;
    /** A line or two under it. */
    description?: ReactNode;
    /** The one primary action, beside the title: "Create key". */
    primaryAction?: BlockButton;
    /** The rows, in order. */
    items: List03Item[];
    /** A caption under the list: how things expire, where to find more. */
    footnote?: ReactNode;
    /** Words that aren't content (names for screen readers), in English unless you pass your own. */
    labels?: List03Labels;
}
