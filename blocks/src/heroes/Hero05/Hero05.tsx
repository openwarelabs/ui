import { useId } from "react";

import { Chip, cx, Text } from "@openwarelabs/ui";

import { BlockActions } from "@blocks/shared/BlockActions";
import type { Hero05Props } from "./Hero05.types";

/** The usual hero, with the headline beside the lead, then a row of customers' logos as the first proof. */
export function Hero05({ eyebrow, title, description, primaryAction, secondaryAction, logosTitle, logos, className, ...props }: Hero05Props) {
    const id = useId();
    return (
        <section className={cx("ow-hero05", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-hero05__inner">
                <div className="ow-hero05__top">
                    <div className="ow-hero05__heading">
                        {eyebrow ? <Chip>{eyebrow}</Chip> : null}
                        <Text variant="hero" id={`${id}-title`} className="ow-hero05__title">
                            {title}
                        </Text>
                    </div>
                    <div>
                        <Text variant="lead">{description}</Text>
                        <BlockActions className="ow-hero05__actions" primary={primaryAction} secondary={secondaryAction} />
                    </div>
                </div>

                <div className="ow-hero05__proof">
                    <Text tone="muted" id={`${id}-logos`}>
                        {logosTitle}
                    </Text>
                    <ul className="ow-hero05__list" aria-labelledby={`${id}-logos`}>
                        {logos.map((logo) => (
                            <li key={logo.name} className="ow-hero05__logo">
                                {logo.logo}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
