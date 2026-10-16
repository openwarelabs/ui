import type { FormEvent, ReactNode } from "react";

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
