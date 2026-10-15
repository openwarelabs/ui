import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";

import { Input } from "@/components/Input/Input";
import { Meter } from "@/components/Meter/Meter";
import type { ProgressTone } from "@/components/Progress/Progress";
import { useControllableState } from "@/hooks/useControllableState";
import { CheckIcon, EyeIcon, EyeOffIcon } from "@/icons";
import { cx } from "@/utils/cx";
import type { PasswordInputProps } from "./PasswordInput.types";
import { passwordStrength, strengthLabels } from "./passwordStrength";

export { passwordStrength } from "./passwordStrength";
export type { PasswordInputProps, PasswordRequirement, PasswordStrength, PasswordStrengthScorer } from "./PasswordInput.types";

/** Very weak and weak are bad, fair is middling, good and strong are fine. */
const toneOf = (score: number): ProgressTone => (score >= 3 ? "success" : score === 2 ? "warning" : "danger");

/**
 * A password field with a button that shows and hides what's typed. It can also show how strong the password is, and a
 * checklist of rules that tick as they're met. Every Input prop passes through, and the ref is the input's; `className`
 * goes on the wrapper around the field and what's under it.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    {
        strength = false,
        strengthLabel = "Password strength",
        requirements,
        visible: visibleProp,
        defaultVisible = false,
        onVisibleChange,
        toggleLabel = "Show password",
        autoComplete = "current-password",
        className,
        size = "md",
        value,
        defaultValue,
        onChange,
        disabled,
        "aria-describedby": describedByProp,
        ...inputProps
    },
    ref,
) {
    const [visible, setVisible] = useControllableState(visibleProp, defaultVisible, onVisibleChange);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const id = useId();
    const strengthId = `${id}-strength`;
    const requirementsId = `${id}-requirements`;

    // The text, to score it and check the rules: the value when controlled, otherwise what's been typed.
    const [typed, setTyped] = useState(() => (defaultValue === undefined ? "" : String(defaultValue)));
    const text = value === undefined ? typed : String(value ?? "");

    const setRef = useCallback(
        (element: HTMLInputElement | null) => {
            inputRef.current = element;
            if (typeof ref === "function") ref(element);
            else if (ref) ref.current = element;
        },
        [ref],
    );

    // A form's reset puts the field back without an input event, so catch up after it.
    useEffect(() => {
        const form = inputRef.current?.form;
        if (!form) return;
        const onReset = () => setTimeout(() => setTyped(inputRef.current?.value ?? ""));
        form.addEventListener("reset", onReset);
        return () => form.removeEventListener("reset", onReset);
    }, []);

    // Changing the type can move the caret, so put the selection back where it was. Chrome can move it again on the
    // next frame (when React also rewrites the value attribute), so it's put back then too.
    const selection = useRef<[number | null, number | null, "forward" | "backward" | "none" | null] | null>(null);
    useLayoutEffect(() => {
        const input = inputRef.current;
        const saved = selection.current;
        selection.current = null;
        if (!input || !saved) return;
        const [start, end, direction] = saved;
        const restore = () => {
            if (input.ownerDocument.activeElement === input) input.setSelectionRange(start, end, direction ?? undefined);
        };
        restore();
        const frame = requestAnimationFrame(restore);
        return () => cancelAnimationFrame(frame);
    }, [visible]);

    function toggle() {
        const input = inputRef.current;
        if (input && input.ownerDocument.activeElement === input) {
            selection.current = [input.selectionStart, input.selectionEnd, input.selectionDirection];
        }
        setVisible(!visible);
    }

    // Clicking the button leaves focus (and the caret) in the field, so typing carries on.
    function keepFocus(event: MouseEvent<HTMLButtonElement>) {
        const input = inputRef.current;
        if (input && input.ownerDocument.activeElement === input) event.preventDefault();
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setTyped(event.target.value);
        onChange?.(event);
    }

    const scorer = typeof strength === "function" ? strength : strength ? passwordStrength : undefined;
    const rated = scorer && text ? scorer(text) : undefined;
    const score = rated ? rated.score : 0;
    const word = rated ? (rated.label ?? strengthLabels[score]) : undefined;
    const rules = requirements?.length ? requirements : undefined;

    const describedBy = [describedByProp, scorer ? strengthId : undefined, rules ? requirementsId : undefined].filter(Boolean).join(" ") || undefined;

    return (
        <div className={cx("ow-password-input", className)}>
            <Input
                ref={setRef}
                {...inputProps}
                type={visible ? "text" : "password"}
                size={size}
                autoComplete={autoComplete}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={value}
                defaultValue={defaultValue}
                onChange={handleChange}
                disabled={disabled}
                aria-describedby={describedBy}
                endContent={
                    <button
                        type="button"
                        className={cx("ow-password-input__toggle", size === "sm" && "ow-password-input__toggle--sm")}
                        aria-label={toggleLabel}
                        aria-pressed={visible}
                        disabled={disabled}
                        onMouseDown={keepFocus}
                        onClick={toggle}
                    >
                        {visible ? <EyeOffIcon size={size === "sm" ? 14 : 16} /> : <EyeIcon size={size === "sm" ? 14 : 16} />}
                    </button>
                }
            />
            {scorer ? (
                <div className={cx("ow-password-input__strength", rated && `ow-password-input__strength--${toneOf(score)}`)}>
                    <Meter
                        value={score}
                        min={0}
                        max={4}
                        segments={4}
                        showValue={false}
                        aria-label={strengthLabel}
                        valueLabel={word ?? "None"}
                        tone={rated ? toneOf(score) : "primary"}
                    />
                    <p id={strengthId} className="ow-password-input__strength-text" aria-live="polite">
                        {word ? (
                            <>
                                {strengthLabel}: <span className="ow-password-input__strength-word">{word}</span>
                            </>
                        ) : null}
                    </p>
                </div>
            ) : null}
            {rules ? (
                <ul id={requirementsId} className="ow-password-input__requirements">
                    {rules.map((rule, index) => {
                        const met = Boolean(text) && rule.test(text);
                        return (
                            <li key={index} className={cx("ow-password-input__requirement", met && "ow-password-input__requirement--met")}>
                                <span className="ow-password-input__mark" aria-hidden="true">
                                    {met ? <CheckIcon size={12} strokeWidth={3} /> : null}
                                </span>
                                <span>
                                    {rule.label}
                                    <span className="ow-visually-hidden">{met ? ", done" : ", not yet"}</span>
                                </span>
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
});
