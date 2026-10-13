import { Badge, Text, User, VisuallyHidden } from "@openwarelabs/ui";
import { Quote } from "lucide-react";

import "./TestimonialSingle.css";

export function TestimonialSingle() {
    return (
        <section className="testimonial-single" aria-labelledby="testimonial-single-title">
            <Text variant="section-title" id="testimonial-single-title">
                <VisuallyHidden>What customers say</VisuallyHidden>
            </Text>
            <figure className="testimonial-single__figure">
                <Quote size={22} className="testimonial-single__mark" aria-hidden="true" />
                <blockquote className="testimonial-single__quote">
                    {/* The setup sits back in muted grey; the part worth remembering is in full colour. */}
                    <Text as="p" variant="section-title" tone="muted" className="testimonial-single__text">
                        Our review queue used to be where work went to wait.{" "}
                        <Text as="span" variant="section-title" tone="default">
                            Now agents take the routine changes, previews are ready before anyone looks, and most pull requests merge the day they open.
                        </Text>
                    </Text>
                </blockquote>
                <figcaption className="testimonial-single__caption">
                    <User name="Ingrid Solberg" description="VP of engineering, Basalt" size="lg" />
                    <Badge size="sm" className="testimonial-single__sample">
                        Sample quote
                    </Badge>
                </figcaption>
            </figure>
        </section>
    );
}
