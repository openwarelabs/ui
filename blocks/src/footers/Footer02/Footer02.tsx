import { cx, Link, Text } from "@openwarelabs/ui";

import type { Footer02Props } from "./Footer02.types";

/** The logo, one line of links and the small print, centred. */
export function Footer02({ brand, links, legal, labels = {}, className, ...props }: Footer02Props) {
    return (
        <footer className={cx("ow-footer02", className)} {...props}>
            <div className="ow-footer02__inner">
                <Link href={brand.href} className="ow-footer02__logo" aria-label={labels.home ?? (typeof brand.name === "string" ? `${brand.name} home` : undefined)}>
                    {brand.logo}
                </Link>
                <nav aria-label={labels.nav ?? "Footer"}>
                    <ul className="ow-footer02__links">
                        {links.map((link, index) => (
                            <li key={index}>
                                <Link href={link.href} variant="standalone">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <Text variant="caption" as="p">
                    {legal}
                </Text>
            </div>
        </footer>
    );
}
