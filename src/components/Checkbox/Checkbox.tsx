import {
    createContext,
    forwardRef,
    useContext,
    useEffect,
    useId,
    useRef,
    type ForwardedRef,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { CheckIcon, MinusIcon } from "../../icons";
import { cx } from "../../utils/cx";

interface CheckboxGroupContextValue {
    value: string[];
    toggle(value: string, checked: boolean): void;
    name: string;
    disabled: boolean;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    /** `sm` is 14px, for dense rows; `md` is 16px.
     * @default "md" */
    size?: "sm" | "md";
    /** `danger` for choices that make an action destructive, like also deleting files.
     * @default "primary" */
    tone?: "primary" | "danger";
    /** Shows a dash: some, not all, of what it controls is checked (a "select all" box).
     * @default false */
    indeterminate?: boolean;
    /** The label. With it, Checkbox renders its own <label>; without it, wrap it in yours. */
    children?: ReactNode;
    /** A muted line under the label. */
    description?: ReactNode;
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
    if (typeof ref === "function") ref(value);
    else if (ref) ref.current = value;
}

/**
 * A real checkbox input, restyled. It keeps native behaviour (Space to toggle, form submission, `disabled`).
 * Give it children for its label, or wrap the bare box in your own <label>. Inside a CheckboxGroup, give it a `value`.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    {
        className,
        size = "md",
        tone = "primary",
        indeterminate = false,
        children,
        description,
        value,
        checked,
        onChange,
        disabled,
        name,
        "aria-describedby": describedBy,
        ...inputProps
    },
    ref,
) {
    const group = useContext(CheckboxGroupContext);
    const innerRef = useRef<HTMLInputElement | null>(null);
    const descriptionId = useId();
    const inGroup = group !== null && value !== undefined;

    useEffect(() => {
        if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const box = (
        <span
            className={cx(
                "ow-checkbox",
                `ow-checkbox--${size}`,
                tone === "danger" && "ow-checkbox--danger",
                children === undefined && className,
            )}
        >
            <input
                ref={(element) => {
                    innerRef.current = element;
                    assignRef(ref, element);
                }}
                type="checkbox"
                className="ow-checkbox__input"
                value={value}
                name={inGroup ? group.name : name}
                checked={inGroup ? group.value.includes(String(value)) : checked}
                disabled={disabled || (inGroup && group.disabled)}
                aria-describedby={[describedBy, description ? descriptionId : undefined].filter(Boolean).join(" ") || undefined}
                onChange={(event) => {
                    onChange?.(event);
                    if (inGroup) group.toggle(String(value), event.target.checked);
                }}
                {...inputProps}
            />
            {indeterminate ? (
                <MinusIcon className="ow-checkbox__check ow-checkbox__check--dash" size={size === "sm" ? 10 : 12} strokeWidth={3} />
            ) : (
                <CheckIcon className="ow-checkbox__check" size={size === "sm" ? 10 : 12} strokeWidth={3} />
            )}
        </span>
    );

    if (children === undefined) return box;
    return (
        <label className={cx("ow-check-label", (disabled || (inGroup && group.disabled)) && "ow-check-label--disabled", className)}>
            {box}
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
});

export interface CheckboxGroupProps {
    /** The question, shown as the group's legend. */
    label: ReactNode;
    /** A muted line under the label. */
    description?: ReactNode;
    /** The checked values. */
    value?: string[];
    /** @default [] */
    defaultValue?: string[];
    onChange?(value: string[]): void;
    /** @default "vertical" */
    orientation?: "vertical" | "horizontal";
    /** An error under the options. */
    error?: ReactNode;
    disabled?: boolean;
    /** The form field name for every box. */
    name?: string;
    /** Checkboxes, each with a `value` and a label. */
    children: ReactNode;
    className?: string;
}

/** Several options where any number can be chosen, under one label. */
export function CheckboxGroup({
    label,
    description,
    value,
    defaultValue = [],
    onChange,
    orientation = "vertical",
    error,
    disabled = false,
    name,
    children,
    className,
}: CheckboxGroupProps) {
    const [current, setCurrent] = useControllableState(value, defaultValue, onChange);
    const generatedName = useId();
    const errorId = useId();
    return (
        <CheckboxGroupContext.Provider
            value={{
                value: current,
                name: name ?? generatedName,
                disabled,
                toggle(item, checked) {
                    setCurrent(checked ? [...current.filter((v) => v !== item), item] : current.filter((v) => v !== item));
                },
            }}
        >
            <Fieldset
                legend={label}
                description={description}
                error={error}
                errorId={errorId}
                className={cx(orientation === "horizontal" && "ow-fieldset--horizontal", className)}
            >
                {children}
            </Fieldset>
        </CheckboxGroupContext.Provider>
    );
}

export interface FieldsetProps {
    /** The group's title. */
    legend: ReactNode;
    /** A muted line under the legend. */
    description?: ReactNode;
    /** An error under the content, announced when it appears. */
    error?: ReactNode;
    /** @internal */
    errorId?: string;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
}

/** Groups related controls under a legend: a set of checkboxes, an address, a pair of dates. */
export function Fieldset({ legend, description, error, errorId, disabled, children, className }: FieldsetProps) {
    const generatedId = useId();
    const descriptionId = `${generatedId}-description`;
    const resolvedErrorId = errorId ?? `${generatedId}-error`;
    return (
        <fieldset
            className={cx("ow-fieldset", className)}
            disabled={disabled}
            aria-describedby={[description ? descriptionId : "", error ? resolvedErrorId : ""].filter(Boolean).join(" ") || undefined}
        >
            <legend className="ow-fieldset__legend">{legend}</legend>
            {description ? (
                <p id={descriptionId} className="ow-fieldset__description">
                    {description}
                </p>
            ) : null}
            <div className="ow-fieldset__content">{children}</div>
            {error ? (
                <p id={resolvedErrorId} role="alert" className="ow-field__error">
                    {error}
                </p>
            ) : null}
        </fieldset>
    );
}
