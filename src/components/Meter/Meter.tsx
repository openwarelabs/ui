import { useId, type ReactNode } from "react";

import { cx } from "../../utils/cx";
import type { ProgressTone } from "../Progress/Progress";

export interface MeterProps {
    /** The amount measured, from min to max. */
    value: number;
    /** @default 0 */
    min?: number;
    /** @default 100 */
    max?: number;
    /** Shown above the bar, and names it for screen readers. */
    label?: ReactNode;
    /** Shows the value label at the right of the label.
     * @default true */
    showValue?: boolean;
    /**
     * The text shown and read out for the value: a string ("Strong"), or a function given the value, min and max
     * formatted with `formatOptions`, such as `({ value, max }) => \`${value} of ${max}\``. Defaults to the formatted value.
     */
    valueLabel?: string | ((formatted: { value: string; min: string; max: string }) => string);
    /**
     * How the value is written, as Intl.NumberFormat options. The percent style shows where the value sits in the range;
     * any other formats the value itself, such as `{ style: "unit", unit: "gigabyte" }`.
     * @default { style: "percent" }
     */
    formatOptions?: Intl.NumberFormatOptions;
    /** The locale numbers are written in, such as "de-CH". Defaults to the browser's. */
    locale?: string;
    /** The fill's colour. Leave it out to work it out from `low`, `high` and `optimum`; with none of those, it's primary. */
    tone?: ProgressTone;
    /** Values below this are in the low range, as on the meter element.
     * @default min */
    low?: number;
    /** Values above this are in the high range.
     * @default max */
    high?: number;
    /**
     * The best value. The range it's in is good (success), the middle range otherwise middling (warning), and the range
     * at the far end bad (danger). With optimum between low and high, both outer ranges are middling.
     * @default halfway between min and max
     */
    optimum?: number;
    /** sm is 4px; md is 8px.
     * @default "sm" */
    size?: "sm" | "md";
    /** Draws the bar as this many separate blocks, such as 4 for a password's strength. */
    segments?: number;
    id?: string;
    /** Names the meter for screen readers when there's no `label`. */
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    className?: string;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** The meter element's gauge regions: the optimum's region is good, its neighbour middling, the far one bad. */
function toneOf(value: number, min: number, max: number, low = min, high = max, optimum = (min + max) / 2): ProgressTone {
    const lowEdge = clamp(low, min, max);
    const highEdge = clamp(high, lowEdge, max);
    const best = clamp(optimum, min, max);
    const region = value < lowEdge ? 0 : value > highEdge ? 2 : 1;
    const bestRegion = best < lowEdge ? 0 : best > highEdge ? 2 : 1;
    const distance = Math.abs(region - bestRegion);
    return distance === 0 ? "success" : distance === 1 ? "warning" : "danger";
}

/**
 * An amount within a known range: storage used, runs against a plan's limit, a password's strength. Unlike ProgressBar,
 * it doesn't mean something will finish.
 */
export function Meter({
    value,
    min = 0,
    max = 100,
    label,
    showValue = true,
    valueLabel,
    formatOptions = { style: "percent" },
    locale,
    tone,
    low,
    high,
    optimum,
    size = "sm",
    segments,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    className,
}: MeterProps) {
    const labelId = useId();
    const current = clamp(value, min, Math.max(min, max));
    const fraction = max > min ? (current - min) / (max - min) : 0;

    const formatter = new Intl.NumberFormat(locale, formatOptions);
    const asPercent = formatOptions.style === "percent";
    const formatted = {
        value: formatter.format(asPercent ? fraction : current),
        min: formatter.format(asPercent ? 0 : min),
        max: formatter.format(asPercent ? 1 : max),
    };
    const text = typeof valueLabel === "function" ? valueLabel(formatted) : (valueLabel ?? formatted.value);

    const hasThresholds = low !== undefined || high !== undefined || optimum !== undefined;
    const resolvedTone = tone ?? (hasThresholds ? toneOf(current, min, max, low, high, optimum) : "primary");
    const blocks = segments && segments > 1 ? Math.round(segments) : 0;

    return (
        <div className={cx("ow-meter", `ow-meter--${size}`, `ow-meter--${resolvedTone}`, className)}>
            {label || showValue ? (
                <div className="ow-meter__header">
                    {label ? (
                        <span id={labelId} className="ow-meter__label">
                            {label}
                        </span>
                    ) : (
                        <span />
                    )}
                    {showValue ? <span className="ow-meter__value">{text}</span> : null}
                </div>
            ) : null}
            <div
                id={id}
                role="meter"
                aria-labelledby={ariaLabelledBy ?? (label ? labelId : undefined)}
                aria-label={ariaLabelledBy || label ? undefined : ariaLabel}
                aria-describedby={ariaDescribedBy}
                aria-valuenow={current}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuetext={text}
                className={cx("ow-meter__track", blocks > 0 && "ow-meter__track--segmented")}
            >
                {blocks > 0 ? (
                    Array.from({ length: blocks }, (_, index) => (
                        <span key={index} className="ow-meter__segment">
                            <span className="ow-meter__fill" style={{ width: `${clamp(fraction * blocks - index, 0, 1) * 100}%` }} />
                        </span>
                    ))
                ) : (
                    <span className="ow-meter__fill" style={{ width: `${fraction * 100}%` }} />
                )}
            </div>
        </div>
    );
}
