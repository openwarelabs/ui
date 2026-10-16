import { forwardRef } from "react";

import { Spinner } from "@/components/Spinner/Spinner";
import { cx } from "@/utils/cx";
import { toAriaShortcut } from "@/utils/text";
import type { ButtonProps, ButtonStyleOptions } from "./Button.types";

export type { ButtonProps, ButtonShape, ButtonSize, ButtonStyleOptions, ButtonVariant } from "./Button.types";

/**
 * The class names of a button, for things that must be another element: a router <Link>, an <a>.
 * `<Link className={buttonClassName({ variant: "primary" })}>Pricing</Link>`
 */
export function buttonClassName({
    variant = "secondary",
    size = "md",
    shape = "rounded",
    iconOnly = false,
    fullWidth = false,
}: ButtonStyleOptions = {}): string {
    return cx(
        "ow-button",
        `ow-button--${variant}`,
        `ow-button--${size}`,
        shape === "pill" && "ow-button--pill",
        iconOnly && "ow-button--icon-only",
        fullWidth && "ow-button--full",
    );
}

/**
 * A hairline button: a flat fill inside a 1px border. Pressing changes its colour, not its position; danger is
 * an outline that fills red when you aim at it.
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
                buttonClassName({ variant, size, shape, iconOnly, fullWidth }),
                loading && "ow-button--loading",
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
