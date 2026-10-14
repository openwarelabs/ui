import { useId } from "react";

import { cx, SectionHeading, Text } from "@openwarelabs/ui";

import { BlockActions } from "@blocks/shared/BlockActions";
import { CheckIcon } from "@blocks/shared/icons";
import type { Cta03Props } from "./Cta03.types";

/** Words, two buttons and a few points beside a picture. */
export function Cta03({ eyebrow, title, description, primaryAction, secondaryAction, points, visual, className, ...props }: Cta03Props) {
    const id = useId();
    return (
        <section className={cx("ow-cta03", className)} aria-labelledby={id} {...props}>
            <div className="ow-cta03__inner">
                <div>
                    <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
                    <BlockActions className="ow-cta03__actions" primary={primaryAction} secondary={secondaryAction} />
                    {points?.length ? (
                        <ul className="ow-cta03__points">
                            {points.map((point, index) => (
                                <Text as="li" variant="body" tone="soft" key={index}>
                                    <CheckIcon size={16} />
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
