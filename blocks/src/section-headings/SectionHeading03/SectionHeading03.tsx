import { useId } from "react";

import { cx, SectionHeading, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import type { SectionHeading03Props } from "./SectionHeading03.types";

/** The title on the left; the intro and a button on the right. */
export function SectionHeading03({ eyebrow, title, description, action, className, ...props }: SectionHeading03Props) {
    const id = useId();
    return (
        <section className={cx("ow-section-heading03", className)} aria-labelledby={id} {...props}>
            <div className="ow-section-heading03__inner">
                {/* The intro sits beside the title instead of under it, so SectionHeading gets none. */}
                <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} />
                <div className="ow-section-heading03__aside">
                    {description ? (
                        <Text variant="lead" className="ow-section-heading03__intro">
                            {description}
                        </Text>
                    ) : null}
                    {action ? <BlockActionButton action={action} variant="secondary" size="md" /> : null}
                </div>
            </div>
        </section>
    );
}
