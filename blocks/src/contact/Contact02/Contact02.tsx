import { useId } from "react";

import { Card, CopyButton, cx, Link, SectionHeading, Text } from "@openwarelabs/ui";

import { ArrowRightIcon } from "@blocks/shared/icons";
import type { Contact02Props } from "./Contact02.types";

/** Ways to get help before writing in, a card each with a few links and the way in, and a line about the service's state. */
export function Contact02({ eyebrow, title, description, options, status, labels = {}, className, ...props }: Contact02Props) {
    const titleId = `${useId()}-title`;

    return (
        <section className={cx("ow-contact02", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-contact02__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={titleId}>{title}</span>} intro={description} />

                <div className="ow-contact02__grid">
                    {options.map((option, index) => (
                        <Card key={index} padding="none" className="ow-contact02__card">
                            <div className="ow-contact02__body">
                                {option.icon ? (
                                    <span className="ow-contact02__icon" aria-hidden="true">
                                        {option.icon}
                                    </span>
                                ) : null}
                                <Text variant="heading" as="h3" className="ow-contact02__title">
                                    {option.title}
                                </Text>
                                {option.description ? (
                                    <Text variant="copy" className="ow-contact02__text">
                                        {option.description}
                                    </Text>
                                ) : null}
                                {option.email ? (
                                    <div className="ow-contact02__address">
                                        <Text variant="body" as="span">
                                            {option.email}
                                        </Text>
                                        <CopyButton value={option.email} label={labels.copyAddress ?? "Copy address"} iconOnly />
                                    </div>
                                ) : null}
                                {option.list?.length ? (
                                    <ul className="ow-contact02__list" aria-label={option.listLabel}>
                                        {option.list.map((item, row) => (
                                            <Text key={row} variant="body" as="li">
                                                {item.href ? (
                                                    <Link href={item.href} variant="standalone">
                                                        {item.label}
                                                    </Link>
                                                ) : (
                                                    <span>{item.label}</span>
                                                )}
                                                {item.meta ? (
                                                    <Text variant="caption" className="ow-contact02__meta">
                                                        {item.meta}
                                                    </Text>
                                                ) : null}
                                            </Text>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                            <div className="ow-contact02__foot">
                                <Link href={option.link.href} variant="standalone" className="ow-contact02__foot-link">
                                    {option.link.label}
                                    <ArrowRightIcon size={14} />
                                </Link>
                                {option.footNote ? (
                                    <Text variant="caption" className="ow-contact02__members">
                                        {option.footNote}
                                    </Text>
                                ) : null}
                            </div>
                        </Card>
                    ))}
                </div>

                {status ? (
                    <Text variant="body" tone="muted" align="center" className="ow-contact02__status">
                        <Text variant="label" as="span" tone="default" className="ow-contact02__state">
                            {status.label}
                        </Text>
                        {status.description ? <span>{status.description}</span> : null}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
