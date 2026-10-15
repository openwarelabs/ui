import type { ReactNode } from "react";

import type { InputProps } from "@/components/Input/Input";

/** How strong a password is: a score from 0 (very weak) to 4 (strong), and the word shown for it. */
export interface PasswordStrength {
    /** 0 very weak, 1 weak, 2 fair, 3 good, 4 strong. */
    score: 0 | 1 | 2 | 3 | 4;
    /** The word shown and read out, such as "Good". Defaults to the score's: Very weak, Weak, Fair, Good, Strong. */
    label?: string;
}

/** Scores a password, such as a wrapper around zxcvbn or your server's own rules. */
export type PasswordStrengthScorer = (value: string) => PasswordStrength;

/** One rule in the checklist under the field. */
export interface PasswordRequirement {
    /** What the rule asks for, such as "At least 12 characters". */
    label: ReactNode;
    /** Whether the password meets it. */
    test(value: string): boolean;
}

export interface PasswordInputProps extends Omit<InputProps, "type" | "endContent"> {
    /**
     * Shows a strength meter under the field: `true` scores it with the built-in `passwordStrength`, or pass your own
     * function from the value to `{ score, label }`. The word is announced politely as it changes.
     * @default false
     */
    strength?: boolean | PasswordStrengthScorer;
    /** Names the strength meter, and starts the line under it.
     * @default "Password strength" */
    strengthLabel?: string;
    /** Rules shown as a checklist under the field, each ticked once the password meets it. */
    requirements?: PasswordRequirement[];
    /** Shows the password as text, when you control it. */
    visible?: boolean;
    /** Shows the password as text at first, when it controls itself.
     * @default false */
    defaultVisible?: boolean;
    /** Called when the person shows or hides the password. */
    onVisibleChange?(visible: boolean): void;
    /** Names the show and hide button for screen readers. It stays the same either way; aria-pressed says which.
     * @default "Show password" */
    toggleLabel?: string;
    /**
     * What browsers and password managers fill in: `current-password` to sign in, `new-password` to sign up or change
     * a password (so they offer a strong one).
     * @default "current-password"
     */
    autoComplete?: string;
}
