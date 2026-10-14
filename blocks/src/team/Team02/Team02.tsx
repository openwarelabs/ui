import { useId } from "react";

import { Avatar, buttonClassName, Card, cx, SectionHeading, Text } from "@openwarelabs/ui";

import { LinkIcon, MailIcon, MapPinIcon } from "@blocks/shared/icons";
import type { Team02Props } from "./Team02.types";

/** A card for each person: their face, name and job, a line about what they do, and where they are with ways to reach them. */
export function Team02({ eyebrow, title, description, people, labels = {}, className, ...props }: Team02Props) {
    const titleId = `${useId()}-title`;

    return (
        <section className={cx("ow-team02", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-team02__inner">
                <SectionHeading eyebrow={eyebrow} title={<span id={titleId}>{title}</span>} intro={description} />

                <ul className="ow-team02__list">
                    {people.map((person, index) => (
                        <li key={index}>
                            <Card padding="lg" className="ow-team02__card">
                                <div className="ow-team02__head">
                                    <Avatar name={person.name} src={person.avatar} size={56} />
                                    <div className="ow-team02__who">
                                        <Text variant="card-title">{person.name}</Text>
                                        <Text variant="body" tone="muted" className="ow-team02__role">
                                            {person.jobTitle}
                                        </Text>
                                    </div>
                                </div>
                                {person.bio ? (
                                    <Text variant="copy" tone="soft" className="ow-team02__about">
                                        {person.bio}
                                    </Text>
                                ) : null}
                                {person.location || person.email || person.website ? (
                                    <div className="ow-team02__foot">
                                        {person.location ? (
                                            <Text variant="caption" className="ow-team02__place">
                                                <MapPinIcon size={14} />
                                                {person.location}
                                            </Text>
                                        ) : (
                                            <span />
                                        )}
                                        <span className="ow-team02__links">
                                            {person.email ? (
                                                <a
                                                    href={`mailto:${person.email}`}
                                                    className={buttonClassName({ variant: "ghost", size: "sm", iconOnly: true })}
                                                    aria-label={labels.email?.(person.name) ?? `Email ${person.name}`}
                                                >
                                                    <MailIcon size={16} />
                                                </a>
                                            ) : null}
                                            {person.website ? (
                                                <a
                                                    href={person.website}
                                                    className={buttonClassName({ variant: "ghost", size: "sm", iconOnly: true })}
                                                    aria-label={labels.website?.(person.name) ?? `${person.name}'s website`}
                                                >
                                                    <LinkIcon size={16} />
                                                </a>
                                            ) : null}
                                        </span>
                                    </div>
                                ) : null}
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
