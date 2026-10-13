import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** `active` is for work in progress, so it isn't confused with `warning` (something needs you). */
export type BadgeVariant = "neutral" | "active" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** A 12px icon before the text. */
    icon?: ReactNode;
    /** @default "md" */
    size?: "sm" | "md" | "lg";
    /** @default "neutral" */
    variant?: BadgeVariant;
}

/** A pill-shaped status label: one or two words, with an optional icon. */
export function Badge({ children, className, icon, size = "md", variant = "neutral", ...spanProps }: BadgeProps) {
    return (
        <span className={cx("ow-badge", `ow-badge--${size}`, `ow-badge--${variant}`, className)} {...spanProps}>
            {icon ? <span className="ow-badge__icon">{icon}</span> : null}
            <span>{children}</span>
        </span>
    );
}
