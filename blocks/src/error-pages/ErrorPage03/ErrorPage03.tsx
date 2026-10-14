import { useState } from "react";

import { Badge, Button, cx, DotGrid, Link, Steps, Text } from "@openwarelabs/ui";

import { ArrowUpRightIcon, BellRingIcon, CheckIcon, ClockIcon, RotateCwIcon } from "@blocks/shared/icons";
import type { ErrorPage03Props } from "./ErrorPage03.types";

const reload = () => window.location.reload();

/** A maintenance page: when it'll be back, how the work is going, and a way to hear when it's done. */
export function ErrorPage03({
    brand,
    statusLink,
    badge,
    title,
    description,
    backTime,
    backDetail,
    onCheckAgain = reload,
    onNotify,
    steps,
    currentStep = 0,
    labels = {},
    className,
    ...props
}: ErrorPage03Props) {
    const [checking, setChecking] = useState(false);
    const [notified, setNotified] = useState(false);

    const checkAgain = async () => {
        setChecking(true);
        try {
            await onCheckAgain();
        } catch {
            // Still under way: the page stays.
        }
        setChecking(false);
    };

    return (
        <div className={cx("ow-error-page03", className)} {...props}>
            <DotGrid fade className="ow-error-page03__ground">
                <header className="ow-error-page03__bar">
                    <Link href={brand.href} variant="standalone" className="ow-error-page03__logo" aria-label={labels.home}>
                        {brand.logo}
                        <Text variant="card-title" as="span">
                            {brand.name}
                        </Text>
                    </Link>
                    {statusLink ? (
                        <Link href={statusLink.href} variant="standalone" className="ow-error-page03__status">
                            {statusLink.label}
                            <ArrowUpRightIcon size={15} />
                        </Link>
                    ) : null}
                </header>

                <main className="ow-error-page03__main">
                    <div>
                        {badge ? (
                            <Badge size="sm" variant="warning">
                                {badge}
                            </Badge>
                        ) : null}
                        <Text variant="section-title" as="h1" className="ow-error-page03__title">
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="lead" className="ow-error-page03__text">
                                {description}
                            </Text>
                        ) : null}

                        {backTime ? (
                            <div className="ow-error-page03__back">
                                <span className="ow-error-page03__clock" aria-hidden="true">
                                    <ClockIcon size={20} />
                                </span>
                                <div className="ow-error-page03__time">
                                    <Text variant="heading" as="p" className="ow-error-page03__time-main">
                                        {backTime}
                                    </Text>
                                    {backDetail ? <Text variant="copy">{backDetail}</Text> : null}
                                </div>
                            </div>
                        ) : null}

                        <div className="ow-error-page03__actions">
                            <Button variant="primary" startIcon={<RotateCwIcon size={16} />} loading={checking} onClick={checkAgain}>
                                {labels.checkAgain ?? "Check again"}
                            </Button>
                            {onNotify ? (
                                <Button
                                    startIcon={notified ? <CheckIcon size={16} /> : <BellRingIcon size={16} />}
                                    disabled={notified}
                                    onClick={() => {
                                        setNotified(true);
                                        onNotify();
                                    }}
                                >
                                    {notified ? (labels.notified ?? "We'll email you") : (labels.notify ?? "Email me when it's back")}
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    {steps?.length ? (
                        <div className="ow-error-page03__plan">
                            <Steps title={labels.steps ?? "Maintenance plan"} current={currentStep} items={steps} />
                        </div>
                    ) : null}
                </main>
            </DotGrid>
        </div>
    );
}
