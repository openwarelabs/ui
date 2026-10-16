import { useId, useState, type FormEvent, type ReactNode } from "react";

import { useModalDialog } from "../../hooks/useModalDialog";
import { TrashIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";

export interface DialogProps {
    open: boolean;
    /** Called when the person dismisses it (Escape, the backdrop) unless `dismissible` is false. Set `open` to false here. */
    onClose(): void;
    title: ReactNode;
    /** A muted line or two under the title. */
    description?: ReactNode;
    children?: ReactNode;
    /** Buttons at the bottom right, cancel first, the main action last. */
    actions?: ReactNode;
    /** Pixels. Default 420. */
    width?: number;
    /** False while saving, so Escape and the backdrop can't close it mid-way. Default true. */
    dismissible?: boolean;
    /** Makes the dialog a form; its submit button submits it. */
    onSubmit?(event: FormEvent<HTMLFormElement>): void;
    /** `alertdialog` for one that interrupts to ask about an action, so screen readers read it out at once, as
     * ConfirmDialog does.
     * @default "dialog" */
    role?: "dialog" | "alertdialog";
    className?: string;
}

/**
 * A modal dialog on the native <dialog> element: it traps focus, sits above everything, closes with Escape
 * or a click on the backdrop, and fades and rises in.
 */
export function Dialog({
    open,
    onClose,
    title,
    description,
    children,
    actions,
    width = 420,
    dismissible = true,
    onSubmit,
    role,
    className,
}: DialogProps) {
    const titleId = useId();
    const descriptionId = useId();
    const { dialogRef, mounted } = useModalDialog(open, () => {
        if (dismissible) onClose();
    });

    if (!mounted) return null;

    const body = (
        <>
            <div className="ow-dialog__header">
                <h2 id={titleId} className="ow-dialog__title">
                    {title}
                </h2>
                {description ? (
                    <div id={descriptionId} className="ow-dialog__description">
                        {description}
                    </div>
                ) : null}
            </div>
            {children}
            {actions ? <div className="ow-dialog__actions">{actions}</div> : null}
        </>
    );

    return (
        <dialog
            ref={dialogRef}
            className={cx("ow-dialog", className)}
            role={role === "alertdialog" ? role : undefined}
            style={{ width: `min(${width}px, calc(100% - 32px))` }}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
        >
            {onSubmit ? (
                <form
                    className="ow-dialog__body"
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit(event);
                    }}
                >
                    {body}
                </form>
            ) : (
                <div className="ow-dialog__body">{body}</div>
            )}
        </dialog>
    );
}

export interface ConfirmDialogProps {
    open: boolean;
    onClose(): void;
    title: ReactNode;
    description: ReactNode;
    /** The verb on the confirm button: "Delete project", not "OK". */
    confirmLabel: string;
    /** Styles the confirm button and icon as a destructive action. */
    destructive?: boolean;
    /** Keeps the confirm button disabled, e.g. until a typed confirmation matches. */
    confirmDisabled?: boolean;
    /** Runs the action. The dialog closes when it resolves and shows the error's message when it throws. */
    onConfirm(): Promise<void> | void;
    /** Extra content between the description and the buttons, such as an option checkbox. */
    children?: ReactNode;
}

/** Asks before an action: a title, what will happen, Cancel and the action. Cancel has focus first. */
export function ConfirmDialog({
    open,
    onClose,
    title,
    description,
    confirmLabel,
    destructive = false,
    confirmDisabled = false,
    onConfirm,
    children,
}: ConfirmDialogProps) {
    const [isWorking, setIsWorking] = useState(false);
    const [error, setError] = useState("");

    async function confirm() {
        setIsWorking(true);
        setError("");
        try {
            await onConfirm();
            onClose();
        } catch (confirmError) {
            setError(
                confirmError instanceof Error && confirmError.message
                    ? confirmError.message
                    : "That didn't work. Try again.",
            );
        } finally {
            setIsWorking(false);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            dismissible={!isWorking}
            width={380}
            className="ow-dialog--confirm"
            role="alertdialog"
            title={
                <>
                    {destructive ? (
                        <span className="ow-dialog__danger-icon" aria-hidden="true">
                            <TrashIcon size={18} />
                        </span>
                    ) : null}
                    {title}
                </>
            }
            description={description}
            onSubmit={() => {
                if (!confirmDisabled && !isWorking) void confirm();
            }}
            actions={
                <>
                    <Button type="button" disabled={isWorking} autoFocus onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant={destructive ? "danger" : "primary"}
                        disabled={isWorking || confirmDisabled}
                    >
                        {isWorking ? "Working…" : confirmLabel}
                    </Button>
                </>
            }
        >
            {children}
            {error ? (
                <span role="alert" className="ow-dialog__error">
                    {error}
                </span>
            ) : null}
        </Dialog>
    );
}
