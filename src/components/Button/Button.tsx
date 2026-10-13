import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import { toAriaShortcut } from "../../utils/text";
import { Spinner } from "../Spinner/Spinner";

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
    /** Stretches the button to its container's width.
     * @default false */
    fullWidth?: boolean;
}

/**
 * The class names of a button, for things that must be another element: a router <Link>, an <a>.
 * `<Link className={buttonClassName({ variant: "primary" })}>Pricing</Link>`
 */
export function buttonClassName({
    variant = "secondary",
    size = "md",
    shape = "rounded",
    iconOnly = false,
}: ButtonStyleOptions = {}): string {
    return cx(
        "ow-button",
        `ow-button--${variant}`,
        `ow-button--${size}`,
        shape === "pill" && "ow-button--pill",
        iconOnly && "ow-button--icon-only",
    );
}

/**
 * A tactile button: a light top-to-bottom gradient, a highlight along the top edge and a soft shadow,
 * pressed in by a pixel on click.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        children,
        className,
        disabled,
        endIcon,
        fullWidth = false,
        iconOnly = false,
        loading = false,
        shape = "rounded",
        shortcut,
        size = "md",
        startIcon,
        type = "button",
        variant = "secondary",
        ...buttonProps
    },
    ref,
) {
    const leading = loading ? <Spinner size="sm" tone="current" label="" /> : startIcon;
    return (
        <button
            ref={ref}
            className={cx(
                buttonClassName({ variant, size, shape, iconOnly }),
                shortcut && !iconOnly && "ow-button--with-shortcut",
                loading && "ow-button--loading",
                fullWidth && "ow-button--full",
                className,
            )}
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            aria-keyshortcuts={shortcut ? toAriaShortcut(shortcut) : undefined}
            {...buttonProps}
        >
            {leading ? <span className="ow-button__icon">{leading}</span> : null}
            {iconOnly && loading ? null : children}
            {endIcon && !iconOnly ? <span className="ow-button__icon">{endIcon}</span> : null}
            {shortcut && !iconOnly ? (
                <kbd aria-hidden="true" className="ow-button__shortcut">
                    {shortcut}
                </kbd>
            ) : null}
        </button>
    );
});
