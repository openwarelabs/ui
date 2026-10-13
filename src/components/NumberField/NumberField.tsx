import { forwardRef, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { MinusIcon, PlusIcon } from "../../icons";
import { cx } from "../../utils/cx";

export interface NumberFieldProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "type" | "min" | "max" | "step"> {
    /** The number, or null when empty. */
    value?: number | null;
    /** @default null */
    defaultValue?: number | null;
    onChange?(value: number | null): void;
    min?: number;
    max?: number;
    /** How much the buttons and arrow keys change it. PageUp and PageDown move ten steps.
     * @default 1 */
    step?: number;
    /** How the number is shown while the field isn't being edited, e.g. { style: "currency", currency: "EUR" }. */
    formatOptions?: Intl.NumberFormatOptions;
    /** @default "md" */
    size?: "sm" | "md";
    /** @default false */
    isInvalid?: boolean;
    /** Names the field when there's no visible label (Field gives it one). */
    "aria-label"?: string;
}

const decimals = (step: number) => (String(step).split(".")[1] ?? "").length;

/** A number with − and + buttons either side. Up and Down step it; the value is clamped to min and max. */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
    {
        value,
        defaultValue = null,
        onChange,
        min,
        max,
        step = 1,
        formatOptions,
        size = "md",
        isInvalid = false,
        disabled,
        className,
        onBlur,
        onFocus,
        onKeyDown,
        ...inputProps
    },
    ref,
) {
    const [number, setNumber] = useControllableState(value, defaultValue, onChange);
    const [draft, setDraft] = useState<string | null>(null);
    const format = (n: number | null) =>
        n === null ? "" : formatOptions ? new Intl.NumberFormat(undefined, formatOptions).format(n) : String(n);

    const clamp = (n: number) => {
        const rounded = Number(n.toFixed(decimals(step)));
        return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded));
    };

    // While the field has focus, `draft` holds the raw text; otherwise the number is shown formatted.
    function commit(text: string, keepEditing = false) {
        setDraft(keepEditing ? text : null);
        const cleaned = text.replace(/[^\d.,-]/g, "").replace(",", ".");
        if (cleaned === "" || cleaned === "-") {
            setNumber(null);
            return;
        }
        const parsed = Number(cleaned);
        if (Number.isNaN(parsed)) return;
        const next = clamp(parsed);
        setNumber(next);
        if (keepEditing) setDraft(String(next));
    }

    function stepBy(multiple: number) {
        const base = draft !== null && draft !== "" && !Number.isNaN(Number(draft)) ? Number(draft) : (number ?? min ?? 0);
        const next = clamp(base + step * multiple);
        setNumber(next);
        if (draft !== null) setDraft(String(next));
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const moves: Record<string, () => void> = {
            ArrowUp: () => stepBy(1),
            ArrowDown: () => stepBy(-1),
            PageUp: () => stepBy(10),
            PageDown: () => stepBy(-10),
            Home: () => min !== undefined && commit(String(min), draft !== null),
            End: () => max !== undefined && commit(String(max), draft !== null),
            Enter: () => draft !== null && commit(draft, true),
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        move();
    }

    const atMin = min !== undefined && number !== null && number <= min;
    const atMax = max !== undefined && number !== null && number >= max;

    return (
        <div
            className={cx(
                "ow-number-field",
                size === "sm" && "ow-number-field--sm",
                isInvalid && "ow-number-field--invalid",
                disabled && "ow-number-field--disabled",
                className,
            )}
        >
            <button
                type="button"
                className="ow-number-field__step"
                aria-label="Decrease"
                tabIndex={-1}
                disabled={disabled || atMin}
                onClick={() => stepBy(-1)}
            >
                <MinusIcon size={14} />
            </button>
            <input
                ref={ref}
                type="text"
                inputMode={decimals(step) > 0 || (min ?? 0) < 0 ? "decimal" : "numeric"}
                role="spinbutton"
                autoComplete="off"
                className="ow-number-field__input"
                aria-valuenow={number ?? undefined}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuetext={number === null ? undefined : format(number)}
                aria-invalid={isInvalid || undefined}
                disabled={disabled}
                value={draft ?? format(number)}
                onFocus={(event) => {
                    onFocus?.(event);
                    setDraft(number === null ? "" : String(number));
                }}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={(event) => {
                    onBlur?.(event);
                    commit(event.target.value);
                }}
                onKeyDown={handleKeyDown}
                {...inputProps}
            />
            <button
                type="button"
                className="ow-number-field__step"
                aria-label="Increase"
                tabIndex={-1}
                disabled={disabled || atMax}
                onClick={() => stepBy(1)}
            >
                <PlusIcon size={14} />
            </button>
        </div>
    );
});
