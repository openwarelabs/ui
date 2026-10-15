import { cx } from "@/utils/cx";
import type { BadgeProps } from "./Badge.types";

export type { BadgeProps, BadgeVariant } from "./Badge.types";

/** A pill-shaped status label: one or two words, with an optional icon. */
export function Badge({ children, className, icon, size = "sm", variant = "neutral", ...spanProps }: BadgeProps) {
    return (
        <span className={cx("ow-badge", `ow-badge--${size}`, `ow-badge--${variant}`, className)} {...spanProps}>
            {icon ? <span className="ow-badge__icon">{icon}</span> : null}
            <span>{children}</span>
        </span>
    );
}
