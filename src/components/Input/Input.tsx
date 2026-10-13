import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cx } from "../../utils/cx";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** Shows the field as wrong: a red border, and a red halo when focused. Also sets aria-invalid.
     * @default false */
    isInvalid?: boolean;
    /** sm 32px for toolbars and settings rows, md 40px in forms.
     * @default "md" */
    size?: "sm" | "md";
    /** Inside the field, before the text: a 16px icon, a unit, a prefix like "https://". */
    startContent?: ReactNode;
    /** Inside the field, after the text: a unit, a small ghost Button, a Spinner. */
    endContent?: ReactNode;
}

/**
 * A single-line text field. With startContent or endContent, the field becomes a group and `className`
 * goes on the group, so width and margins apply to the whole field.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { className, isInvalid = false, size = "md", startContent, endContent, ...inputProps },
    ref,
) {
    const invalid = isInvalid || undefined;
    if (startContent === undefined && endContent === undefined) {
        return (
            <input
                ref={ref}
                className={cx("ow-input", size === "sm" && "ow-input--sm", isInvalid && "ow-input--invalid", className)}
                aria-invalid={invalid}
                {...inputProps}
            />
        );
    }
    return (
        <div
            className={cx(
                "ow-input-group",
                size === "sm" && "ow-input-group--sm",
                isInvalid && "ow-input-group--invalid",
                inputProps.disabled && "ow-input-group--disabled",
                className,
            )}
        >
            {startContent !== undefined ? <span className="ow-input-group__addon">{startContent}</span> : null}
            <input ref={ref} className="ow-input-group__input" aria-invalid={invalid} {...inputProps} />
            {endContent !== undefined ? <span className="ow-input-group__addon">{endContent}</span> : null}
        </div>
    );
});
