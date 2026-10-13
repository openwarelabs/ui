import type { HTMLAttributes, ReactNode } from "react";

import { XIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
    /** Shows a ✕ that calls this. */
    onRemove?(): void;
    /** `neutral` for labels and filters; `active` for the ones currently applied.
     * @default "neutral" */
    variant?: "neutral" | "active";
    /** @default "md" */
    size?: "sm" | "md";
    /** A 14px icon or a ColorSwatch before the text. */
    icon?: ReactNode;
    /** What the ✕ removes, read out as "Remove …". Defaults to the text when it's a string. */
    removeLabel?: string;
    children: ReactNode;
}

/** A label on something (a topic, a filter, a recipient) that can be removed. */
export function Tag({ onRemove, variant = "neutral", size = "md", icon, removeLabel, className, children, ...props }: TagProps) {
    const name = removeLabel ?? (typeof children === "string" ? children : "tag");
    return (
        <span className={cx("ow-tag", `ow-tag--${variant}`, `ow-tag--${size}`, onRemove && "ow-tag--removable", className)} {...props}>
            {icon ? <span className="ow-tag__icon">{icon}</span> : null}
            <span className="ow-tag__label">{children}</span>
            {onRemove ? (
                <button type="button" className="ow-tag__remove" aria-label={`Remove ${name}`} onClick={onRemove}>
                    <XIcon size={12} />
                </button>
            ) : null}
        </span>
    );
}

export interface TagGroupProps extends HTMLAttributes<HTMLDivElement> {
    /** Names the set for screen readers, e.g. "Filters". */
    label?: string;
    children: ReactNode;
}

/** Tags in a wrapping row. */
export function TagGroup({ label, className, children, ...props }: TagGroupProps) {
    return (
        <div role="group" aria-label={label} className={cx("ow-tag-group", className)} {...props}>
            {children}
        </div>
    );
}

export interface ColorSwatchProps {
    /** Any CSS colour: "#312c7e", "var(--ow-brass)". */
    color: string;
    /** The colour's name, read out and shown beside the swatch. */
    name?: string;
    /** The value shown under the name, e.g. the hex. */
    value?: string;
    /** sm 16px, md 24px, lg 40px.
     * @default "md" */
    size?: "sm" | "md" | "lg";
    /** @default "square" */
    shape?: "square" | "circle";
    className?: string;
}

/** A colour sample, with its name and value if given. */
export function ColorSwatch({ color, name, value, size = "md", shape = "square", className }: ColorSwatchProps) {
    const swatch = (
        <span
            className={cx("ow-swatch", `ow-swatch--${size}`, shape === "circle" && "ow-swatch--circle")}
            style={{ background: color }}
            {...(name && !value ? { role: "img", "aria-label": name } : { "aria-hidden": true })}
        />
    );
    if (!name && !value) return <span className={className}>{swatch}</span>;
    return (
        <span className={cx("ow-swatch-label", className)}>
            {swatch}
            <span className="ow-swatch-label__text">
                {name ? <span className="ow-swatch-label__name">{name}</span> : null}
                <span className="ow-swatch-label__value">{value}</span>
            </span>
        </span>
    );
}
