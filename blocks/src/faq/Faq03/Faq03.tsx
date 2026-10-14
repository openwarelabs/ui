import { useId } from "react";

import { Avatar, AvatarGroup, Card, cx, SectionHeading, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import type { Faq03Props } from "./Faq03.types";

/** Every question answered in two columns, and a card for anything they don't cover. */
export function Faq03({ eyebrow, title, description, questions, contact, className, ...props }: Faq03Props) {
    const id = useId();
    return (
        <section className={cx("ow-faq03", className)} aria-labelledby={id} {...props}>
            <div className="ow-faq03__inner">
                <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />

                <div className="ow-faq03__grid">
                    {questions.map((item, index) => (
                        <div key={index} className="ow-faq03__item">
                            <Text variant="card-title">{item.question}</Text>
                            <Text variant="copy" className="ow-faq03__answer">
                                {item.answer}
                            </Text>
                        </div>
                    ))}
                </div>

                {contact ? (
                    <Card padding="none" className="ow-faq03__card">
                        {contact.people?.length ? (
                            <AvatarGroup size="lg" label={contact.peopleLabel} className="ow-faq03__people">
                                {contact.people.map((person, index) => (
                                    <Avatar key={index} name={person.name} src={person.avatar} />
                                ))}
                            </AvatarGroup>
                        ) : null}
                        <div className="ow-faq03__card-text">
                            <Text variant="card-title">{contact.title}</Text>
                            {contact.description ? (
                                <Text variant="copy" className="ow-faq03__card-body">
                                    {contact.description}
                                </Text>
                            ) : null}
                            {contact.status ? (
                                <Text as="p" variant="caption" tone="soft" className="ow-faq03__status">
                                    {contact.status}
                                </Text>
                            ) : null}
                        </div>
                        <div className="ow-faq03__actions">
                            <BlockActionButton action={contact.primaryAction} variant="primary" size="md" />
                            {contact.secondaryAction ? <BlockActionButton action={contact.secondaryAction} variant="secondary" size="md" /> : null}
                        </div>
                    </Card>
                ) : null}
            </div>
        </section>
    );
}
