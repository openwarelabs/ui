import { useId } from "react";

import { cx, Link, SectionHeading, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { CheckIcon } from "@blocks/shared/icons";
import type { Features05Props } from "./Features05.types";

/** A checklist of what's included, with a button, beside one large picture. */
export function Features05({ eyebrow, title, description, items, primaryAction, secondaryLink, visual, className, ...props }: Features05Props) {
    const id = useId();
    return (
        <section className={cx("ow-features05", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-features05__inner">
                <div className="ow-features05__copy">
                    <SectionHeading eyebrow={eyebrow} title={<span id={`${id}-title`}>{title}</span>} intro={description} />
                    <ul className="ow-features05__list">
                        {items.map((item, index) => (
                            <Text as="li" key={index} tone="soft" className="ow-features05__item">
                                <span className="ow-features05__tick" aria-hidden="true">
                                    <CheckIcon size={12} strokeWidth={3} />
                                </span>
                                {item}
                            </Text>
                        ))}
                    </ul>
                    {primaryAction || secondaryLink ? (
                        <div className="ow-features05__actions">
                            {primaryAction ? <BlockActionButton action={primaryAction} variant="primary" /> : null}
                            {secondaryLink ? (
                                <Link href={secondaryLink.href} variant="standalone">
                                    {secondaryLink.label}
                                </Link>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                <div className="ow-features05__visual">{visual}</div>
            </div>
        </section>
    );
}
