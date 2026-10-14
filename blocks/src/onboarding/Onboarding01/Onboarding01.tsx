import { useEffect, useId, useRef, useState } from "react";

import { Button, buttonClassName, cx, ProgressBar, Steps, Text, type StepItem } from "@openwarelabs/ui";

import { RotateCcwIcon } from "@blocks/shared/icons";
import type { Onboarding01Props } from "./Onboarding01.types";

/** A first-run checklist on a panel: what it's for and the progress on the left, the steps on the right with the current one's action beside it. */
export function Onboarding01({
    eyebrow,
    title,
    description,
    finishedTitle,
    finishedDescription,
    steps,
    stepsTitle,
    defaultCompleted = 0,
    onStepComplete,
    help,
    finishedAction,
    labels = {},
    className,
    ...props
}: Onboarding01Props) {
    const titleId = useId();
    const [current, setCurrent] = useState(defaultCompleted);
    const [working, setWorking] = useState(false);
    const nextAction = useRef<HTMLElement | null>(null);
    const moved = useRef(false);

    const finished = current >= steps.length;

    // The finished step's button goes away; keep the keyboard on the next one.
    useEffect(() => {
        if (moved.current) nextAction.current?.focus();
        moved.current = false;
    }, [current]);

    async function complete(index: number) {
        setWorking(true);
        try {
            await steps[index]?.onAction?.();
        } catch {
            return;
        } finally {
            setWorking(false);
        }
        moved.current = true;
        setCurrent(index + 1);
        onStepComplete?.(index);
    }

    const keepRef = (node: HTMLElement | null) => {
        nextAction.current = node;
    };

    // Steps shows each step's button only while it's the current one, so only that one ever renders.
    const items: StepItem[] = steps.map((step, index) => ({
        title: step.title,
        description: step.description,
        action: (
            <Button ref={keepRef} size="sm" variant="primary" loading={working} onClick={() => void complete(index)}>
                {step.actionLabel}
            </Button>
        ),
    }));

    const heading = finished ? (finishedTitle ?? title) : title;
    const lead = finished ? (finishedDescription ?? description) : description;

    return (
        <section className={cx("ow-onboarding01", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-onboarding01__panel">
                <div className="ow-onboarding01__intro">
                    {eyebrow ? (
                        <Text variant="caption" as="p" className="ow-onboarding01__eyebrow">
                            <span className="ow-onboarding01__dot" aria-hidden="true" />
                            {eyebrow}
                        </Text>
                    ) : null}
                    <Text variant="heading" as="h2" id={titleId} className="ow-onboarding01__title">
                        {heading}
                    </Text>
                    {lead ? (
                        <Text variant="copy" className="ow-onboarding01__lead">
                            {lead}
                        </Text>
                    ) : null}

                    <ProgressBar
                        className="ow-onboarding01__progress"
                        label={labels.progress ?? "Setup"}
                        value={current}
                        max={steps.length}
                        valueLabel={`${Math.round((current / steps.length) * 100)}%`}
                    />

                    {finished ? (
                        <div className="ow-onboarding01__actions">
                            {finishedAction ? (
                                finishedAction.href !== undefined ? (
                                    <a
                                        ref={keepRef}
                                        className={buttonClassName({ variant: "primary" })}
                                        href={finishedAction.href}
                                        target={finishedAction.target}
                                        rel={finishedAction.target === "_blank" ? "noopener noreferrer" : undefined}
                                        aria-label={finishedAction["aria-label"]}
                                        onClick={finishedAction.onClick}
                                    >
                                        {finishedAction.startIcon ? <span className="ow-button__icon">{finishedAction.startIcon}</span> : null}
                                        {finishedAction.label}
                                        {finishedAction.endIcon ? <span className="ow-button__icon">{finishedAction.endIcon}</span> : null}
                                    </a>
                                ) : (
                                    <Button
                                        ref={keepRef}
                                        variant="primary"
                                        startIcon={finishedAction.startIcon}
                                        endIcon={finishedAction.endIcon}
                                        aria-label={finishedAction["aria-label"]}
                                        onClick={finishedAction.onClick}
                                    >
                                        {finishedAction.label}
                                    </Button>
                                )
                            ) : null}
                            <Button variant="ghost" startIcon={<RotateCcwIcon size={16} />} onClick={() => setCurrent(defaultCompleted)}>
                                {labels.restart ?? "Run setup again"}
                            </Button>
                        </div>
                    ) : help ? (
                        <Text variant="copy" className="ow-onboarding01__help">
                            {help}
                        </Text>
                    ) : null}
                </div>

                <Steps className="ow-onboarding01__steps" title={stepsTitle} current={current} items={items} />
            </div>
        </section>
    );
}
