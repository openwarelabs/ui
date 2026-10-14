import { useId } from "react";

import { Chip, cx, DotGrid, Text } from "@openwarelabs/ui";

import { BlockActions } from "@blocks/shared/BlockActions";
import type { Hero04Props } from "./Hero04.types";

/** A hero on Openware's dot grid, with the dots turning brass under the pointer and room for something either side. */
export function Hero04({ eyebrow, title, description, primaryAction, secondaryAction, start, end, interactive = true, className, ...props }: Hero04Props) {
    const titleId = useId();
    return (
        <section className={cx("ow-hero04", className)} aria-labelledby={titleId} {...props}>
            <DotGrid fade interactive={interactive} className="ow-hero04__grid">
                <div className="ow-hero04__layout">
                    {start}
                    <div className="ow-hero04__text">
                        {eyebrow ? <Chip>{eyebrow}</Chip> : null}
                        <Text variant="hero" align="center" id={titleId} className="ow-hero04__title">
                            {title}
                        </Text>
                        <Text variant="lead" align="center" className="ow-hero04__lead">
                            {description}
                        </Text>
                        <BlockActions className="ow-hero04__actions" primary={primaryAction} secondary={secondaryAction} />
                    </div>
                    {end}
                </div>
            </DotGrid>
        </section>
    );
}
