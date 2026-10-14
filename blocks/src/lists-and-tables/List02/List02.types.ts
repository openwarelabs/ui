import type { HTMLAttributes, Key, ReactNode } from "react";

import type { TableSort } from "@openwarelabs/ui";

import type { BlockButton, BlockMenuItem, BlockTableColumn } from "@blocks/shared/shared.types";

/** Something the bar can do to every selected row: a button, or a button that opens a menu of choices. */
export interface List02BulkAction extends BlockButton {
    /** `danger` for actions that remove or can't be undone. @default "secondary" */
    variant?: "secondary" | "danger";
    /** Makes it a button that opens a menu of these choices, with a chevron after its label. */
    menu?: BlockMenuItem[];
    /** A small heading at the top of the menu: "Make them all". */
    menuHeading?: ReactNode;
}

export interface List02Labels {
    /** Describes the table for screen readers. @default the title, when it's text */
    caption?: string;
    /** Names the bar for screen readers. @default "Selected rows" */
    bar?: string;
    /** The count at the start of the bar. @default "2 selected" */
    selected?(count: number): ReactNode;
    /** The button that clears the selection, and its tooltip. @default "Clear selection" */
    clearSelection?: string;
}

export interface List02Props<Row extends object> extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
    /** The section's heading. */
    title: ReactNode;
    /** A line under it. */
    description?: ReactNode;
    /** The one primary action, beside the title: "Invite people". */
    primaryAction?: BlockButton;
    /** The table's columns, after the checkboxes. */
    columns: Array<BlockTableColumn<Row>>;
    /** The rows. */
    rows: Row[];
    /** A field name or function giving each row a unique key: what the selection holds. @default "id" */
    rowKey?: keyof Row | ((row: Row) => Key);
    /** Names a row for its checkbox, read out as "Select …". */
    rowLabel?(row: Row): string;
    /** The order to start with. */
    defaultSort?: TableSort;
    /** The selected rows' keys, when you keep them yourself. */
    selectedKeys?: Key[];
    /** The rows selected to start with. */
    defaultSelectedKeys?: Key[];
    /** Called with the selected rows' keys when the selection changes. */
    onSelectionChange?(keys: Key[]): void;
    /** What can be done to the selected rows, given them: the buttons in the bar that takes over the card's header. */
    bulkActions?(selected: Row[]): List02BulkAction[];
    /** The card's header while nothing is selected, on the left: how many rows there are. */
    summary?: ReactNode;
    /** A caption on the right of it, such as how selecting works. Hidden on phones. */
    hint?: ReactNode;
    /** Words that aren't content (names for screen readers, the count), in English unless you pass your own. */
    labels?: List02Labels;
}
