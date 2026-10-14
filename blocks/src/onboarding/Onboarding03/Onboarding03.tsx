import { useEffect, useRef, useState } from "react";

import { Button, cx, Dialog, Link, Text } from "@openwarelabs/ui";

import type { Onboarding03Props } from "./Onboarding03.types";

/** A short dialog for what's new: a picture, a few changes with their icons, and one button to carry on. */
export function Onboarding03({
    eyebrow,
    title,
    description,
    visual,
    changes,
    link,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    labels = {},
    className,
    ...props
}: Onboarding03Props) {
    const [openState, setOpenState] = useState(defaultOpen);
    const open = openProp ?? openState;
    const continueButton = useRef<HTMLButtonElement>(null);

    // The dialog focuses its first link as it opens; start on the button that carries on instead.
    useEffect(() => {
        if (!open) return;
        const frame = requestAnimationFrame(() => continueButton.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [open]);

    const close = () => {
        setOpenState(false);
        onOpenChange?.(false);
    };

    return (
        // Takes no room of its own: the dialog sits over the page it's placed in.
        <div className={cx("ow-onboarding03", className)} {...props}>
            <Dialog
                open={open}
                onClose={close}
                width={480}
                className="ow-onboarding03__dialog"
                title={
                    <>
                        {eyebrow ? (
                            <Text variant="caption" className="ow-onboarding03__eyebrow">
                                <span className="ow-onboarding03__eyebrow-dot" aria-hidden="true" />
                                {eyebrow}
                            </Text>
                        ) : null}
                        {title}
                    </>
                }
                description={description}
                actions={
                    <>
                        {link ? (
                            <Link href={link.href} variant="muted">
                                {link.label}
                            </Link>
                        ) : (
                            <span />
                        )}
                        <Button ref={continueButton} variant="primary" onClick={close}>
                            {labels.continue ?? "Continue"}
                        </Button>
                    </>
                }
            >
                {visual}
                <ul className="ow-onboarding03__changes">
                    {changes.map((change, index) => (
                        <li key={index} className="ow-onboarding03__change">
                            {change.icon ? (
                                <span className="ow-onboarding03__change-icon" aria-hidden="true">
                                    {change.icon}
                                </span>
                            ) : null}
                            <span className="ow-onboarding03__change-text">
                                <Text variant="label">{change.title}</Text>
                                {change.description ? (
                                    <Text variant="copy" as="span">
                                        {change.description}
                                    </Text>
                                ) : null}
                            </span>
                        </li>
                    ))}
                </ul>
            </Dialog>
        </div>
    );
}
