import type { HTMLAttributes, ReactNode } from "react";

import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { CloseButton } from "../Button/ButtonGroup";

export type AlertVariant = "info" | "success" | "warning" | "danger" | "neutral";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    /** info for news, success for something done, warning for something that needs the person, danger for something that failed.
     * @default "info" */
    variant?: AlertVariant;
    /** A short bold line. */
    title?: ReactNode;
    /** Replaces the variant's icon; false hides it. */
    icon?: ReactNode | false;
    /** Buttons under the text, usually small ones. */
    actions?: ReactNode;
    /** Shows a ✕ that calls this. */
    onClose?(): void;
    children?: ReactNode;
}

const icons: Record<AlertVariant, ReactNode> = {
    info: <InfoIcon size={16} />,
    success: <CircleCheckIcon size={16} />,
    warning: <TriangleAlertIcon size={16} />,
    danger: <CircleAlertIcon size={16} />,
    neutral: <InfoIcon size={16} />,
};

/** A message inside the page about the page: a notice, a warning before an action, an error that blocks the work. */
export function Alert({
    variant = "info",
    title,
    icon,
    actions,
    onClose,
    children,
    className,
    role,
    ...props
}: AlertProps) {
    return (
        <div
            role={role ?? (variant === "danger" || variant === "warning" ? "alert" : "status")}
            className={cx("ow-alert", `ow-alert--${variant}`, className)}
            {...props}
        >
            {icon === false ? null : <span className="ow-alert__icon">{icon ?? icons[variant]}</span>}
            <div className="ow-alert__body">
                {title ? <div className="ow-alert__title">{title}</div> : null}
                {children ? <div className="ow-alert__description">{children}</div> : null}
                {actions ? <div className="ow-alert__actions">{actions}</div> : null}
            </div>
            {onClose ? <CloseButton size="sm" label="Dismiss" className="ow-alert__close" onClick={onClose} /> : null}
        </div>
    );
}
