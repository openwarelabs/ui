import { cx } from "../../utils/cx";

export interface SpinnerProps {
    /** sm 14px, md 20px, lg 28px.
     * @default "md" */
    size?: "sm" | "md" | "lg";
    /** `primary` draws the arc in the progress colour; `current` takes the text colour, for use inside buttons.
     * @default "primary" */
    tone?: "primary" | "current";
    /** Read out by screen readers. Pass an empty string when something nearby already says it's loading.
     * @default "Loading" */
    label?: string;
    className?: string;
}

/** A small spinning ring for work that takes a moment. */
export function Spinner({ size = "md", tone = "primary", label = "Loading", className }: SpinnerProps) {
    return (
        <span
            className={cx("ow-spinner", `ow-spinner--${size}`, `ow-spinner--${tone}`, className)}
            {...(label ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
        />
    );
}
