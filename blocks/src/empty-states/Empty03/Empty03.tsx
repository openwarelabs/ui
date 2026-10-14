import { useId, useState } from "react";

import { Badge, Button, Code, cx, EmptyState, SegmentedControl, Spinner, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { CloudOffIcon, RotateCwIcon } from "@blocks/shared/icons";
import type { Empty03Props, Empty03Status } from "./Empty03.types";

/** A card whose list couldn't load: what went wrong, a button to try again, and the list once it comes back. */
export function Empty03({
    title,
    description,
    cardTitle,
    views,
    items,
    status,
    defaultStatus = "failed",
    onRetry,
    errorIcon,
    errorTitle,
    errorDescription,
    errorDetail,
    secondaryAction,
    labels = {},
    className,
    ...props
}: Empty03Props) {
    const id = useId();
    const [ownStatus, setOwnStatus] = useState<Empty03Status>(defaultStatus);
    const load = status ?? ownStatus;
    const [view, setView] = useState(views?.[0]?.value ?? "");

    const retry = async () => {
        setOwnStatus("loading");
        try {
            await onRetry?.();
            setOwnStatus("loaded");
        } catch {
            setOwnStatus("failed");
        }
    };

    const match = views?.find((entry) => entry.value === view)?.match;
    const shown = match ? items.filter(match) : items;

    return (
        <div className={cx("ow-empty03", className)} {...props}>
            <main className="ow-empty03__panel">
                <div className="ow-empty03__header">
                    <div>
                        <Text variant="heading" as="h2">
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-empty03__subtitle">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                </div>

                <section className="ow-empty03__card" aria-labelledby={id} aria-busy={load === "loading"}>
                    <div className="ow-empty03__card-head">
                        <Text variant="card-title" as="h3" id={id}>
                            {cardTitle}
                        </Text>
                        {views?.length ? (
                            <SegmentedControl
                                size="sm"
                                aria-label={labels.views ?? "Show"}
                                options={views.map(({ value, label }) => ({ value, label }))}
                                value={view}
                                onChange={setView}
                                disabled={load !== "loaded"}
                            />
                        ) : null}
                    </div>

                    <div className={cx("ow-empty03__body", load !== "loaded" && "ow-empty03__body--waiting")}>
                        {load === "failed" ? (
                            <EmptyState
                                icon={errorIcon ?? <CloudOffIcon size={20} />}
                                title={errorTitle}
                                description={
                                    errorDetail ? (
                                        <>
                                            {errorDescription}
                                            <br />
                                            <Code className="ow-empty03__detail">{errorDetail}</Code>
                                        </>
                                    ) : (
                                        errorDescription
                                    )
                                }
                                actions={
                                    <>
                                        <Button variant="primary" startIcon={<RotateCwIcon size={16} />} onClick={retry}>
                                            {labels.retry ?? "Try again"}
                                        </Button>
                                        {secondaryAction ? <BlockActionButton action={secondaryAction} variant="secondary" size="md" shape="rounded" /> : null}
                                    </>
                                }
                            />
                        ) : null}

                        {load === "loading" ? (
                            <div className="ow-empty03__loading" role="status">
                                <Spinner size="lg" label="" />
                                <Text variant="copy">{labels.loading ?? "Loading…"}</Text>
                            </div>
                        ) : null}

                        {load === "loaded" ? (
                            <ul className="ow-empty03__runs" aria-label={labels.list ?? (typeof cardTitle === "string" ? cardTitle : undefined)}>
                                {shown.map((item, index) => (
                                    <li key={item.id ?? index} className="ow-empty03__run">
                                        <span className="ow-empty03__agent" aria-hidden="true">
                                            {item.icon}
                                        </span>
                                        <span className="ow-empty03__run-text">
                                            <Text variant="label" truncate>
                                                {item.title}
                                            </Text>
                                            {item.meta ? (
                                                <Text variant="caption" truncate>
                                                    {item.meta}
                                                </Text>
                                            ) : null}
                                        </span>
                                        <Text variant="caption" className="ow-empty03__run-time">
                                            {item.time}
                                        </Text>
                                        {item.status ? (
                                            <Badge size="sm" variant={item.status.tone}>
                                                {item.status.label}
                                            </Badge>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                </section>
            </main>
        </div>
    );
}
