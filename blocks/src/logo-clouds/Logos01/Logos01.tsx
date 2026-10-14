import { useId } from "react";

import { cx, Text } from "@openwarelabs/ui";

import type { Logos01Props } from "./Logos01.types";

/** A row of customers' logos under a small heading. */
export function Logos01({ title, logos, className, ...props }: Logos01Props) {
    const id = useId();
    return (
        <section className={cx("ow-logos01", className)} aria-labelledby={id} {...props}>
            <div className="ow-logos01__inner">
                {/* A small heading: the logos are the point. */}
                <Text as="h2" variant="body" tone="muted" align="center" id={id}>
                    {title}
                </Text>
                <ul className="ow-logos01__list">
                    {logos.map((logo) => (
                        <li key={logo.name} className="ow-logos01__logo">
                            {logo.logo}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
