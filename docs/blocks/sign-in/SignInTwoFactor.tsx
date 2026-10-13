import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, Card, Checkbox, cx, Field, Input, InputOTP, Link, linkClassName, Spinner, toast } from "@openwarelabs/ui";
import { CircleCheck, KeyRound, ShieldCheck } from "lucide-react";

import "./SignInTwoFactor.css";

type Mode = "app" | "backup";
type Status = "idle" | "checking" | "wrong" | "done";

// In this sample any code works except 000000, which shows what a wrong code looks like.
function checkCode(code: string) {
    return new Promise<boolean>((resolve) => window.setTimeout(() => resolve(code !== "000000"), 700));
}

export function SignInTwoFactor() {
    const backupId = useId();
    const [mode, setMode] = useState<Mode>("app");
    const [code, setCode] = useState("");
    const [backup, setBackup] = useState("");
    const [backupError, setBackupError] = useState("");
    const [trust, setTrust] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
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
        if (await checkCode(value)) {
            setStatus("done");
            toast.success("Signed in", { description: trust ? "We won't ask for a code on this device for 30 days." : undefined });
            return;
        }
        // Leave the code in place, so the person can see what they typed.
        setStatus("wrong");
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (mode === "app") {
            if (code.length === 6) void verify(code);
            return;
        }
        const cleaned = backup.trim().toLowerCase();
        if (!/^[a-z0-9]{4}-?[a-z0-9]{4}$/.test(cleaned)) {
            setBackupError("Backup codes have 8 letters and numbers, like 4f7k-29xq.");
            document.getElementById(backupId)?.focus();
            return;
        }
        void verify(cleaned);
    }

    return (
        <main className="sign-in-two-factor">
            <div className="sign-in-two-factor__inner">
                <Card padding="lg" className="sign-in-two-factor__card">
                    {status === "done" ? (
                        <div className="sign-in-two-factor__done" role="status">
                            <span className="sign-in-two-factor__icon sign-in-two-factor__icon--done" aria-hidden="true">
                                <CircleCheck size={22} />
                            </span>
                            <h1 className="sign-in-two-factor__title">You're in</h1>
                            <p className="sign-in-two-factor__lead">Taking you to your workspace…</p>
                            <Spinner size="sm" label="" />
                        </div>
                    ) : (
                        <form noValidate onSubmit={submit} className="sign-in-two-factor__form">
                            <span className="sign-in-two-factor__icon" aria-hidden="true">
                                {mode === "app" ? <ShieldCheck size={22} /> : <KeyRound size={22} />}
                            </span>
                            <h1 className="sign-in-two-factor__title">{mode === "app" ? "Enter your code" : "Use a backup code"}</h1>
                            <p className="sign-in-two-factor__lead">
                                {mode === "app"
                                    ? "Open your authenticator app and enter the six-digit code for Acme."
                                    : "Enter one of the codes you saved when you turned on two-factor. Each one works once."}
                            </p>

                            {mode === "app" ? (
                                <div className="sign-in-two-factor__code" ref={otpRef}>
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
                                        aria-label="Six-digit code"
                                    />
                                    <p className="sign-in-two-factor__message" role={status === "wrong" ? "alert" : undefined} data-tone={status}>
                                        {status === "checking" ? (
                                            <>
                                                <Spinner size="sm" label="" /> Checking the code…
                                            </>
                                        ) : status === "wrong" ? (
                                            "That code didn't work. Codes change every 30 seconds, so try the newest one."
                                        ) : (
                                            "It's checked as soon as you type the last digit."
                                        )}
                                    </p>
                                </div>
                            ) : (
                                <div className="sign-in-two-factor__backup">
                                    <Field label="Backup code" error={backupError}>
                                        <Input
                                            id={backupId}
                                            value={backup}
                                            onChange={(event) => {
                                                setBackup(event.target.value);
                                                setBackupError("");
                                            }}
                                            placeholder="xxxx-xxxx"
                                            autoComplete="one-time-code"
                                            spellCheck={false}
                                            className="sign-in-two-factor__backup-input"
                                        />
                                    </Field>
                                </div>
                            )}

                            <Checkbox checked={trust} onChange={(event) => setTrust(event.target.checked)} className="sign-in-two-factor__trust">
                                Don't ask again on this device for 30 days
                            </Checkbox>

                            <Button type="submit" variant="primary" fullWidth loading={status === "checking"} disabled={mode === "app" && code.length < 6}>
                                Verify
                            </Button>

                            <button
                                type="button"
                                className={cx(linkClassName({ variant: "muted" }), "sign-in-two-factor__switch")}
                                onClick={() => setMode(mode === "app" ? "backup" : "app")}
                            >
                                {mode === "app" ? "Use a backup code instead" : "Use your authenticator app"}
                            </button>
                        </form>
                    )}
                </Card>

                {status === "done" ? null : (
                    <p className="sign-in-two-factor__foot">
                        Signing in as maya@example.com. <Link href="#">Not you?</Link>
                    </p>
                )}
            </div>
        </main>
    );
}
