import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { cx } from "../../utils/cx";

export interface InputOTPProps {
    /** How many characters the code has.
     * @default 6 */
    length?: number;
    value?: string;
    /** @default "" */
    defaultValue?: string;
    onChange?(value: string): void;
    /** Called once every box is filled. */
    onComplete?(value: string): void;
    /** `numeric` accepts digits only; `alphanumeric` letters and digits (shown upper case).
     * @default "numeric" */
    type?: "numeric" | "alphanumeric";
    /** Splits the boxes into groups with a dash between, e.g. 3 for "123–456". */
    groupSize?: number;
    /** @default false */
    isInvalid?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    /** Names the code for screen readers.
     * @default "Verification code" */
    "aria-label"?: string;
    /** The form field name; a hidden input carries the whole code. */
    name?: string;
    className?: string;
}

/**
 * A one-time code in separate boxes. Typing moves forward, Backspace moves back,
 * and pasting a code fills every box. The browser can fill it from a text message.
 */
export function InputOTP({
    length = 6,
    value,
    defaultValue = "",
    onChange,
    onComplete,
    type = "numeric",
    groupSize,
    isInvalid = false,
    disabled,
    autoFocus,
    "aria-label": ariaLabel = "Verification code",
    name,
    className,
}: InputOTPProps) {
    const [code, setCode] = useControllableState(value, defaultValue, onChange);
    const refs = useRef<Array<HTMLInputElement | null>>([]);
    // The code as of the last change, read by handlers that run before React renders it,
    // such as the next box's onFocus when typing moves focus forward.
    const latest = useRef(code);
    latest.current = code;
    const allowed = type === "numeric" ? /\d/ : /[a-z0-9]/i;
    const clean = (text: string) => [...text].filter((char) => allowed.test(char)).join("").toUpperCase();
    const chars = Array.from({ length }, (_, index) => code[index] ?? "");

    function update(next: string, focusIndex: number) {
        const trimmed = next.slice(0, length);
        latest.current = trimmed;
        setCode(trimmed);
        refs.current[Math.min(focusIndex, length - 1)]?.focus();
        if (trimmed.length === length && !trimmed.includes(" ")) onComplete?.(trimmed);
    }

    function setAt(index: number, char: string) {
        const next = chars.map((existing, i) => (i === index ? char : existing));
        // Keep the code contiguous: an empty box ends it.
        const firstGap = next.indexOf("");
        return (firstGap === -1 ? next : next.slice(0, firstGap)).join("");
    }

    function onInput(index: number, text: string) {
        const typed = clean(text);
        if (!typed) return;
        if (typed.length > 1) {
            // Autofill or a paste into one box.
            update(chars.slice(0, index).join("") + typed, index + typed.length);
            return;
        }
        update(setAt(index, typed), index + 1);
    }

    function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Backspace") {
            event.preventDefault();
            // Removes one character; the ones after it move back a box.
            if (chars[index]) update(code.slice(0, index) + code.slice(index + 1), index);
            else if (index > 0) update(code.slice(0, index - 1) + code.slice(index), index - 1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            refs.current[Math.max(0, index - 1)]?.focus();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            refs.current[Math.min(length - 1, index + 1, code.length)]?.focus();
        }
    }

    function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();
        const pasted = clean(event.clipboardData.getData("text"));
        if (pasted) update(chars.slice(0, index).join("") + pasted, index + pasted.length);
    }

    return (
        <div role="group" aria-label={ariaLabel} className={cx("ow-otp", isInvalid && "ow-otp--invalid", className)}>
            {chars.map((char, index) => (
                <span key={index} className="ow-otp__slot">
                    {groupSize && index > 0 && index % groupSize === 0 ? (
                        <span className="ow-otp__separator" aria-hidden="true" />
                    ) : null}
                    <input
                        ref={(element) => {
                            refs.current[index] = element;
                        }}
                        className="ow-otp__input"
                        type="text"
                        inputMode={type === "numeric" ? "numeric" : "text"}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        autoCapitalize="characters"
                        maxLength={length}
                        aria-label={`Character ${index + 1} of ${length}`}
                        aria-invalid={isInvalid || undefined}
                        disabled={disabled}
                        autoFocus={autoFocus && index === 0}
                        value={char}
                        // Clicking an empty box past the end goes to the next one to fill.
                        onFocus={(event) => {
                            const filled = latest.current.length;
                            if (index > filled) refs.current[filled]?.focus();
                            else event.target.select();
                        }}
                        onChange={(event) => onInput(index, event.target.value.replace(char, "") || event.target.value)}
                        onKeyDown={(event) => onKeyDown(index, event)}
                        onPaste={(event) => onPaste(index, event)}
                    />
                </span>
            ))}
            {name ? <input type="hidden" name={name} value={code} /> : null}
        </div>
    );
}
