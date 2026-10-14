import { useId } from "react";

import { Chip, cx, Text } from "@openwarelabs/ui";

import { BlockActions } from "@blocks/shared/BlockActions";
import { CheckIcon } from "@blocks/shared/icons";
import type { Hero02Props } from "./Hero02.types";

/** A split hero: the words on the left and the product on the right. They stack on phones. */
export function Hero02({ eyebrow, title, description, primaryAction, secondaryAction, points, visual, className, ...props }: Hero02Props) {
    const titleId = useId();
    return (
        <section className={cx("ow-hero02", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-hero02__inner">
                <div className="ow-hero02__text">
                    {eyebrow ? <Chip>{eyebrow}</Chip> : null}
                    <Text variant="page-title" id={titleId} className="ow-hero02__title">
                        {title}
                    </Text>
                    <Text variant="lead" className="ow-hero02__lead">
                        {description}
                    </Text>
                    <BlockActions className="ow-hero02__actions" primary={primaryAction} secondary={secondaryAction} />
                    {points?.length ? (
                        <ul className="ow-hero02__points">
                            {points.map((point, index) => (
                                <Text as="li" key={index} tone="muted" className="ow-hero02__point">
                                    <CheckIcon size={15} />
                                    {point}
                                </Text>
                            ))}
                        </ul>
                    ) : null}
                </div>
                {visual}
            </div>
        </section>
    );
}
