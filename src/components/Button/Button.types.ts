import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
/** `rounded` is the app's 8px corner; `pill` is the marketing site's. */
export type ButtonShape = "rounded" | "pill";

export interface ButtonStyleOptions {
    /** primary for the one main action, secondary for the rest, ghost for low-stakes actions, danger for destructive ones.
     * @default "secondary" */
    variant?: ButtonVariant;
    /** sm 32px, md 40px, lg 44px (36, 40 and 46px as pills).
     * @default "md" */
    size?: ButtonSize;
    /** @default "rounded" */
    shape?: ButtonShape;
    /** A square button holding only an icon. Give it an aria-label.
     * @default false */
    iconOnly?: boolean;
    /** Stretches the button to its container's width.
     * @default false */
    fullWidth?: boolean;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
    /** An icon before the label, usually a 16px lucide-react icon. */
    startIcon?: ReactNode;
    /** An icon after the label, such as an arrow or a chevron. */
    endIcon?: ReactNode;
    /** Keyboard shortcut shown at the end, e.g. "⌘N". Only pass one that actually works. */
    shortcut?: string;
    /** Shows a spinner in place of the start icon and disables the button, keeping its width.
     * @default false */
    loading?: boolean;
}
