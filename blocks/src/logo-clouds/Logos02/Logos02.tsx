import { useId } from "react";

import { cx, Link, SectionHeading, Text } from "@openwarelabs/ui";

import { ArrowRightIcon } from "@blocks/shared/icons";
import type { Logos02Props } from "./Logos02.types";

/** Customers' logos in tiles on one card, each linking to its story. */
export function Logos02({ eyebrow, title, description, logos, link, labels = {}, className, ...props }: Logos02Props) {
    const id = useId();
    return (
        <section className={cx("ow-logos02", className)} aria-labelledby={id} {...props}>
            <div className="ow-logos02__inner">
                <SectionHeading align="center" eyebrow={eyebrow} title={<span id={id}>{title}</span>} intro={description} />
                <ul className="ow-logos02__tiles">
                    {logos.map((logo) => (
                        <li key={logo.name}>
                            <Link href={logo.href} variant="standalone" className="ow-logos02__tile">
                                <span className="ow-logos02__logo">{logo.logo}</span>
                                <Text variant="caption" className="ow-logos02__more">
                                    {labels.more ?? "Read the story"}
                                    <ArrowRightIcon size={13} />
                                </Text>
                            </Link>
                        </li>
                    ))}
                </ul>
                {link ? (
                    <Text variant="body" tone="muted" align="center" className="ow-logos02__footer">
                        <Link href={link.href}>{link.label}</Link>
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
