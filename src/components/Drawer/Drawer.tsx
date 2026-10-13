import { useId, type ReactNode } from "react";

import { useModalDialog } from "../../hooks/useModalDialog";
import { cx } from "../../utils/cx";
import { CloseButton } from "../Button/ButtonGroup";

export interface DrawerProps {
    open: boolean;
    /** Called on Escape, the backdrop or the ✕, unless `dismissible` is false. Set `open` to false here. */
    onClose(): void;
    title: ReactNode;
    /** A muted line under the title. */
    description?: ReactNode;
    children?: ReactNode;
    /** Buttons pinned to the bottom: Cancel first, the main action last. */
    footer?: ReactNode;
    /** Which edge it slides in from.
     * @default "right" */
    side?: "right" | "left" | "bottom";
    /** Width (or height, from the bottom) in pixels.
     * @default 420 */
    size?: number;
    /** @default true */
    dismissible?: boolean;
    className?: string;
}

/** A panel that slides in from an edge over the page, for details or a form beside what the person was doing. */
export function Drawer({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    side = "right",
    size = 420,
    dismissible = true,
    className,
}: DrawerProps) {
    const titleId = useId();
    const descriptionId = useId();
    const { dialogRef, mounted } = useModalDialog(open, () => {
        if (dismissible) onClose();
    });

    if (!mounted) return null;

    const sizeStyle = side === "bottom" ? { height: `min(${size}px, 90dvh)` } : { width: `min(${size}px, 100vw - 24px)` };

    return (
        <dialog
            ref={dialogRef}
            className={cx("ow-drawer", `ow-drawer--${side}`, className)}
            style={sizeStyle}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
        >
            <header className="ow-drawer__header">
                <div className="ow-drawer__titles">
                    <h2 id={titleId} className="ow-drawer__title">
                        {title}
                    </h2>
                    {description ? (
                        <p id={descriptionId} className="ow-drawer__description">
                            {description}
                        </p>
                    ) : null}
                </div>
                {dismissible ? <CloseButton onClick={onClose} /> : null}
            </header>
            <div className="ow-drawer__body">{children}</div>
            {footer ? <footer className="ow-drawer__footer">{footer}</footer> : null}
        </dialog>
    );
}
