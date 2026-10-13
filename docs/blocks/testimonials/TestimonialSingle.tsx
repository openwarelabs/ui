import { Badge, User, VisuallyHidden } from "@openwarelabs/ui";
import { Quote } from "lucide-react";

import "./TestimonialSingle.css";

export function TestimonialSingle() {
    return (
        <section className="testimonial-single" aria-labelledby="testimonial-single-title">
            <h2 id="testimonial-single-title" className="testimonial-single__heading">
                <VisuallyHidden>What customers say</VisuallyHidden>
            </h2>
            <figure className="testimonial-single__figure">
                <Quote size={22} className="testimonial-single__mark" aria-hidden="true" />
                <blockquote className="testimonial-single__quote">
                    <p>
                        Our review queue used to be where work went to wait.{" "}
                        <span className="testimonial-single__emphasis">
                            Now agents take the routine changes, previews are ready before anyone looks, and most pull requests merge the day they open.
                        </span>
                    </p>
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
