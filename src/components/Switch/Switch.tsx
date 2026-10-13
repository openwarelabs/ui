import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cx } from "../../utils/cx";

export interface SwitchProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "type" | "role"> {
    checked: boolean;
    onChange(checked: boolean): void;
    /** What it turns on, for screen readers. Leave it out only when aria-labelledby names it. */
    label?: string;
}

/** A small on/off switch for settings rows; it takes effect at once, with no save button. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
    { checked, onChange, label, className, disabled, ...buttonProps },
    ref,
) {
    return (
        <button
            ref={ref}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            className={cx("ow-switch", checked && "ow-switch--on", className)}
            onClick={() => onChange(!checked)}
            {...buttonProps}
        >
            <span className="ow-switch__knob" />
        </button>
    );
});
