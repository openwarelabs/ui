import type { Key, ReactNode } from "react";

export interface KanbanColumn<Card> {
    /** Unique. */
    id: Key;
    /** The column's heading, also read out as cards move: "To do". */
    title: string;
    /** Its cards, top to bottom. */
    cards: Card[];
    /** A work-in-progress limit: the count shows "4 / 3" and turns to a warning once there are more cards than this.
     * Cards can still be moved in. */
    limit?: number;
}

export interface KanbanCardState {
    /** The column it's in. */
    columnId: Key;
    /** Where it is in its column, from 0. */
    index: number;
    /** It's picked up: being dragged, or carried with the keyboard. */
    isDragging: boolean;
}

export interface KanbanMove<Card> {
    card: Card;
    from: { columnId: Key; index: number };
    to: { columnId: Key; index: number };
}

export interface KanbanLabels {
    /** Read out when a card is picked up.
     * @default (card, column, position, total) => `Picked up ${card}. ${column}, position ${position} of ${total}.` */
    pickedUp?(card: string, column: string, position: number, total: number): string;
    /** Read out at each step while it's carried.
     * @default (card, column, position, total) => `${card}, ${column}, position ${position} of ${total}.` */
    moved?(card: string, column: string, position: number, total: number): string;
    /** Read out when it's put down.
     * @default (card, column, position, total) => `Dropped ${card} in ${column}, position ${position} of ${total}.` */
    dropped?(card: string, column: string, position: number, total: number): string;
    /** Read out when Escape puts it back.
     * @default (card, column, position, total) => `Cancelled. ${card} is back in ${column}, position ${position} of ${total}.` */
    cancelled?(card: string, column: string, position: number, total: number): string;
    /** Each card's description, telling screen reader users how to move it. */
    instructions?: string;
    /** A column's count, with its limit when it has one.
     * @default (count, limit) => limit === undefined ? `${count} cards` : `${count} of ${limit} cards` */
    count?(count: number, limit?: number): string;
    /** Shown in a column with no cards.
     * @default "No cards" */
    empty?: string;
}

export interface KanbanProps<Card> {
    /** The columns and their cards, when you control them. */
    columns?: Array<KanbanColumn<Card>>;
    /** The columns at first, when it keeps them itself.
     * @default [] */
    defaultColumns?: Array<KanbanColumn<Card>>;
    /** Called after a card is dropped somewhere new, with every column and what moved. */
    onChange?(columns: Array<KanbanColumn<Card>>, move: KanbanMove<Card>): void;
    /** What each card shows. */
    renderCard(card: Card, state: KanbanCardState): ReactNode;
    /** Gives each card a unique key.
     * @default (card) => card.id */
    getKey?(card: Card): Key;
    /** Names a card in what's read out as it moves ("Picked up Fix login"). Defaults to its first line of text. */
    cardLabel?(card: Card): string;
    /** Whether a card may go into a column; columns it can't go into are skipped while it moves. */
    canMove?(card: Card, from: Key, to: Key): boolean;
    /** Controls at the end of a column's heading, such as a menu. */
    columnActions?(column: KanbanColumn<Card>): ReactNode;
    /** Something under a column's cards, such as an "Add card" button. */
    columnFooter?(column: KanbanColumn<Card>): ReactNode;
    /** Names the board for screen readers: "Sprint 14". */
    label: string;
    /** The level of the columns' headings.
     * @default 3 */
    headingLevel?: 2 | 3 | 4;
    /** The board's height; each column's cards scroll within it. Without it, columns grow with their cards. */
    height?: number | string;
    /** @default false */
    disabled?: boolean;
    /** The words it uses, for other languages. */
    labels?: KanbanLabels;
    className?: string;
}

/** A card on the move: where it started and where it would go. Internal. */
export interface KanbanDrag {
    key: Key;
    /** Its name in what's read out, worked out when it's picked up. */
    name: string;
    from: { column: number; index: number };
    to: { column: number; index: number };
    keyboard: boolean;
}
