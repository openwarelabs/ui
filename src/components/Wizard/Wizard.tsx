import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/Button/Button";
import { Form, FormError } from "@/components/Form/Form";
import { Steps, type StepItem } from "@/components/Steps/Steps";
import { useControllableState } from "@/hooks/useControllableState";
import { cx } from "@/utils/cx";

import type { WizardErrors, WizardLabels, WizardProps, WizardStep, WizardStepContext, WizardValues } from "./Wizard.types";

export type { WizardErrors, WizardLabels, WizardProps, WizardStep, WizardStepContext, WizardValues } from "./Wizard.types";

const defaultLabels: Required<WizardLabels> = {
    back: "Back",
    next: "Next",
    finish: "Finish",
    skip: "Skip",
    progress: (current, total) => `Step ${current} of ${total}`,
    optional: "Optional",
};

const empty: WizardValues = {};

/** What's saved under `persist`. */
interface Saved {
    step?: number;
    values?: WizardValues;
    completed?: string[];
}

/** The step's values take the place of what was saved under the same names, so an unticked box doesn't keep its old value. */
function merge(previous: WizardValues, form: HTMLFormElement | null, fresh: WizardValues): WizardValues {
    const next = { ...previous };
    if (form) {
        for (const element of Array.from(form.elements)) {
            const name = (element as HTMLInputElement).name;
            if (name) delete next[name];
        }
    }
    return { ...next, ...fresh };
}

/** The form's values as a Form would send them: each name once, or as a string[] when it repeats. */
function valuesOf(form: HTMLFormElement): WizardValues {
    const values: WizardValues = {};
    new FormData(form).forEach((value, name) => {
        if (typeof value !== "string") return;
        const existing = values[name];
        values[name] = existing === undefined ? value : [...(Array.isArray(existing) ? existing : [existing]), value];
    });
    return values;
}

function onlyMessages(errors: WizardErrors | void | undefined): WizardErrors {
    const found: WizardErrors = {};
    for (const [name, message] of Object.entries(errors ?? {})) if (message) found[name] = message;
    return found;
}

/**
 * A form in pages. Each step is a Form of its own: Next runs the browser's checks, then the step's `validate`, shows
 * each message under its field and only then moves on; the last step's Next is Finish and calls `onComplete` with
 * every step's values. A Steps strip shows where you are, and Back keeps what was typed.
 */
