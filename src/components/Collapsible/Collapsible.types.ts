import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export interface CollapsibleState {
    /** Whether the content is shown. */
    open: boolean;
    /** Opens it when closed, closes it when open. */
    toggle(): void;
}

export interface CollapsibleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    /** Whether the content is shown, when you control it. */
    open?: boolean;
    /** Whether it starts open, when it keeps the state itself.
     * @default false */
    defaultOpen?: boolean;
    /** Called when a trigger opens or closes it. */
    onOpenChange?(open: boolean): void;
    /** Disables every trigger; the content stays as it is.
     * @default false */
    disabled?: boolean;
    /** The triggers and content, or a function of `{ open, toggle }` that returns them. */
    children: ReactNode | ((state: CollapsibleState) => ReactNode);
}

export interface CollapsibleTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Puts the trigger's props (`aria-expanded`, `aria-controls`, the click) on the single child element instead of
     * rendering a button, so any Button or custom element can be the trigger.
     * @default false */
    asChild?: boolean;
}

export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {
    /** Keeps the content in the DOM while closed (hidden and inert), for fields that keep their values.
     * Otherwise it leaves once the closing animation ends.
     * @default false */
    forceMount?: boolean;
}
