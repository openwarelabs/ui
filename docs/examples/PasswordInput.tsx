import { Button, Field, Form, PasswordInput, Stack, toast, type PasswordStrength } from "@openwarelabs/ui";

import type { DocMeta } from "@docs/app/types";

export const meta: DocMeta = {
    title: "PasswordInput",
    category: "Inputs",
    description:
        "A password field with a button that shows and hides what's typed, and an optional strength meter and checklist of rules.",
    source: "components/PasswordInput/PasswordInput.tsx",
    imports: ["PasswordInput", "passwordStrength"],
    keyboard: [["Space or Enter", "On the eye button: shows or hides the password."]],
    notes: [
        "Wrap it in a Field for its label. Every Input prop passes through, and the ref is the input's.",
        "autoComplete is current-password, for signing in. Set new-password to sign up or change a password, so password managers offer a strong one.",
        "The eye button keeps its name, “Show password”, and says whether the password is showing with aria-pressed. Clicking it leaves focus and the caret in the field.",
        "The strength word and the checklist describe the field, and the word is announced politely as it changes.",
        "passwordStrength is a quick estimate in the browser, a nudge rather than a guarantee: check new passwords against leaks on the server too.",
    ],
    related: ["Input", "Field", "Form", "Meter"],
    since: "0.14.0",
};

/** Signing in: a label from Field, and the eye to check what you typed. */
export function SignIn() {
    return (
        <div style={{ width: 320, maxWidth: "100%" }}>
            <Field label="Password">
                <PasswordInput name="password" defaultValue="correct horse" />
            </Field>
        </div>
    );
}
SignIn.layout = { align: "start" as const };

/** Signing up: strength scores the password as it's typed, from very weak to strong. */
export function Strength() {
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <Field label="Choose a password" hint="Longer is stronger. A few unrelated words work well.">
                <PasswordInput name="new-password" autoComplete="new-password" strength defaultValue="summer" />
            </Field>
        </div>
    );
}
Strength.layout = { align: "start" as const };

/** requirements show your rules as a checklist that ticks as each is met. */
export function Requirements() {
    return (
        <div style={{ width: 360, maxWidth: "100%" }}>
            <Field label="New password">
                <PasswordInput
                    name="new-password"
                    autoComplete="new-password"
                    defaultValue="Bluebird"
                    requirements={[
                        { label: "At least 12 characters", test: (value) => value.length >= 12 },
                        { label: "Upper and lower case letters", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
                        { label: "A number or a symbol", test: (value) => /[^A-Za-z]/.test(value) },
                    ]}
                />
            </Field>
        </div>
    );
}
Requirements.layout = { align: "start" as const };

/** Inside a Form, the browser's checks run on submit and the message shows under the field. */
export function InAForm() {
    return (
        <Form
            style={{ width: 360, maxWidth: "100%" }}
            onSubmit={() => toast.success("Account created", { description: "Check your inbox to confirm your email." })}
        >
            <Field
                label="Password"
                errorMessages={{
                    valueMissing: "Choose a password.",
                    tooShort: "Use at least 12 characters.",
                }}
            >
                <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    minLength={12}
                    required
                    strength
                    requirements={[{ label: "At least 12 characters", test: (value) => value.length >= 12 }]}
                />
            </Field>
            <Button type="submit" variant="primary">
                Create account
            </Button>
        </Form>
    );
}
InAForm.layout = { align: "start" as const };

// Your own rules, such as your server's, in place of the built-in estimate.
function companyPolicy(value: string): PasswordStrength {
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 4) return { score: 4, label: "Great passphrase" };
    if (words === 3) return { score: 3, label: "Good, one more word" };
    if (words === 2) return { score: 2, label: "Add two more words" };
    return { score: 1, label: "Use four words" };
}

/** Pass a function to strength to score with your own rules and words. sm suits settings rows. */
export function CustomScorer() {
    return (
        <Stack gap="md" style={{ width: 360, maxWidth: "100%" }}>
            <Field label="Passphrase" hint="Four or more words, separated by spaces.">
                <PasswordInput autoComplete="new-password" strength={companyPolicy} defaultValue="maple river" defaultVisible />
            </Field>
            <Field label="Current password">
                <PasswordInput size="sm" />
            </Field>
        </Stack>
    );
}
CustomScorer.layout = { align: "start" as const };