export function Wizard({
    steps,
    value,
    defaultValue,
    onChange,
    step: stepProp,
    defaultStep = 0,
    onStepChange,
    onComplete,
    orientation = "horizontal",
    linear = true,
    persist,
    headingLevel = 2,
    label = "Steps",
    labels: labelsProp,
    children,
    className,
}: WizardProps) {
    const labels = { ...defaultLabels, ...labelsProp };
    const [values, setValues] = useControllableState<WizardValues>(value, defaultValue ?? empty, onChange);
    const [stepIndex, setStepIndex] = useControllableState<number>(stepProp, defaultStep, onStepChange);
    const [completed, setCompleted] = useState<ReadonlySet<string>>(() => new Set());
    const [stepErrors, setStepErrors] = useState<WizardErrors>({});
    const [busy, setBusy] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const [restored, setRestored] = useState(!persist);
    const formRef = useRef<HTMLFormElement | null>(null);
    const headingRef = useRef<HTMLHeadingElement | null>(null);
    const skipRef = useRef<HTMLButtonElement | null>(null);
    const skipping = useRef(false);
    const quiet = useRef(true);
    const mounted = useRef(true);
    const valuesRef = useRef(values);
    valuesRef.current = values;

    const count = steps.length;
    const index = Math.min(Math.max(stepIndex, 0), Math.max(count - 1, 0));
    const step = steps[index];
    const last = index === count - 1;
    const Heading = `h${headingLevel}` as "h2";

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // Come back to where a reload left off.
    useEffect(() => {
        if (!persist) return;
        try {
            const raw = window.sessionStorage.getItem(persist);
            const saved: Saved = raw ? (JSON.parse(raw) as Saved) : {};
            if (saved.values) setValues(saved.values);
            if (saved.completed) setCompleted(new Set(saved.completed));
            if (typeof saved.step === "number") setStepIndex(saved.step);
        } catch {
            // Storage is off, or holds something else: start afresh.
        }
        setRestored(true);
    }, [persist, setValues, setStepIndex]);

    useEffect(() => {
        if (!persist || !restored) return;
        try {
            const saved: Saved = { step: index, values, completed: [...completed] };
            window.sessionStorage.setItem(persist, JSON.stringify(saved));
        } catch {
            // Nothing to do when storage is off.
        }
    }, [persist, restored, index, values, completed]);

    // A new step takes focus at its heading and is read out, except the one shown at first.
    const seen = useRef(index);
    useEffect(() => {
        if (seen.current === index) return;
        seen.current = index;
        if (quiet.current) {
            quiet.current = false;
            return;
        }
        headingRef.current?.focus();
        if (step) setAnnouncement(`${labels.progress(index + 1, count)}: ${step.title}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per step change.
    }, [index]);
    useEffect(() => {
        // Restoring a saved step is not a change the person made; moving after that is.
        if (restored) quiet.current = false;
    }, [restored]);

    /** Takes what's typed in the current step along, without checking it. */
    const leave = useCallback(() => {
        const form = formRef.current;
        if (!form) return valuesRef.current;
        const next = merge(valuesRef.current, form, valuesOf(form));
        setValues(next);
        return next;
    }, [setValues]);

    const canJump = useCallback((target: number) => target >= 0 && target < count && target !== index && (!linear || target < index), [count, index, linear]);

    const goTo = useCallback(
        (target: number) => {
            if (busy || !canJump(target)) return;
            leave();
            setStepErrors({});
            setStepIndex(target);
        },
        [busy, canJump, leave, setStepIndex],
    );

    const back = useCallback(() => goTo(index - 1), [goTo, index]);
    const next = useCallback(() => formRef.current?.requestSubmit(), []);
    const skip = useCallback(() => {
        if (!step?.optional || !skipRef.current) return;
        skipping.current = true;
        formRef.current?.requestSubmit(skipRef.current);
    }, [step]);

    async function handleSubmit(fresh: WizardValues) {
        if (!step) return;
        const skipped = skipping.current;
        skipping.current = false;
        const merged = merge(valuesRef.current, formRef.current, fresh);
        setValues(merged);
        setBusy(true);
        try {
            if (!skipped) {
                const errors = onlyMessages(await step.validate?.(merged));
                if (Object.keys(errors).length) {
                    setStepErrors(errors);
                    return;
                }
            }
            setStepErrors({});
            setCompleted((previous) => new Set([...previous, step.id]));
            if (last) {
                await onComplete(merged);
                if (persist) {
                    try {
                        window.sessionStorage.removeItem(persist);
                    } catch {
                        // Nothing to clear.
                    }
                }
            } else {
                setStepIndex(index + 1);
            }
        } finally {
            if (mounted.current) setBusy(false);
        }
    }

    const items = useMemo<StepItem[]>(
        () =>
            steps.map((item, position) => ({
                title: canJump(position) ? (
                    <button type="button" className="ow-wizard__jump" onClick={() => goTo(position)} disabled={busy}>
                        {item.title}
                    </button>
                ) : (
                    item.title
                ),
                description: item.description ?? (item.optional ? labels.optional : undefined),
                status: position === index ? "current" : completed.has(item.id) ? "done" : "upcoming",
            })),
        [steps, canJump, goTo, busy, labels.optional, index, completed],
    );

    if (!step) return null;

    const progress = labels.progress(index + 1, count);

    return (
        <div className={cx("ow-wizard", `ow-wizard--${orientation}`, className)}>
            <Steps className="ow-wizard__steps" orientation={orientation} items={items} current={index} label={label} />
            <div className="ow-wizard__panel">
                <header className="ow-wizard__header">
                    <span className="ow-wizard__progress">{progress}</span>
                    <Heading ref={headingRef} tabIndex={-1} className="ow-wizard__title">
                        {step.title}
                    </Heading>
                    {step.description ? <p className="ow-wizard__description">{step.description}</p> : null}
                </header>
                <Form key={step.id} ref={formRef} className="ow-wizard__form" validationErrors={stepErrors} onSubmit={handleSubmit}>
                    {({ errors }) => {
                        const context: WizardStepContext = {
                            step,
                            index,
                            count,
                            values,
                            setValues,
                            next,
                            back,
                            skip,
                            goTo,
                            errors,
                            submitting: busy,
                        };
                        const content: ReactNode = step.render ? step.render(context) : children?.(context);
                        return (
                            <>
                                {content}
                                <FormError />
                                <div className="ow-wizard__actions">
                                    {index > 0 ? (
                                        <Button type="button" variant="secondary" onClick={back} disabled={busy}>
                                            {labels.back}
                                        </Button>
                                    ) : null}
                                    <div className="ow-wizard__forward">
                                        {step.optional ? (
                                            <Button
                                                ref={skipRef}
                                                type="submit"
                                                variant="ghost"
                                                formNoValidate
                                                disabled={busy}
                                                onClick={() => {
                                                    skipping.current = true;
                                                }}
                                            >
                                                {labels.skip}
                                            </Button>
                                        ) : null}
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={busy}
                                            onClick={() => {
                                                skipping.current = false;
                                            }}
                                        >
                                            {last ? labels.finish : labels.next}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        );
                    }}
                </Form>
            </div>
            <div className="ow-visually-hidden" aria-live="polite" aria-atomic="true">
                {announcement}
            </div>
        </div>
    );
}
