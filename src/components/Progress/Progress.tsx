import { useId, type CSSProperties, type ReactNode } from "react";

import { cx } from "../../utils/cx";

export type ProgressTone = "primary" | "success" | "warning" | "danger";

export interface ProgressBarProps {
    /** How far along, from 0 to max. Leave out for work of unknown length. */
    value?: number;
    /** @default 100 */
    max?: number;
    /** Shown above the bar, and names it for screen readers. */
    label?: ReactNode;
    /** Shows the value at the right of the label.
     * @default true */
    showValue?: boolean;
    /** The text shown and read out for the value, e.g. "3 of 8 stages". Defaults to a percentage. */
    valueLabel?: string;
    /** sm is 4px, for a pipeline bar; md is 8px.
     * @default "sm" */
    size?: "sm" | "md";
    /** @default "primary" */
    tone?: ProgressTone;
    "aria-label"?: string;
    className?: string;
}

/** How far a task has got: a thin bar, or a sliding segment when the length isn't known. */
export function ProgressBar({
    value,
    max = 100,
    label,
    showValue = true,
    valueLabel,
    size = "sm",
    tone = "primary",
    "aria-label": ariaLabel,
    className,
}: ProgressBarProps) {
    const labelId = useId();
    const indeterminate = value === undefined;
    const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
    const text = valueLabel ?? `${Math.round(pct)}%`;
    return (
        <div className={cx("ow-progress", `ow-progress--${size}`, `ow-progress--${tone}`, className)}>
            {label || (showValue && !indeterminate) ? (
                <div className="ow-progress__header">
                    {label ? (
                        <span id={labelId} className="ow-progress__label">
                            {label}
                        </span>
                    ) : (
                        <span />
                    )}
                    {showValue && !indeterminate ? <span className="ow-progress__value">{text}</span> : null}
                </div>
            ) : null}
            <div
                role="progressbar"
                aria-labelledby={label ? labelId : undefined}
                aria-label={label ? undefined : ariaLabel}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={indeterminate ? undefined : value}
                aria-valuetext={indeterminate ? undefined : text}
                className={cx("ow-progress__track", indeterminate && "ow-progress__track--indeterminate")}
            >
                <div className="ow-progress__fill" style={indeterminate ? undefined : { width: `${pct}%` }} />
            </div>
        </div>
    );
}

export interface ProgressCircleProps {
    /** From 0 to max. Leave out to spin, for work of unknown length. */
    value?: number;
    /** @default 100 */
    max?: number;
    /** sm 16px, md 24px, lg 48px (lg shows the percentage inside).
     * @default "md" */
    size?: "sm" | "md" | "lg";
    /** @default "primary" */
    tone?: ProgressTone;
    /** Names it for screen readers.
     * @default "Progress" */
    "aria-label"?: string;
    className?: string;
}

const circleSizes = { sm: { box: 16, stroke: 2.5 }, md: { box: 24, stroke: 3 }, lg: { box: 48, stroke: 4 } };

/** Progress as a ring, for tight spaces: a row in a list, a file being uploaded. */
export function ProgressCircle({
    value,
    max = 100,
    size = "md",
    tone = "primary",
    "aria-label": ariaLabel = "Progress",
    className,
}: ProgressCircleProps) {
    const { box, stroke } = circleSizes[size];
    const radius = (box - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const indeterminate = value === undefined;
    const pct = indeterminate ? 25 : Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <span
            role="progressbar"
            aria-label={ariaLabel}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={indeterminate ? undefined : value}
            className={cx(
                "ow-progress-circle",
                `ow-progress--${tone}`,
                indeterminate && "ow-progress-circle--indeterminate",
                className,
            )}
            style={{ width: box, height: box } as CSSProperties}
        >
            <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
                <circle className="ow-progress-circle__track" cx={box / 2} cy={box / 2} r={radius} strokeWidth={stroke} fill="none" />
                <circle
                    className="ow-progress-circle__fill"
                    cx={box / 2}
                    cy={box / 2}
                    r={radius}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct / 100)}
                    transform={`rotate(-90 ${box / 2} ${box / 2})`}
                />
            </svg>
            {size === "lg" && !indeterminate ? <span className="ow-progress-circle__value">{Math.round(pct)}%</span> : null}
        </span>
    );
}
