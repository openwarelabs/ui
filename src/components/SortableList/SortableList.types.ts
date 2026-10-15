import type { HTMLAttributes, Key, ReactNode } from "react";

export interface SortableListLabels {
    /** Read out when an item is picked up.
     * @default (item, position, total) => `Picked up ${item}. Position ${position} of ${total}.` */
    pickedUp?(item: string, position: number, total: number): string;
    /** Read out at each step while it's carried.
     * @default (item, position, total) => `${item}, position ${position} of ${total}.` */
    moved?(item: string, position: number, total: number): string;
    /** Read out when it's put down.
     * @default (item, position, total) => `Dropped ${item} at position ${position} of ${total}.` */
    dropped?(item: string, position: number, total: number): string;
    /** Read out when Escape puts it back.
     * @default (item, position, total) => `Cancelled. ${item} is back at position ${position} of ${total}.` */
    cancelled?(item: string, position: number, total: number): string;
    /** Each item's description, telling screen reader users how to move it.
     * @default "Press Space to pick up, the arrow keys to move, Space to drop, Escape to cancel." */
    instructions?: string;
    /** The grip's name, before the item's own text: "Reorder Columns".
     * @default "Reorder" */
    handle?: string;
}

export interface SortableListItemState {
    /** Where the item is in the list, from 0. */
    index: number;
    /** It's picked up: being dragged, or carried with the keyboard. */
    isDragging: boolean;
}

export interface SortableListProps<Item> extends Omit<HTMLAttributes<HTMLOListElement>, "children" | "onChange" | "defaultValue"> {
    /** The items in order, when you control them. */
    items?: Item[];
    /** The items at first, when it keeps the order itself.
     * @default [] */
    defaultItems?: Item[];
    /** Called with the items in their new order, and where the moved one was and went (indexes from 0). */
    onReorder?(items: Item[], move: { from: number; to: number }): void;
    /** What each item shows. */
    renderItem(item: Item, state: SortableListItemState): ReactNode;
    /** Gives each item a unique key.
     * @default (item) => item.id, or the item itself when it's a string or a number */
    getKey?(item: Item): Key;
    /** Names an item in what's read out as it moves ("Picked up Email"). Defaults to the item when it's a string
     * or a number, else the text it shows. */
    itemLabel?(item: Item): string;
    /** Names the list for screen readers: "Column order". Required unless `aria-labelledby` points at a heading. */
    label?: string;
    /**
     * Only a grip at the start of each row picks it up, rather than the whole row. Use it when rows hold their own
     * buttons, switches or links, or on long lists people scroll by touch.
     * @default false
     */
    handle?: boolean;
    /** `horizontal` lays the items in a row that scrolls sideways; the arrow keys follow the text direction.
     * @default "vertical" */
    orientation?: "vertical" | "horizontal";
    /** @default false */
    disabled?: boolean;
    /** The words it reads out, for other languages. */
    labels?: SortableListLabels;
}

/** Where the items were when the drag started, along the list's axis, in viewport pixels. Internal. */
export interface SortableGeometry {
    lo: number[];
    hi: number[];
    /** -1 when the list runs backwards on screen: a row in right-to-left text. */
    dir: number;
    /** How far the others move to make room: the picked-up item's size and the gap after it. */
    step: number;
    scroller: Element;
    scroll: number;
}

/** A drag in progress, by pointer or keyboard. Internal. */
export interface SortableDrag {
    from: number;
    to: number;
    /** How far a dragged item has followed the pointer. */
    offset: number;
    keyboard: boolean;
    geo: SortableGeometry;
}
