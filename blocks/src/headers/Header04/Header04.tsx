import { useRef, useState } from "react";

import { Button, CloseButton, cx, Link, Menu, MenuItem, MenuSeparator, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { BlockBrandLink } from "@blocks/shared/BlockBrandLink";
import { ArrowRightIcon, MenuIcon } from "@blocks/shared/icons";
import type { Header04Props } from "./Header04.types";

const navigateTo = (href: string) => window.location.assign(href);

/** A header with a slim announcement above it: a line of news, a link and a close button that folds it away. */
export function Header04({
    announcement,
    onDismiss,
    defaultDismissed = false,
    brand,
    links,
    primaryAction,
    secondaryLink,
    onNavigate = navigateTo,
    labels = {},
    className,
    ...props
}: Header04Props) {
    const [closed, setClosed] = useState(defaultDismissed);
    const brandRef = useRef<HTMLAnchorElement>(null);

    const dismiss = () => {
        setClosed(true);
        onDismiss?.();
        // The close button is going away; leave focus at the top of the header rather than nowhere.
        brandRef.current?.focus();
    };

    return (
        <div className={cx("ow-header04", className)} {...props}>
            <aside
                className="ow-header04__notice"
                aria-label={labels.announcement ?? "Announcement"}
                data-closed={closed || undefined}
                aria-hidden={closed || undefined}
            >
                <div className="ow-header04__clip">
                    <div className="ow-header04__notice-inner">
                        <Text className="ow-header04__message">
                            <span className="ow-header04__dot" aria-hidden="true" />
                            <strong>{announcement.title}</strong>
                            {announcement.description ? (
                                <>
                                    {" "}
                                    <span className="ow-header04__detail">{announcement.description}</span>
                                </>
                            ) : null}
                            {announcement.link ? (
                                <Link href={announcement.link.href} className="ow-header04__link">
                                    <span className="ow-header04__link-wide">{announcement.link.label}</span>
                                    <span className="ow-header04__link-narrow">{announcement.link.shortLabel ?? announcement.link.label}</span>
                                    <ArrowRightIcon size={14} />
                                </Link>
                            ) : null}
                        </Text>
                        <CloseButton size="sm" label={labels.dismiss ?? "Dismiss the announcement"} onClick={dismiss} />
                    </div>
                </div>
            </aside>

            <header className="ow-header04__header">
                <div className="ow-header04__inner">
                    <BlockBrandLink ref={brandRef} brand={brand} className="ow-header04__brand" />
                    <nav className="ow-header04__nav" aria-label="Main">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                variant="standalone"
                                className="ow-header04__link-plain"
                                aria-current={link.current ? "page" : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="ow-header04__actions">
                        {secondaryLink ? (
                            <Link href={secondaryLink.href} variant="standalone" className="ow-header04__link-plain">
                                {secondaryLink.label}
                            </Link>
                        ) : null}
                        <BlockActionButton action={primaryAction} variant="primary" size="sm" />
                        <span className="ow-header04__phone-menu">
                            <Menu
                                label={labels.menu ?? "Menu"}
                                align="end"
                                width={220}
                                trigger={
                                    <Button variant="ghost" size="sm" iconOnly aria-label={labels.menu ?? "Menu"}>
                                        <MenuIcon size={18} />
                                    </Button>
                                }
                            >
                                {links.map((link, index) => (
                                    <MenuItem key={index} onSelect={() => onNavigate(link.href)}>
                                        {link.label}
                                    </MenuItem>
                                ))}
                                {secondaryLink ? (
                                    <>
                                        <MenuSeparator />
                                        <MenuItem onSelect={() => onNavigate(secondaryLink.href)}>{secondaryLink.label}</MenuItem>
                                    </>
                                ) : null}
                            </Menu>
                        </span>
                    </div>
                </div>
            </header>
        </div>
    );
}
