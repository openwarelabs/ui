import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "../../utils/cx";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** `none` for a card that holds a list or table edge to edge; `md` is 16px, `lg` 24px.
     * @default "md" */
    padding?: "none" | "md" | "lg";
}

/** A surface with a hairline border and no shadow: borders before shadows. */
export function Card({ className, padding = "md", ...props }: CardProps) {
    return <div className={cx("ow-card", `ow-card--pad-${padding}`, className)} {...props} />;
}

export interface SettingsRowProps {
    label: ReactNode;
    /** A muted line or two under the label. */
    description?: ReactNode;
    /** The control: a Switch, a Select, a Button. */
    children: ReactNode;
    className?: string;
}

/** A label on the left and its control on the right, like macOS System Settings. Stack them in a Card. */
export function SettingsRow({ children, description, label, className }: SettingsRowProps) {
    return (
        <div className={cx("ow-settings-row", className)}>
            <div className="ow-settings-row__text">
                <span className="ow-settings-row__label">{label}</span>
                {description ? <div className="ow-settings-row__description">{description}</div> : null}
            </div>
            <div className="ow-settings-row__control">{children}</div>
        </div>
    );
}
