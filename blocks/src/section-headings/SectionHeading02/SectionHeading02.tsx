import { useId } from "react";

import { cx, Link, SectionHeading } from "@openwarelabs/ui";

import { ArrowRightIcon } from "@blocks/shared/icons";
import type { SectionHeading02Props } from "./SectionHeading02.types";

/** The heading on the left and a link to the rest on the right. */
export function SectionHeading02({ eyebrow, title, description, link, className, ...props }: SectionHeading02Props) {
    const id = useId();
    return (
        <section className={cx("ow-section-heading02", className)} aria-labelledby={id} {...props}>
            <div className="ow-section-heading02__inner">
                <SectionHeading eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
                <Link href={link.href} variant="standalone" className="ow-section-heading02__link">
                    {link.label}
                    <ArrowRightIcon size={16} />
                </Link>
            </div>
        </section>
    );
}
