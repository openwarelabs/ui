import { useId } from "react";

import { Badge, cx, Text, User, VisuallyHidden } from "@openwarelabs/ui";

import { QuoteIcon } from "@blocks/shared/icons";
import type { Testimonial01Props } from "./Testimonial01.types";

/** One large quote with the person under it. */
export function Testimonial01({ quote, highlight, name, jobTitle, avatar, badge, labels = {}, className, ...props }: Testimonial01Props) {
    const id = useId();
    return (
        <section className={cx("ow-testimonial01", className)} aria-labelledby={id} {...props}>
            <Text variant="section-title" id={id}>
                <VisuallyHidden>{labels.title ?? "What customers say"}</VisuallyHidden>
            </Text>
            <figure className="ow-testimonial01__figure">
                <QuoteIcon size={22} className="ow-testimonial01__mark" />
                <blockquote className="ow-testimonial01__quote">
                    {/* The setup sits back in muted grey; the part worth remembering is in full colour. */}
                    <Text as="p" variant="section-title" tone="muted" className="ow-testimonial01__text">
                        {quote}
                        {highlight ? (
                            <>
                                {" "}
                                <Text as="span" variant="section-title" tone="default">
                                    {highlight}
                                </Text>
                            </>
                        ) : null}
                    </Text>
                </blockquote>
                <figcaption className="ow-testimonial01__caption">
                    <User name={name} description={jobTitle} src={avatar} size="lg" />
                    {badge ? (
                        <Badge size="sm" className="ow-testimonial01__sample">
                            {badge}
                        </Badge>
                    ) : null}
                </figcaption>
            </figure>
        </section>
    );
}
