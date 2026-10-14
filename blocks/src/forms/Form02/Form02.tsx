import { useId, type FormEvent } from "react";

import { Button, Card, cx, Text } from "@openwarelabs/ui";

import type { Form02Props } from "./Form02.types";

/** Sections down the page, each one's title and purpose on the left and its fields on a card on the right, with Discard and Save at the end. */
export function Form02({ title, description, sections, dirty, onSubmit, onDiscard, submitting = false, labels = {}, className, ...props }: Form02Props) {
    const id = useId();

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit?.(event);
    };

    return (
        <div className={cx("ow-form02", className)} {...props}>
            <form className="ow-form02__inner" noValidate onSubmit={submit} aria-labelledby={`${id}-title`}>
                <header className="ow-form02__header">
                    <Text variant="heading" as="h1" id={`${id}-title`}>
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-form02__lead">
                            {description}
                        </Text>
                    ) : null}
                </header>

                {sections.map((section, index) => (
                    <section key={index} className="ow-form02__section" aria-labelledby={`${id}-section-${index}`}>
                        <div className="ow-form02__intro">
                            <Text variant="card-title" as="h2" id={`${id}-section-${index}`}>
                                {section.title}
                            </Text>
                            {section.description ? (
                                <Text variant="copy" className="ow-form02__section-text">
                                    {section.description}
                                </Text>
                            ) : null}
                        </div>
                        <Card padding="none" className="ow-form02__card">
                            <div className="ow-form02__fields">{section.content}</div>
                        </Card>
                    </section>
                ))}

                <div className="ow-form02__actions">
                    <Text variant="caption" as="p" className="ow-form02__status" aria-live="polite">
                        {dirty ? (labels.unsaved ?? "You have unsaved changes.") : (labels.saved ?? "Everything is saved.")}
                    </Text>
                    <Button type="button" disabled={!dirty || submitting} onClick={onDiscard}>
                        {labels.discard ?? "Discard"}
                    </Button>
                    <Button type="submit" variant="primary" disabled={!dirty} loading={submitting}>
                        {labels.save ?? "Save changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
