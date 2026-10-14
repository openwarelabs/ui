import { useId } from "react";

import { Chip, cx, Text } from "@openwarelabs/ui";

import { BlockActions } from "@blocks/shared/BlockActions";
import type { Hero01Props } from "./Hero01.types";

/** A centred hero: an eyebrow, the headline, a lead, two actions and a note, with the product below, running on into the page. */
export function Hero01({ eyebrow, title, description, primaryAction, secondaryAction, note, visual, className, ...props }: Hero01Props) {
    const titleId = useId();
    return (
        <section className={cx("ow-hero01", className)} aria-labelledby={titleId} {...props}>
            <div className="ow-hero01__inner">
                {eyebrow ? <Chip>{eyebrow}</Chip> : null}
                <Text variant="hero" align="center" id={titleId} className="ow-hero01__title">
                    {title}
                </Text>
                <Text variant="lead" align="center" className="ow-hero01__lead">
                    {description}
                </Text>
                <BlockActions className="ow-hero01__actions" primary={primaryAction} secondary={secondaryAction} />
                {note ? (
                    <Text variant="caption" as="p" className="ow-hero01__note">
                        {note}
                    </Text>
                ) : null}
            </div>
            {visual ? <div className="ow-hero01__visual">{visual}</div> : null}
        </section>
    );
}
