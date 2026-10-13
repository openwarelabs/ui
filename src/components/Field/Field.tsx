import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

import { cx } from "../../utils/cx";

export interface FieldProps {
    /** The label, set above the control. */
    label: ReactNode;
    /** One control: an Input, Textarea, Select, or any element that takes an id. */
    children: ReactElement;
    /** A muted line under the control. */
    hint?: ReactNode;
    /** An error under the control; it also marks the control invalid. */
    error?: ReactNode;
    className?: string;
}

/**
 * A label above a control, with an optional hint and error below. Field wires them together:
 * it gives the control an id (unless it has one), points aria-describedby at the hint and error,
 * and marks it invalid when there is an error.
 */
export function Field({ label, children, hint, error, className }: FieldProps) {
    const generatedId = useId();
    const hintId = `${generatedId}-hint`;
    const errorId = `${generatedId}-error`;

    const child = isValidElement<Record<string, unknown>>(children) ? children : null;
    const controlId = (child?.props.id as string | undefined) ?? `${generatedId}-control`;
    const describedBy =
        [child?.props["aria-describedby"] as string | undefined, hint ? hintId : undefined, error ? errorId : undefined]
            .filter(Boolean)
            .join(" ") || undefined;

    // Our own controls draw the invalid state from `isInvalid`; native elements get aria-invalid.
    const invalidProp =
        child && typeof child.type !== "string"
            ? { isInvalid: (child.props.isInvalid as boolean | undefined) ?? Boolean(error) }
            : { "aria-invalid": error ? true : undefined };

    return (
        <div className={cx("ow-field", className)}>
            <label className="ow-field__label" htmlFor={controlId}>
                {label}
            </label>
            {child
                ? cloneElement(child, { id: controlId, "aria-describedby": describedBy, ...invalidProp })
                : children}
            {hint ? (
                <p id={hintId} className="ow-field__hint">
                    {hint}
                </p>
            ) : null}
            {error ? (
                <p id={errorId} role="alert" className="ow-field__error">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
