import { forwardRef, useRef, type CSSProperties, type KeyboardEvent } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { CheckIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { describeColor, inkFor, normalizeHex, parseHex } from "./color";

export interface ColorSwatchPickerOption {
    /** A hex colour: "#312c7e". */
    value: string;
    /** The colour's name, read out and shown on hover: "Midnight". Defaults to a description, like "dark indigo". */
    label?: string;
    /** Shown faded and skipped by the arrow keys, e.g. a colour another label has taken. */
    disabled?: boolean;
}

export interface ColorSwatchPickerProps {
    /** The colours to choose from: hex strings, or { value, label } to give them names. */
    options: Array<string | ColorSwatchPickerOption>;
    /** The chosen colour. It matches an option whatever its case or length (#abc, #aabbcc). */
    value?: string;
    /** The starting colour when uncontrolled. Defaults to none. */
    defaultValue?: string;
    /** Called with the chosen option's value, as written in `options`. */
    onChange?(color: string): void;
    /** sm 24px, md 32px swatches.
     * @default "md" */
    size?: "sm" | "md";
    /** @default "square" */
    shape?: "square" | "circle";
    /** Fades every swatch and takes the picker out of the tab order.
     * @default false */
    disabled?: boolean;
    /** The form field name; the chosen colour is submitted under it. */
    name?: string;
    /** Names the group for screen readers, e.g. "Label colour". */
    "aria-label"?: string;
    /** Names the group by a visible heading's id, in place of aria-label. */
    "aria-labelledby"?: string;
    /** Ids of a hint or an error, read out with the group. */
    "aria-describedby"?: string;
    /** The group's id. */
    id?: string;
    /** Classes for the group, e.g. a width that sets where the rows wrap. */
    className?: string;
}

/**
 * Picks one colour from a set of swatches, in rows that wrap. It's a radio group: Tab moves into it, onto the chosen
 * swatch, and the arrow keys move and choose. The chosen swatch has a ring and a check mark.
 */
export const ColorSwatchPicker = forwardRef<HTMLDivElement, ColorSwatchPickerProps>(function ColorSwatchPicker(
    { options, value, defaultValue, onChange, size = "md", shape = "square", disabled = false, name, className, ...aria },
    ref,
) {
    const [current, setCurrent] = useControllableState(value, defaultValue ?? "", onChange);
    const refs = useRef<Array<HTMLDivElement | null>>([]);
    const items = options.map((option) => {
        const item = typeof option === "string" ? { value: option } : option;
        const rgba = parseHex(item.value);
        return { ...item, rgba, label: item.label ?? (rgba ? describeColor(rgba) : item.value) };
    });
    const chosen = current ? normalizeHex(current) : "";
    const selectedIndex = items.findIndex((item) => normalizeHex(item.value) === chosen);
    const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]));
    const tabStop = selectedIndex >= 0 && !items[selectedIndex]!.disabled ? selectedIndex : enabled[0];

    function choose(index: number) {
        const item = items[index];
        if (disabled || !item || item.disabled) return;
        setCurrent(item.value);
    }

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number) {
        if (disabled) return;
        if (event.key === " ") {
            event.preventDefault();
            choose(index);
            return;
        }
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const moves: Record<string, number> = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 };
        const position = enabled.indexOf(index);
        let target: number | undefined;
        // Moving past the end of a row goes on to the next row; past the last swatch, back to the first.
        if (event.key in moves) target = enabled[(position + moves[event.key]! + enabled.length) % enabled.length];
        else if (event.key === "Home") target = enabled[0];
        else if (event.key === "End") target = enabled[enabled.length - 1];
        if (target === undefined) return;
        event.preventDefault();
        refs.current[target]?.focus();
        choose(target);
    }

    return (
        <div
            ref={ref}
            role="radiogroup"
            aria-disabled={disabled || undefined}
            className={cx(
                "ow-color-swatch-picker",
                `ow-color-swatch-picker--${size}`,
                { "ow-color-swatch-picker--circle": shape === "circle", "ow-color-swatch-picker--disabled": disabled },
                className,
            )}
            {...aria}
        >
            {items.map((item, index) => {
                const isSelected = index === selectedIndex;
                const isDisabled = disabled || Boolean(item.disabled);
                return (
                    <div
                        key={`${item.value}-${index}`}
                        ref={(element) => {
                            refs.current[index] = element;
                        }}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={item.label}
                        aria-disabled={isDisabled || undefined}
                        tabIndex={!isDisabled && index === tabStop ? 0 : -1}
                        title={item.label}
                        data-ink={item.rgba ? inkFor(item.rgba) : "dark"}
                        className="ow-color-swatch-picker__swatch"
                        style={{ "--ow-color-swatch-picker-value": item.value } as CSSProperties}
                        onClick={() => choose(index)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                    >
                        <CheckIcon size={size === "sm" ? 14 : 16} strokeWidth={2.5} className="ow-color-swatch-picker__check" aria-hidden="true" />
                    </div>
                );
            })}
            {name ? <input type="hidden" name={name} value={selectedIndex >= 0 ? items[selectedIndex]!.value : ""} /> : null}
        </div>
    );
});
