import { useId, type FormEvent } from "react";

import { Button, cx, Link, Text } from "@openwarelabs/ui";

import { ArrowLeftIcon } from "@blocks/shared/icons";
import type { Form01Props } from "./Form01.types";

/** One column on the canvas: a back link, the page's heading, then the fields on a card with the action in its footer. */
export function Form01({ title, description, backLink, children, submitLabel, onSubmit, submitting = false, note, className, ...props }: Form01Props) {
    const titleId = useId();

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit?.(event);
    };

    return (
        <div className={cx("ow-form01", className)} {...props}>
            <div className="ow-form01__inner">
                {backLink ? (
                    <Link href={backLink.href} variant="standalone" className="ow-form01__back">
                        <ArrowLeftIcon size={15} />
                        {backLink.label}
                    </Link>
                ) : null}
                <header className="ow-form01__header">
                    <Text variant="heading" as="h1" id={titleId}>
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="copy" className="ow-form01__lead">
                            {description}
                        </Text>
                    ) : null}
                </header>

                <form className="ow-form01__card" noValidate onSubmit={submit} aria-labelledby={titleId}>
                    <div className="ow-form01__fields">{children}</div>

                    <div className="ow-form01__footer">
                        {note ? (
                            <Text variant="caption" as="p" className="ow-form01__note">
                                {note}
                            </Text>
                        ) : (
                            <span />
                        )}
                        <Button type="submit" variant="primary" loading={submitting}>
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
