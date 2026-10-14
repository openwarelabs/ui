import { useId, useState } from "react";

import { Badge, Button, cx, Link, SectionHeading, Text } from "@openwarelabs/ui";

import { ChevronDownIcon } from "@blocks/shared/icons";
import type { Blog03Props } from "./Blog03.types";

/** A changelog: releases down a timeline, the date and version on the left, the headline and its changes by group on the right. */
export function Blog03({ eyebrow, title, description, links = [], releases, initialCount = 3, labels = {}, className, ...props }: Blog03Props) {
    const [showAll, setShowAll] = useState(false);
    const id = useId();
    const titleId = `${id}-title`;
    const hidden = Math.max(releases.length - initialCount, 0);
    const shown = showAll ? releases : releases.slice(0, initialCount);

    return (
        <section className={cx("ow-blog03", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-blog03__inner">
                <div className="ow-blog03__header">
                    <SectionHeading eyebrow={eyebrow} title={<span id={titleId}>{title}</span>} intro={description} />
                    {links.length ? (
                        <div className="ow-blog03__subscribe">
                            {links.map((link, index) => (
                                <Link key={index} href={link.href} variant="standalone">
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    ) : null}
                </div>

                <ol className="ow-blog03__list">
                    {shown.map((release, index) => (
                        <li key={release.version} className="ow-blog03__release">
                            <div className="ow-blog03__when">
                                <Text variant="code" as="span" className="ow-blog03__version">
                                    {labels.versionPrefix ?? "v"}
                                    {release.version}
                                </Text>
                                <Text variant="body" as="span" tone="muted">
                                    <time dateTime={release.dateTime}>{release.date}</time>
                                </Text>
                                {index === 0 ? (
                                    <Badge size="sm" variant="neutral">
                                        {labels.latest ?? "Latest"}
                                    </Badge>
                                ) : null}
                            </div>
                            <article className="ow-blog03__body" aria-labelledby={`${id}-${index}`}>
                                <span className="ow-blog03__node" aria-hidden="true" />
                                <Text variant="heading" as="h3" id={`${id}-${index}`}>
                                    {release.title}
                                </Text>
                                {release.summary ? (
                                    <Text variant="prose" tone="muted" className="ow-blog03__summary">
                                        {release.summary}
                                    </Text>
                                ) : null}
                                {release.visual}
                                {release.changes?.length ? (
                                    <div className="ow-blog03__groups">
                                        {release.changes.map((group) => (
                                            <div key={group.label} className="ow-blog03__group">
                                                <Badge size="sm" variant={group.variant ?? "neutral"}>
                                                    {group.label}
                                                </Badge>
                                                <ul
                                                    className="ow-blog03__items"
                                                    aria-label={labels.changes?.(group.label, release.version) ?? `${group.label} in ${release.version}`}
                                                >
                                                    {group.items.map((change, item) => (
                                                        <Text key={item} variant="copy" as="li" tone="soft">
                                                            {change}
                                                        </Text>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </article>
                        </li>
                    ))}
                </ol>

                {showAll || !hidden ? null : (
                    <div className="ow-blog03__more">
                        <Button shape="pill" endIcon={<ChevronDownIcon size={16} />} onClick={() => setShowAll(true)}>
                            {labels.showOlder ? labels.showOlder(hidden) : <>Show {hidden} older releases</>}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
