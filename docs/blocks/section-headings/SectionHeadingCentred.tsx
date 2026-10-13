import { SectionHeading } from "@openwarelabs/ui";

import "./SectionHeadingCentred.css";

export function SectionHeadingCentred() {
    return (
        <section className="section-heading-centred" aria-labelledby="section-heading-centred-title">
            <div className="section-heading-centred__inner">
                <SectionHeading
                    align="center"
                    eyebrow="How it works"
                    title={<span id="section-heading-centred-title">Plan it, hand it off, review it, ship it</span>}
                    intro="Every change follows the same path, whether a person or an agent made it, so nothing reaches production without a second pair of eyes."
                />
            </div>
        </section>
    );
}
