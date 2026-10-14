import { cx, Link, ScrollShadow } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { BlockBrandLink } from "@blocks/shared/BlockBrandLink";
import type { HeaderLink } from "@blocks/shared/shared.types";
import type { Header03Props } from "./Header03.types";

function NavLink({ link }: { link: HeaderLink }) {
    return (
        <Link href={link.href} variant="standalone" className="ow-header03__link" aria-current={link.current ? "page" : undefined}>
            {link.label}
        </Link>
    );
}

/**
 * The logo in the middle with links either side, for a brand-led site. On tablets and phones every link moves to a
 * line of its own under the bar, scrolling sideways when it runs out of room.
 */
export function Header03({ brand, start, end = [], primaryAction, secondaryLink, labels = {}, className, ...props }: Header03Props) {
    return (
        <header className={cx("ow-header03", className)} {...props}>
            <div className="ow-header03__inner">
                <nav className="ow-header03__nav" aria-label={labels.start ?? "Primary"}>
                    {start.map((link, index) => (
                        <NavLink key={index} link={link} />
                    ))}
                </nav>
                {secondaryLink ? (
                    <Link href={secondaryLink.href} variant="standalone" className="ow-header03__link ow-header03__phone-only">
                        {secondaryLink.label}
                    </Link>
                ) : null}

                <BlockBrandLink brand={brand} className="ow-header03__brand" />

                <div className="ow-header03__end">
                    {end.length ? (
                        <nav className="ow-header03__nav" aria-label={labels.end ?? "More"}>
                            {end.map((link, index) => (
                                <NavLink key={index} link={link} />
                            ))}
                        </nav>
                    ) : null}
                    <div className="ow-header03__actions">
                        {secondaryLink ? <NavLink link={secondaryLink} /> : null}
                        <BlockActionButton action={primaryAction} variant="primary" size="sm" />
                    </div>
                </div>
            </div>

            {/* Tablets and phones: every link on a line of its own, scrolling sideways when it runs out of room. */}
            <ScrollShadow orientation="horizontal" size={24} className="ow-header03__phone-only ow-header03__phone-nav">
                <nav aria-label={labels.all ?? "Main"}>
                    <ul className="ow-header03__phone-links">
                        {[...start, ...end].map((link, index) => (
                            <li key={index}>
                                <NavLink link={link} />
                            </li>
                        ))}
                    </ul>
                </nav>
            </ScrollShadow>
        </header>
    );
}
