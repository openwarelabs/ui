import type { HTMLAttributes, ReactNode } from "react";

import type { SelectOption } from "@openwarelabs/ui";

/** A way notifications reach someone, as a column of switches. */
export interface Notifications03Channel {
    /** Tells them apart, in the settings: "email". */
    id: string;
    /** The column's heading: "Email". */
    label: string;
    /** A 15px icon beside it, usually from lucide-react. */
    icon?: ReactNode;
}

/** Something that can send a notification, as a row of switches. */
export interface Notifications03Event {
    /** Tells them apart, in the settings: "review-requested". */
    id: string;
    /** What happens: "Someone asks for your review". */
    label: ReactNode;
    /** A caption under it. */
    description?: ReactNode;
    /** The ids of channels it can't use at all: a dash instead of a switch. */
    unavailable?: string[];
}

/** Events under a small heading. */
export interface Notifications03Group {
    /** The heading: "Reviews". */
    label: ReactNode;
    events: Notifications03Event[];
}

/** Which channels each event reaches, by event id. An event that's missing reaches none. */
export type Notifications03Value = Record<string, string[]>;

/** One switch flipped, as given to `onChange`. */
export interface Notifications03Change {
    event: string;
    channel: string;
    on: boolean;
}

/** A setting under the grid, as a row with its control on the right. */
export type Notifications03Option =
    | {
          kind: "select";
          /** Tells them apart, in `onOptionChange`. */
          id: string;
          label: string;
          description?: ReactNode;
          options: SelectOption[];
          defaultValue: string;
      }
    | {
          kind: "switch";
          /** Tells them apart, in `onOptionChange`. */
          id: string;
          label: string;
          description?: ReactNode;
          defaultValue: boolean;
      };

/** The words that aren't content, in English unless you pass your own. */
export interface Notifications03Labels {
    /** The grid's corner, over the events. @default "Event" */
    event?: string;
    /** Beside an event that reaches no channel. @default "Muted" */
    muted?: string;
    /** Read out for a dash. @default (channel) => `Not sent by ${channel.toLowerCase()}` */
    unavailable?(channel: string): string;
    /** The heading over `options`. @default "Delivery" */
    options?: string;
    /** Shown for a moment after each change. @default "Saved" */
    saved?: string;
}

export interface Notifications03Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "defaultValue" | "onChange"> {
    /** The page's heading: "Notifications". */
    title: ReactNode;
    /** A sentence under it. */
    description?: ReactNode;
    /** The columns. */
    channels: Notifications03Channel[];
    /** The rows, in groups. */
    groups: Notifications03Group[];
    /** Which channels each event reaches, for controlled use. */
    value?: Notifications03Value;
    /** Where it starts, when it isn't controlled. */
    defaultValue?: Notifications03Value;
    /** Runs on every switch in the grid, with the new settings and what changed: save them. */
    onChange?(value: Notifications03Value, change: Notifications03Change): void;
    /** Settings under the grid, such as how often emails go and quiet hours. */
    options?: Notifications03Option[];
    /** Runs when one of `options` changes: save it. */
    onOptionChange?(id: string, value: string | boolean): void;
    labels?: Notifications03Labels;
}
