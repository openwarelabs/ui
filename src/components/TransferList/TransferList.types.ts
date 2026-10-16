import type { ReactNode } from "react";

export interface TransferListOption {
    /** What goes in the value when it's chosen. Unique among the options. */
    value: string;
    /** The text in the list, matched by the search and read out when it moves. */
    label: string;
    /** A muted line under the label; matched by the search when it's a string. */
    description?: ReactNode;
    /** Stays on its side: it can't be selected or moved. */
    disabled?: boolean;
    /** A heading to show it under. Options with the same group are listed together, groups in the order they first appear. */
    group?: string;
}

/** One side of the transfer list. Internal. */
export type TransferListSide = "source" | "target";

export interface TransferListProps {
    /** Everything that can be chosen. The available side lists them in this order. */
    options: TransferListOption[];
    /** The chosen values, in order, when you control them. */
    value?: string[];
    /** The chosen values at first, when it controls them itself.
     * @default [] */
    defaultValue?: string[];
    /** Called with the chosen values when they move or are reordered. Moved values join the end. */
    onChange?(value: string[]): void;
    /** The heading over the available list, which also names it.
     * @default "Available" */
    sourceLabel?: string;
    /** The heading over the chosen list, which also names it.
     * @default "Selected" */
    targetLabel?: string;
    /** A search box over each list that filters it by label and description.
     * @default false */
    searchable?: boolean;
    /** Adds buttons that move every item (that the search shows) from one side to the other.
     * @default false */
    showMoveAll?: boolean;
    /** Adds Move up and Move down buttons under the chosen list (and Alt+Up/Down in it), for an order that matters.
     * The chosen list is then shown without group headings, in the value's order.
     * @default false */
    orderable?: boolean;
    /** Submits each chosen value under this name, in a hidden input, so a Form or a plain form sends them as a list. */
    name?: string;
    /** Fades both lists and the buttons, and takes them out of the tab order.
     * @default false */
    disabled?: boolean;
    /** The lists' height, e.g. 320 or "40vh"; they scroll past it.
     * @default 280 */
    height?: number | string;
    id?: string;
    /** The words it uses, for other languages. `to` is the side's label. */
    labels?: {
        /** The count under each heading. @default (selected, total) => `${selected} of ${total} selected` */
        count?(selected: number, total: number): string;
        /** The button that moves the selected items. @default (count, to) => `Move 2 selected to ${to}`, or `Move selected to ${to}` with none */
        moveSelected?(count: number, to: string): string;
        /** The button that moves them all, with `showMoveAll`. @default (to) => `Move all to ${to}` */
        moveAll?(to: string): string;
        /** Read out after a move. @default (names, to) => `Moved Siobhan and Aoife to ${to}`, or `Moved 7 items to ${to}` past five */
        moved?(names: string[], to: string): string;
        /** With `orderable`. @default "Move up" */
        moveUp?: string;
        /** With `orderable`. @default "Move down" */
        moveDown?: string;
        /** Read out after reordering. @default (names, direction) => `Moved Siobhan up` */
        reordered?(names: string[], direction: "up" | "down"): string;
        /** Names a side's search box. @default (side) => `Search ${side}` */
        search?(side: string): string;
        /** Shown in an empty list. @default "No items" */
        empty?: ReactNode;
        /** Shown when the search matches nothing. @default "No matches" */
        noMatches?: ReactNode;
    };
    className?: string;
}
