import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../../utils/cx";

/** `active` is for work in progress, so it isn't confused with `warning` (something needs you). */
export type BadgeVariant = "neutral" | "active" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    /** A 12px icon before the text. */
    icon?: ReactNode;
    /** `sm` (24px) everywhere by default, in tables and rows too; `md` (32px) and `lg` (56px) for a status that should stand out.
     * @default "sm" */
    size?: "sm" | "md" | "lg";
    /** @default "neutral" */
    variant?: BadgeVariant;
}

/** A pill-shaped status label: one or two words, with an optional icon. */
export function Badge({ children, className, icon, size = "sm", variant = "neutral", ...spanProps }: BadgeProps) {
    return (
        <span className={cx("ow-badge", `ow-badge--${size}`, `ow-badge--${variant}`, className)} {...spanProps}>
            {icon ? <span className="ow-badge__icon">{icon}</span> : null}
            <span>{children}</span>
        </span>
    );
}
