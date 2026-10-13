import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { XIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Button, type ButtonProps } from "./Button";

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Joins the buttons into one control with shared borders. Off, they sit 8px apart.
     * @default true */
    attached?: boolean;
    /** @default "horizontal" */
    orientation?: "horizontal" | "vertical";
}

/** Buttons that belong together: a toolbar's actions, or a split choice like "Day · Week · Month". */
export function ButtonGroup({ attached = true, orientation = "horizontal", className, ...props }: ButtonGroupProps) {
    return (
        <div
            role="group"
            className={cx(
                "ow-button-group",
                attached && "ow-button-group--attached",
                orientation === "vertical" && "ow-button-group--vertical",
                className,
            )}
            {...props}
        />
    );
}

export interface CloseButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
    /** sm 24px for toasts and tags, md 32px for dialogs and panels.
     * @default "md" */
    size?: "sm" | "md";
    /** What it closes, for screen readers.
     * @default "Close" */
    label?: string;
}

/** The ✕ in a dialog, drawer or panel header. */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(function CloseButton(
    { size = "md", label = "Close", className, type = "button", ...buttonProps },
    ref,
) {
    return (
        <button
            ref={ref}
            type={type}
            aria-label={label}
            className={cx("ow-close-button", `ow-close-button--${size}`, className)}
            {...buttonProps}
        >
            <XIcon size={size === "sm" ? 14 : 17} />
        </button>
    );
});

export interface ToggleButtonProps extends Omit<ButtonProps, "variant"> {
    /** Whether it's on. Leave out to let the button keep its own state. */
    pressed?: boolean;
    /** The starting state when uncontrolled.
     * @default false */
    defaultPressed?: boolean;
    onPressedChange?(pressed: boolean): void;
    /** @default "secondary" */
    variant?: "secondary" | "ghost";
}

/** A button that stays pressed in while something is on: bold text, a filter, a view mode. */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(function ToggleButton(
    { pressed, defaultPressed = false, onPressedChange, onClick, className, variant = "secondary", ...buttonProps },
    ref,
) {
    const [isPressed, setPressed] = useControllableState(pressed, defaultPressed, onPressedChange);
    return (
        <Button
            ref={ref}
            variant={variant}
            aria-pressed={isPressed}
            className={cx(isPressed && "ow-button--pressed", className)}
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented) setPressed(!isPressed);
            }}
            {...buttonProps}
        />
    );
});
