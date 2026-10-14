import { useId } from "react";

import { cx, SectionHeading } from "@openwarelabs/ui";

import type { SectionHeading01Props } from "./SectionHeading01.types";

/** The label, the title and the intro centred over the section. */
export function SectionHeading01({ eyebrow, title, description, className, ...props }: SectionHeading01Props) {
    const id = useId();
    return (
        <section className={cx("ow-section-heading01", className)} aria-labelledby={id} {...props}>
            <div className="ow-section-heading01__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
            </div>
        </section>
    );
}
