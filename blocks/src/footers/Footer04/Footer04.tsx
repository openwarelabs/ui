import { cx, Link, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { FooterColumns } from "@blocks/shared/FooterColumns";
import type { Footer04Props } from "./Footer04.types";

/** A last line of pitch and a button, columns of links, the small print, and the product's name set very large across the bottom. */
export function Footer04({ title, titleMuted, primaryAction, columns, legal, legalLinks = [], wordmark, className, ...props }: Footer04Props) {
    return (
        <footer className={cx("ow-footer04", className)} {...props}>
            <div className="ow-footer04__inner">
                <div className="ow-footer04__top">
                    <div className="ow-footer04__pitch">
                        <Text variant="heading" as="p">
                            {title}
                            {titleMuted ? (
                                <>
                                    {" "}
                                    <Text variant="heading" as="span" tone="muted">
                                        {titleMuted}
                                    </Text>
                                </>
                            ) : null}
                        </Text>
                        {primaryAction ? <BlockActionButton action={primaryAction} variant="primary" size="md" /> : null}
                    </div>
                    <div className="ow-footer04__columns">
                        <FooterColumns columns={columns} headingClassName="ow-footer04__heading" listClassName="ow-footer04__list" />
                    </div>
                </div>

                <div className="ow-footer04__legal">
                    <Text variant="caption" as="p">
                        {legal}
                    </Text>
                    {legalLinks.length ? (
                        <Text variant="caption" as="ul" className="ow-footer04__legal-links">
                            {legalLinks.map((link, index) => (
                                <li key={index}>
                                    <Link href={link.href} variant="muted">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </Text>
                    ) : null}
                </div>

                <div className="ow-footer04__name" aria-hidden="true">
                    <div className="ow-footer04__crop">
                        <span>{wordmark}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
