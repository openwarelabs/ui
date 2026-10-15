import type { HTMLAttributes, ReactNode } from "react";

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
