import { createContext, useContext, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { cx } from "../../utils/cx";
import { Fieldset } from "../Checkbox/Checkbox";

interface RadioGroupContextValue {
    name: string;
    value: string;
    select(value: string): void;
    disabled: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
    /** The question, shown as the group's legend. */
    label: ReactNode;
    /** A muted line under the label. */
    description?: ReactNode;
    value?: string;
    /** The starting choice when uncontrolled.
     * @default "" */
    defaultValue?: string;
    onChange?(value: string): void;
    /** @default "vertical" */
    orientation?: "vertical" | "horizontal";
    /** `default` is a dot and a label; `cards` turns each option into a bordered card, for choices that need a description.
     * @default "default" */
    variant?: "default" | "cards";
    /** An error under the options. */
    error?: ReactNode;
    disabled?: boolean;
    /** The form field name. Generated when left out. */
    name?: string;
    /** Radio options. */
    children: ReactNode;
    className?: string;
}

/** One choice from a few visible options. The arrow keys move between them, as with any radio group. */
export function RadioGroup({
    label,
    description,
    value,
    defaultValue = "",
    onChange,
    orientation = "vertical",
    variant = "default",
    error,
    disabled = false,
    name,
    children,
    className,
}: RadioGroupProps) {
    const [current, select] = useControllableState(value, defaultValue, onChange);
    const generatedName = useId();
    return (
        <RadioGroupContext.Provider value={{ name: name ?? generatedName, value: current, select, disabled }}>
            <Fieldset
                legend={label}
                description={description}
                error={error}
                className={cx(
                    "ow-radio-group",
                    orientation === "horizontal" && "ow-fieldset--horizontal",
                    variant === "cards" && "ow-radio-group--cards",
                    className,
                )}
            >
                {children}
            </Fieldset>
        </RadioGroupContext.Provider>
    );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "size"> {
    value: string;
    /** The label. */
    children: ReactNode;
    /** A muted line under the label. */
    description?: ReactNode;
}

/** One option in a RadioGroup. */
export function Radio({ value, children, description, disabled, className, ...inputProps }: RadioProps) {
    const group = useContext(RadioGroupContext);
    const descriptionId = useId();
    if (!group) throw new Error("Radio must be inside <RadioGroup>.");
    const isDisabled = disabled || group.disabled;
    return (
        <label className={cx("ow-check-label", "ow-radio-label", isDisabled && "ow-check-label--disabled", className)}>
            <span className="ow-radio">
                <input
                    type="radio"
                    className="ow-radio__input"
                    name={group.name}
                    value={value}
                    checked={group.value === value}
                    disabled={isDisabled}
                    aria-describedby={description ? descriptionId : undefined}
                    onChange={() => group.select(value)}
                    {...inputProps}
                />
            </span>
            <span className="ow-check-label__text">
                <span>{children}</span>
                {description ? (
                    <span id={descriptionId} className="ow-check-label__description">
                        {description}
                    </span>
                ) : null}
            </span>
        </label>
    );
}
