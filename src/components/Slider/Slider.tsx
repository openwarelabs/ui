import { useId, type CSSProperties, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { cx } from "../../utils/cx";

type SliderValue = number | [number, number];

export interface SliderProps<V extends SliderValue = number> {
    /** A number, or a [low, high] pair for a range with two handles. */
    value?: V;
    defaultValue?: V;
    onChange?(value: NoInfer<V>): void;
    /** Called when the person lets go, for work too slow to do on every move. */
    onChangeEnd?(value: NoInfer<V>): void;
    /** @default 0 */
    min?: number;
    /** @default 100 */
    max?: number;
    /** @default 1 */
    step?: number;
    /** Shown above the track, and names the slider for screen readers. */
    label?: ReactNode;
    /** Shows the current value at the right of the label.
     * @default true */
    showValue?: boolean;
    /** Turns a number into the text shown and read out, e.g. (v) => `${v}%`. */
    formatValue?(value: number): string;
    /** Names the slider when there's no visible label. */
    "aria-label"?: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Picks a number, or a range, by dragging. It's built on native range inputs, so the arrow keys,
 * PageUp, PageDown, Home and End work as people expect.
 */
export function Slider<V extends SliderValue = number>({
    value,
    defaultValue,
    onChange,
    onChangeEnd,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = true,
    formatValue = String,
    "aria-label": ariaLabel,
    disabled,
    className,
}: SliderProps<V>) {
    const [current, setCurrent] = useControllableState<V>(value, (defaultValue ?? min) as V, onChange);
    const labelId = useId();
    const isRange = Array.isArray(current);
    const [low, high] = isRange ? (current as [number, number]) : [min, current as number];
    const pct = (n: number) => ((n - min) / (max - min || 1)) * 100;
    const style = { "--ow-slider-from": `${isRange ? pct(low) : 0}%`, "--ow-slider-to": `${pct(high)}%` } as CSSProperties;
    const display = isRange ? `${formatValue(low)} – ${formatValue(high)}` : formatValue(high);
    const end = () => onChangeEnd?.(current);

    const input = (which: "low" | "high") => {
        const own = which === "low" ? low : high;
        return (
            <input
                type="range"
                className={cx("ow-slider__input", isRange && `ow-slider__input--${which}`)}
                // When the handles meet near the top, the low one must be on top to be draggable back down.
                style={which === "low" && low === high && pct(low) > 50 ? { zIndex: 3 } : undefined}
                min={min}
                max={max}
                step={step}
                value={own}
                disabled={disabled}
                aria-labelledby={label ? labelId : undefined}
                aria-label={label ? undefined : isRange ? `${ariaLabel ?? "Range"}, ${which === "low" ? "minimum" : "maximum"}` : ariaLabel}
                aria-valuetext={formatValue(own)}
                onChange={(event) => {
                    const n = Number(event.target.value);
                    if (!isRange) setCurrent(n as V);
                    else if (which === "low") setCurrent([Math.min(n, high), high] as V);
                    else setCurrent([low, Math.max(n, low)] as V);
                }}
                onPointerUp={end}
                onKeyUp={end}
            />
        );
    };

    return (
        <div className={cx("ow-slider", disabled && "ow-slider--disabled", className)}>
            {label || showValue ? (
                <div className="ow-slider__header">
                    {label ? (
                        <span id={labelId} className="ow-slider__label">
                            {label}
                        </span>
                    ) : (
                        <span />
                    )}
                    {showValue ? (
                        <output className="ow-slider__value" aria-hidden="true">
                            {display}
                        </output>
                    ) : null}
                </div>
            ) : null}
            <div className="ow-slider__control" style={style}>
                <span className="ow-slider__track" aria-hidden="true">
                    <span className="ow-slider__fill" />
                </span>
                {isRange ? input("low") : null}
                {input("high")}
            </div>
        </div>
    );
}
