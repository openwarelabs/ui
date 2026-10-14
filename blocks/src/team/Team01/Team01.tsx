import { useId } from "react";

import { Avatar, cx, SectionHeading, Text } from "@openwarelabs/ui";

import type { Team01Props } from "./Team01.types";

/** A centred grid of faces, each with a name and what they do, and a line at the end such as a link to open roles. */
export function Team01({ eyebrow, title, description, people, note, className, ...props }: Team01Props) {
    const titleId = `${useId()}-title`;

    return (
        <section className={cx("ow-team01", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-team01__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={titleId}>{title}</span>} intro={description} />

                <ul className="ow-team01__list">
                    {people.map((person, index) => (
                        <li key={index} className="ow-team01__person" data-tone={person.tone ?? "brand"}>
                            <Avatar name={person.name} src={person.avatar} size={96} className="ow-team01__avatar" />
                            <Text variant="card-title" as="span" className="ow-team01__name">
                                {person.name}
                            </Text>
                            <Text variant="body" as="span" tone="muted" className="ow-team01__role">
                                {person.jobTitle}
                            </Text>
                        </li>
                    ))}
                </ul>

                {note ? (
                    <Text variant="copy" align="center" className="ow-team01__hiring">
                        {note}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
