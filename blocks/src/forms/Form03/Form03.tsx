import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button, cx, Steps, Text } from "@openwarelabs/ui";

import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@blocks/shared/icons";
import type { Form03Props } from "./Form03.types";

/** A longer form split into steps on one card: the progress at the top, one step's fields in the middle, Back and Continue at the bottom. */
export function Form03({ title, description, steps, submitLabel, onSubmit, onStepChange, labels = {}, className, ...props }: Form03Props) {
    const id = useId();
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const shownStep = useRef(step);

    const last = steps.length - 1;
    const current = steps[step];

    // After moving between steps, put focus on the new step's heading so it's read out. Not on first load.
    useEffect(() => {
        if (shownStep.current === step) return;
        shownStep.current = step;
        document.getElementById(`${id}-step`)?.focus();
    }, [step, id]);

    function goTo(next: number) {
        setStep(next);
        onStepChange?.(next);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving || current?.validate?.() === false) return;
        if (step < last) {
            goTo(step + 1);
            return;
        }
        setSaving(true);
        try {
            await onSubmit?.();
            goTo(0);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={cx("ow-form03", className)} {...props}>
            <form className="ow-form03__card" noValidate onSubmit={submit} aria-labelledby={`${id}-title`}>
                <header className="ow-form03__header">
                    <Text variant="heading" as="h1" id={`${id}-title`}>
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-form03__lead">
                            {description}
                        </Text>
                    ) : null}
                    <Steps
                        items={steps.map((entry) => ({ title: entry.title, description: entry.description }))}
                        current={step}
                        orientation="horizontal"
                        label={labels.progress ?? "Progress"}
                        className="ow-form03__progress"
                    />
                </header>

                <div className="ow-form03__body">
                    <Text variant="card-title" as="h2" id={`${id}-step`} tabIndex={-1} className="ow-form03__step-title">
                        <Text variant="caption">
                            {labels.stepOf ? (
                                labels.stepOf(step + 1, steps.length)
                            ) : (
                                <>
                                    Step {step + 1} of {steps.length}
                                </>
                            )}
                        </Text>
                        {current?.heading}
                    </Text>

                    {current?.content ? <div className="ow-form03__fields">{current.content}</div> : null}

                    {current?.review ? (
                        <dl className="ow-form03__review">
                            {current.review.map((row) => (
                                <div key={row.label} className="ow-form03__review-row">
                                    <Text as="dt" variant="caption" className="ow-form03__review-label">
                                        {row.label}
                                    </Text>
                                    <Text as="dd" className="ow-form03__review-value">
                                        {row.value}
                                    </Text>
                                    <dd className="ow-form03__review-edit">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => goTo(row.step)}
                                            aria-label={labels.editLabel?.(row.label) ?? `Edit ${row.label.toLowerCase()}`}
                                        >
                                            {labels.edit ?? "Edit"}
                                        </Button>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}
                </div>

                <div className="ow-form03__footer">
                    {step > 0 ? (
                        <Button type="button" startIcon={<ArrowLeftIcon size={16} />} onClick={() => goTo(step - 1)} disabled={saving}>
                            {labels.back ?? "Back"}
                        </Button>
                    ) : (
                        <span />
                    )}
                    {step < last ? (
                        <Button type="submit" variant="primary" endIcon={<ArrowRightIcon size={16} />}>
                            {labels.continue ?? "Continue"}
                        </Button>
                    ) : (
                        <Button type="submit" variant="primary" startIcon={<CheckIcon size={16} />} loading={saving}>
                            {submitLabel}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
