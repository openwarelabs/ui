import { useEffect, useId, useRef, useState } from "react";

import { Badge, Button, buttonClassName, ChoiceCard, cx, Steps, Text, type ButtonVariant } from "@openwarelabs/ui";

import { CheckIcon } from "@blocks/shared/icons";
import type { BlockAction } from "@blocks/shared/shared.types";
import type { Onboarding02Props } from "./Onboarding02.types";

/** An action as a button of the default shape: a link styled as one when it has an href. */
function ActionButton({ action, variant, size, className }: { action: BlockAction; variant: ButtonVariant; size?: "sm" | "md"; className?: string }) {
    if (action.href !== undefined) {
        return (
            <a
                className={cx(buttonClassName({ variant, size }), className)}
                href={action.href}
                target={action.target}
                rel={action.target === "_blank" ? "noopener noreferrer" : undefined}
                aria-label={action["aria-label"]}
                onClick={action.onClick}
            >
                {action.startIcon ? <span className="ow-button__icon">{action.startIcon}</span> : null}
                {action.label}
                {action.endIcon ? <span className="ow-button__icon">{action.endIcon}</span> : null}
            </a>
        );
    }
    return (
        <Button
            className={className}
            variant={variant}
            size={size}
            startIcon={action.startIcon}
            endIcon={action.endIcon}
            aria-label={action["aria-label"]}
            onClick={action.onClick}
        >
            {action.label}
        </Button>
    );
}

/** A setup screen: the brand and progress along the top, two or three ChoiceCards for how to start, each opening a short page of its own. */
export function Onboarding02({
    brand,
    progress,
    skip,
    title,
    description,
    choices,
    note,
    doneTitle,
    doneDescription,
    doneAction,
    onFinish,
    labels = {},
    className,
    ...props
}: Onboarding02Props) {
    // The choice whose page is open, or "" for the choice itself.
    const [view, setView] = useState("");
    const [made, setMade] = useState<string | null>(null);
    const titleId = useId();
    const recommendedId = useId();
    const moved = useRef(false);

    // Each view replaces the last, so move focus to its heading for screen readers and keyboards.
    useEffect(() => {
        if (moved.current) document.getElementById(titleId)?.focus();
    }, [view, made, titleId]);

    const go = (next: string, name: string | null = null) => {
        moved.current = true;
        setView(next);
        setMade(name);
    };
    const back = () => go("");
    const done = made !== null;
    const choice = choices.find((entry) => entry.id === view);

    const heading = done ? (doneTitle ? doneTitle(made) : `${made} is ready`) : choice ? choice.heading : title;
    const lead = done ? doneDescription : choice ? choice.lead : description;

    return (
        <div className={cx("ow-onboarding02", className)} {...props}>
            <header className="ow-onboarding02__top">
                <Text variant="card-title" as="span" className="ow-onboarding02__brand">
                    {brand.logo}
                    {brand.name}
                </Text>
                {progress ? (
                    <Steps
                        className="ow-onboarding02__progress"
                        orientation="horizontal"
                        label={labels.progress ?? "Setup"}
                        current={done ? progress.current + 1 : progress.current}
                        items={progress.steps.map((step) => ({ title: step }))}
                    />
                ) : null}
                {skip ? <ActionButton action={skip} variant="ghost" size="sm" className="ow-onboarding02__skip" /> : null}
            </header>

            <main className="ow-onboarding02__body">
                {done ? (
                    <span className="ow-onboarding02__done-icon" aria-hidden="true">
                        <CheckIcon size={22} />
                    </span>
                ) : null}
                <Text variant="heading" as="h2" id={titleId} tabIndex={-1} className="ow-onboarding02__title">
                    {heading}
                </Text>
                {lead ? (
                    <Text variant="copy" className="ow-onboarding02__lead">
                        {lead}
                    </Text>
                ) : null}

                <div className="ow-onboarding02__content">
                    {done ? (
                        <div className="ow-onboarding02__done-actions">
                            {doneAction ? <ActionButton action={doneAction} variant="primary" /> : null}
                            <Button variant="ghost" onClick={back}>
                                {labels.startAgain ?? "Start again"}
                            </Button>
                        </div>
                    ) : choice ? (
                        choice.render({
                            back,
                            finish: (name) => {
                                go(choice.id, name);
                                onFinish?.(choice.id, name);
                            },
                        })
                    ) : (
                        <>
                            <div className="ow-onboarding02__options">
                                {choices.map((entry) => (
                                    <div key={entry.id} className="ow-onboarding02__option">
                                        <ChoiceCard
                                            icon={entry.icon}
                                            title={entry.title}
                                            description={entry.description}
                                            recommended={entry.recommended}
                                            aria-describedby={entry.recommended ? recommendedId : undefined}
                                            onClick={() => go(entry.id)}
                                        />
                                        {entry.recommended ? (
                                            <Badge id={recommendedId} className="ow-onboarding02__recommended" size="sm" variant="active">
                                                {labels.recommended ?? "Recommended"}
                                            </Badge>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            {note ? (
                                <Text variant="copy" className="ow-onboarding02__note">
                                    {note}
                                </Text>
                            ) : null}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
