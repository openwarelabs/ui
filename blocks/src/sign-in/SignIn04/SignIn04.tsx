import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, Card, Checkbox, cx, Field, Input, InputOTP, Spinner, Text } from "@openwarelabs/ui";

import { CircleCheckIcon, KeyRoundIcon, ShieldCheckIcon } from "@blocks/shared/icons";
import type { SignIn04Mode, SignIn04Props, SignIn04Status } from "./SignIn04.types";

/** Six boxes for the code from an authenticator app, checked as the last digit goes in, with a backup code as the way round. */
export function SignIn04({ title, description, onVerify, footer, labels = {}, className, ...props }: SignIn04Props) {
    const backupId = useId();
    const [mode, setMode] = useState<SignIn04Mode>("app");
    const [code, setCode] = useState("");
    const [backup, setBackup] = useState("");
    const [backupError, setBackupError] = useState("");
    const [trust, setTrust] = useState(false);
    const [status, setStatus] = useState<SignIn04Status>("idle");
    const otpRef = useRef<HTMLDivElement>(null);
    const shownMode = useRef(mode);

    // Start in the first box. preventScroll keeps a page that embeds this (in a frame, say) from jumping to it.
    useEffect(() => {
        otpRef.current?.querySelector("input")?.focus({ preventScroll: true });
    }, []);

    // After a wrong code, focus goes back to the last box (once it's enabled again) so the code can be fixed.
    useEffect(() => {
        if (status !== "wrong") return;
        const inputs = otpRef.current?.querySelectorAll("input");
        inputs?.[inputs.length - 1]?.focus();
    }, [status]);

    // Switching between the app and a backup code puts focus in the field that's now showing.
    useEffect(() => {
        if (shownMode.current === mode) return;
        shownMode.current = mode;
        if (mode === "backup") document.getElementById(backupId)?.focus();
        else otpRef.current?.querySelector("input")?.focus();
    }, [mode, backupId]);

    async function verify(value: string) {
        if (status === "checking") return;
        setStatus("checking");
        let right = true;
        try {
            right = (await onVerify?.({ code: value, method: mode, trust })) !== false;
        } catch {
            right = false;
        }
        // Leave a wrong code in place, so the person can see what they typed.
        setStatus(right ? "done" : "wrong");
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (mode === "app") {
            if (code.length === 6) void verify(code);
            return;
        }
        const cleaned = backup.trim().toLowerCase();
        if (!/^[a-z0-9]{4}-?[a-z0-9]{4}$/.test(cleaned)) {
            setBackupError(labels.backupInvalid ?? "Backup codes have 8 letters and numbers, like 4f7k-29xq.");
            document.getElementById(backupId)?.focus();
            return;
        }
        void verify(cleaned);
    }

    return (
        <main className={cx("ow-sign-in04", className)} {...props}>
            <div className="ow-sign-in04__inner">
                <Card padding="lg" className="ow-sign-in04__card">
                    {status === "done" ? (
                        <div className="ow-sign-in04__done" role="status">
                            <span className="ow-sign-in04__icon ow-sign-in04__icon--done" aria-hidden="true">
                                <CircleCheckIcon size={22} />
                            </span>
                            <Text variant="heading" as="h1" className="ow-sign-in04__title">
                                {labels.doneTitle ?? "You're in"}
                            </Text>
                            <Text variant="copy" className="ow-sign-in04__lead">
                                {labels.doneDescription ?? "Taking you to your workspace…"}
                            </Text>
                            <Spinner size="sm" label="" />
                        </div>
                    ) : (
                        <form noValidate onSubmit={submit} className="ow-sign-in04__form">
                            <span className="ow-sign-in04__icon" aria-hidden="true">
                                {mode === "app" ? <ShieldCheckIcon size={22} /> : <KeyRoundIcon size={22} />}
                            </span>
                            <Text variant="heading" as="h1" className="ow-sign-in04__title">
                                {mode === "app" ? title : (labels.backupTitle ?? "Use a backup code")}
                            </Text>
                            {mode === "app" && !description ? null : (
                                <Text variant="copy" className="ow-sign-in04__lead">
                                    {mode === "app"
                                        ? description
                                        : (labels.backupDescription ?? "Enter one of the codes you saved when you turned on two-factor. Each one works once.")}
                                </Text>
                            )}

                            {mode === "app" ? (
                                <div className="ow-sign-in04__code" ref={otpRef}>
                                    <InputOTP
                                        value={code}
                                        onChange={(value) => {
                                            setCode(value);
                                            if (status === "wrong") setStatus("idle");
                                        }}
                                        onComplete={(value) => void verify(value)}
                                        groupSize={3}
                                        isInvalid={status === "wrong"}
                                        disabled={status === "checking"}
                                        aria-label={labels.code ?? "Six-digit code"}
                                    />
                                    <Text
                                        variant="body"
                                        tone={status === "wrong" ? "danger" : "muted"}
                                        className="ow-sign-in04__message"
                                        role={status === "wrong" ? "alert" : undefined}
                                    >
                                        {status === "checking" ? (
                                            <>
                                                <Spinner size="sm" label="" /> {labels.checking ?? "Checking the code…"}
                                            </>
                                        ) : status === "wrong" ? (
                                            (labels.wrong ?? "That code didn't work. Codes change every 30 seconds, so try the newest one.")
                                        ) : (
                                            (labels.codeHint ?? "It's checked as soon as you type the last digit.")
                                        )}
                                    </Text>
                                </div>
                            ) : (
                                <div className="ow-sign-in04__backup">
                                    <Field label={labels.backupCode ?? "Backup code"} error={backupError}>
                                        <Input
                                            id={backupId}
                                            value={backup}
                                            onChange={(event) => {
                                                setBackup(event.target.value);
                                                setBackupError("");
                                            }}
                                            placeholder={labels.backupPlaceholder ?? "xxxx-xxxx"}
                                            autoComplete="one-time-code"
                                            spellCheck={false}
                                            className="ow-sign-in04__backup-input"
                                        />
                                    </Field>
                                </div>
                            )}

                            <Checkbox checked={trust} onChange={(event) => setTrust(event.target.checked)} className="ow-sign-in04__trust">
                                {labels.trust ?? "Don't ask again on this device for 30 days"}
                            </Checkbox>

                            <Button type="submit" variant="primary" fullWidth loading={status === "checking"} disabled={mode === "app" && code.length < 6}>
                                {labels.submit ?? "Verify"}
                            </Button>

                            <Button variant="ghost" size="sm" className="ow-sign-in04__switch" onClick={() => setMode(mode === "app" ? "backup" : "app")}>
                                {mode === "app" ? (labels.useBackup ?? "Use a backup code instead") : (labels.useApp ?? "Use your authenticator app")}
                            </Button>
                        </form>
                    )}
                </Card>

                {status === "done" || !footer ? null : (
                    <Text variant="copy" align="center" className="ow-sign-in04__foot">
                        {footer}
                    </Text>
                )}
            </div>
        </main>
    );
}
