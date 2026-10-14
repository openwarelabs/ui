import { Button, buttonClassName } from "@openwarelabs/ui";

import type { BlockActionButtonProps, BlockActionsProps } from "@blocks/shared/shared.types";

/** One action as a large pill: a link styled as a button when it has an href, a button otherwise. */
export function BlockActionButton({ action, variant }: BlockActionButtonProps) {
    const { label, href, onClick, startIcon, endIcon, target, "aria-label": ariaLabel } = action;
    if (href !== undefined) {
        return (
            <a
                className={buttonClassName({ variant, size: "lg", shape: "pill" })}
                href={href}
                target={target}
                rel={target === "_blank" ? "noopener noreferrer" : undefined}
                aria-label={ariaLabel}
                onClick={onClick}
            >
                {startIcon ? <span className="ow-button__icon">{startIcon}</span> : null}
                {label}
                {endIcon ? <span className="ow-button__icon">{endIcon}</span> : null}
            </a>
        );
    }
    return (
        <Button variant={variant} shape="pill" size="lg" startIcon={startIcon} endIcon={endIcon} aria-label={ariaLabel} onClick={onClick}>
            {label}
        </Button>
    );
}

/** The primary action and an optional secondary one, side by side. */
export function BlockActions({ primary, secondary, className }: BlockActionsProps) {
    return (
        <div className={className}>
            <BlockActionButton action={primary} variant="primary" />
            {secondary ? <BlockActionButton action={secondary} variant="secondary" /> : null}
        </div>
    );
}
