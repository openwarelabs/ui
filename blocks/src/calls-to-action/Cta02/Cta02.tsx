import { useId } from "react";

import { cx, DotGrid, Link, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { ArrowRightIcon, CheckIcon } from "@blocks/shared/icons";
import type { Cta02Props } from "./Cta02.types";

/** A centred call to action on the brand colour, with white text, a white button and a few facts. */
export function Cta02({ eyebrow, title, description, primaryAction, secondaryLink, facts, className, ...props }: Cta02Props) {
    const id = useId();
    return (
        <section className={cx("ow-cta02", className)} aria-labelledby={id} {...props}>
            <DotGrid fade className="ow-cta02__plate">
                <div className="ow-cta02__content">
                    {/* A Chip, redrawn for the plate: the library's white Chip would glare on the brand colour. */}
                    {eyebrow ? (
                        <Text as="p" variant="body" className="ow-cta02__eyebrow">
                            {eyebrow}
                        </Text>
                    ) : null}
                    <Text as="h2" variant="page-title" id={id} className="ow-cta02__title">
                        {title}
                    </Text>
                    {description ? (
                        <Text variant="lead" className="ow-cta02__lead">
                            {description}
                        </Text>
                    ) : null}
                    <div className="ow-cta02__actions">
                        <BlockActionButton action={primaryAction} variant="secondary" className="ow-cta02__action" />
                        {secondaryLink ? (
                            <Link href={secondaryLink.href} variant="standalone" className="ow-cta02__link">
                                <Text variant="label">{secondaryLink.label}</Text>
                                <ArrowRightIcon size={16} />
                            </Link>
                        ) : null}
                    </div>
                    {facts?.length ? (
                        <ul className="ow-cta02__facts">
                            {facts.map((fact, index) => (
                                <Text as="li" variant="body" key={index}>
                                    <CheckIcon size={15} />
                                    {fact}
                                </Text>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </DotGrid>
        </section>
    );
}
