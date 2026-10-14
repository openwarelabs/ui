import { useId } from "react";

import { cx, DotGrid, Text } from "@openwarelabs/ui";

import { BlockActions } from "@blocks/shared/BlockActions";
import type { Cta01Props } from "./Cta01.types";

/** A wide panel on a dot grid with a headline on the left and the buttons on the right. */
export function Cta01({ title, description, primaryAction, secondaryAction, note, className, ...props }: Cta01Props) {
    const id = useId();
    return (
        <section className={cx("ow-cta01", className)} aria-labelledby={id} {...props}>
            <DotGrid fade className="ow-cta01__panel">
                <div className="ow-cta01__content">
                    <div className="ow-cta01__text">
                        <Text variant="section-title" id={id}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="lead" className="ow-cta01__lead">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    <div className="ow-cta01__side">
                        <BlockActions className="ow-cta01__actions" primary={primaryAction} secondary={secondaryAction} />
                        {note ? (
                            <Text as="p" variant="caption" className="ow-cta01__note">
                                {note}
                            </Text>
                        ) : null}
                    </div>
                </div>
            </DotGrid>
        </section>
    );
}
