import type { HTMLAttributes, ReactNode } from "react";

export interface SignIn04Labels {
    /** The code boxes' name for screen readers. @default "Six-digit code" */
    code?: string;
    /** Under the boxes. @default "It's checked as soon as you type the last digit." */
    codeHint?: string;
    /** Under the boxes while the code is checked. @default "Checking the code…" */
    checking?: string;
    /** Under the boxes when the code is wrong. @default "That code didn't work. Codes change every 30 seconds, so try the newest one." */
    wrong?: string;
    /** The heading for a backup code. @default "Use a backup code" */
    backupTitle?: string;
    /** The line under it. @default "Enter one of the codes you saved when you turned on two-factor. Each one works once." */
    backupDescription?: string;
    /** @default "Backup code" */
    backupCode?: string;
    /** @default "xxxx-xxxx" */
    backupPlaceholder?: string;
    /** @default "Backup codes have 8 letters and numbers, like 4f7k-29xq." */
    backupInvalid?: string;
    /** The checkbox for remembering the device. @default "Don't ask again on this device for 30 days" */
    trust?: string;
    /** The form's button. @default "Verify" */
    submit?: string;
    /** @default "Use a backup code instead" */
    useBackup?: string;
    /** @default "Use your authenticator app" */
    useApp?: string;
    /** The heading once the code is right. @default "You're in" */
    doneTitle?: string;
    /** The line under it. @default "Taking you to your workspace…" */
    doneDescription?: string;
}

/** A code to check. */
export interface SignIn04Values {
    /** Six digits from the app, or a backup code in lower case. */
    code: string;
    /** Where the code came from. */
    method: "app" | "backup";
    /** Whether they ticked "Don't ask again on this device". */
    trust: boolean;
}

export interface SignIn04Props extends Omit<HTMLAttributes<HTMLElement>, "title" | "children" | "onSubmit"> {
    /** The heading over the code boxes: "Enter your code". */
    title: ReactNode;
    /** A line under it: which app, and for what. */
    description?: ReactNode;
    /** Checks the code, as soon as the sixth digit is typed (or the form is sent). Return false, or throw, when it's wrong: the boxes turn red and say so. Otherwise the card says they're in. */
    onVerify?(values: SignIn04Values): boolean | void | Promise<boolean | void>;
    /** A line under the card, such as who's signing in and a "Not you?" link. It goes once they're in. */
    footer?: ReactNode;
    /** Words that aren't content (the fields' labels, the buttons, the messages), in English unless you pass your own. */
    labels?: SignIn04Labels;
}

export type SignIn04Mode = "app" | "backup";

export type SignIn04Status = "idle" | "checking" | "wrong" | "done";
