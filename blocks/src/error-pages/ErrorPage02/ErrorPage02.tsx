import { useState } from "react";

import { Badge, Button, CopyButton, cx, Link, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { RotateCwIcon } from "@blocks/shared/icons";
import type { ErrorPage02Props } from "./ErrorPage02.types";

const reload = () => window.location.reload();

/** A 500: that it isn't their fault, a button to try again, and an error ID to send to support. */
export function ErrorPage02({
    brand,
    statusLink,
    badge,
    title,
    description,
    onRetry = reload,
    homeAction,
    report,
    errorId,
    visual,
    labels = {},
    className,
    ...props
}: ErrorPage02Props) {
    const [retrying, setRetrying] = useState(false);
    const [tries, setTries] = useState(1);

    const tryAgain = async () => {
        setRetrying(true);
        try {
            await onRetry();
        } catch {
            // Still failing: the page stays, and counts the try.
        }
        setRetrying(false);
        setTries((count) => count + 1);
    };

    return (
        <div className={cx("ow-error-page02", className)} {...props}>
            <header className="ow-error-page02__bar">
                <Link href={brand.href} variant="standalone" className="ow-error-page02__logo" aria-label={labels.home}>
                    {brand.logo}
                    <Text variant="card-title" as="span">
                        {brand.name}
                    </Text>
                </Link>
                {statusLink ? (
                    <Link href={statusLink.href} variant="standalone" className="ow-error-page02__status-link">
                        <span className="ow-error-page02__status-dot" aria-hidden="true" />
                        {statusLink.label}
                    </Link>
                ) : null}
            </header>

            <main className="ow-error-page02__main">
                <div>
                    {badge ? (
                        <Badge size="sm" variant="danger">
                            {badge}
                        </Badge>
                    ) : null}
                    <Text variant="section-title" as="h1" className="ow-error-page02__title">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="lead" className="ow-error-page02__text">
                            {description}
                        </Text>
                    ) : null}
                    <div className="ow-error-page02__actions">
                        <Button variant="primary" startIcon={<RotateCwIcon size={16} />} loading={retrying} onClick={tryAgain}>
                            {retrying ? (labels.retrying ?? "Trying again…") : (labels.retry ?? "Try again")}
                        </Button>
                        {homeAction ? <BlockActionButton action={homeAction} variant="secondary" size="md" shape="rounded" /> : null}
                    </div>

                    {report || errorId ? (
                        <div className="ow-error-page02__report">
                            <Text variant="label" as="p">
                                {labels.reportTitle ?? "If it keeps happening"}
                            </Text>
                            {report ? (
                                <Text variant="copy" className="ow-error-page02__report-text">
                                    {report}
                                    {tries > 1 ? ` ${labels.tries ? labels.tries(tries) : `You've tried ${tries} times.`}` : ""}
                                </Text>
                            ) : null}
                            {errorId ? (
                                <div className="ow-error-page02__id">
                                    <Text variant="caption">{labels.errorId ?? "Error ID"}</Text>
                                    <Text variant="code" truncate className="ow-error-page02__id-value">
                                        {errorId}
                                    </Text>
                                    <CopyButton value={errorId} label={labels.copy ?? "Copy ID"} />
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {visual ? <div className="ow-error-page02__visual">{visual}</div> : null}
            </main>
        </div>
    );
}
