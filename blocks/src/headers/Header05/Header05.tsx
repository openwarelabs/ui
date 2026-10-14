import { useEffect, useId, useState } from "react";

import { Button, buttonClassName, cx, Drawer, Link, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { BlockBrandLink } from "@blocks/shared/BlockBrandLink";
import { ChevronRightIcon, MenuIcon } from "@blocks/shared/icons";
import type { Header05Props } from "./Header05.types";

// Under this width the links fold into the drawer (the same width as the media query in the CSS).
const narrow = "(max-width: 1024px)";

/** A header whose links fold into a drawer behind a menu button on tablets and phones, with a second list and both actions. */
export function Header05({ brand, links, more, primaryAction, secondaryLink, defaultOpen = false, labels = {}, className, ...props }: Header05Props) {
    const [open, setOpen] = useState(defaultOpen);
    const moreId = useId();

    useEffect(() => {
        const query = window.matchMedia(narrow);
        const onChange = () => !query.matches && setOpen(false);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    const close = () => setOpen(false);

    return (
        <>
            <header className={cx("ow-header05", className)} {...props}>
                <div className="ow-header05__inner">
                    <BlockBrandLink brand={brand} className="ow-header05__brand" />
                    <nav className="ow-header05__nav" aria-label="Main">
                        {links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.href}
                                variant="standalone"
                                className="ow-header05__link"
                                aria-current={link.current ? "page" : undefined}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="ow-header05__actions">
                        {secondaryLink ? (
                            <Link href={secondaryLink.href} variant="standalone" className="ow-header05__link">
                                {secondaryLink.label}
                            </Link>
                        ) : null}
                        <BlockActionButton action={primaryAction} variant="primary" size="sm" />
                        <Button
                            className="ow-header05__open"
                            variant="ghost"
                            size="sm"
                            iconOnly
                            aria-label={labels.open ?? "Open menu"}
                            aria-haspopup="dialog"
                            aria-expanded={open}
                            onClick={() => setOpen(true)}
                        >
                            <MenuIcon size={18} />
                        </Button>
                    </div>
                </div>
            </header>

            <Drawer
                className="ow-header05__drawer"
                open={open}
                onClose={close}
                title={labels.title ?? "Menu"}
                side="right"
                size={320}
                footer={
                    <>
                        {secondaryLink ? (
                            <a href={secondaryLink.href} className={buttonClassName({ shape: "pill" })} onClick={close}>
                                {secondaryLink.label}
                            </a>
                        ) : null}
                        <BlockActionButton action={primaryAction} variant="primary" size="md" onAfterClick={close} />
                    </>
                }
            >
                <nav aria-label="Main">
                    <ul className="ow-header05__drawer-list">
                        {links.map((link, index) => (
                            <li key={index}>
                                <Link
                                    href={link.href}
                                    variant="standalone"
                                    className="ow-header05__drawer-link"
                                    aria-current={link.current ? "page" : undefined}
                                    onClick={close}
                                >
                                    {link.label}
                                    {link.current ? <span className="ow-header05__current" aria-hidden="true" /> : null}
                                    <ChevronRightIcon size={16} />
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {more ? (
                        <div className="ow-header05__more">
                            <Text variant="overline" as="p" className="ow-header05__more-label" id={moreId}>
                                {more.title}
                            </Text>
                            <ul className="ow-header05__more-list" aria-labelledby={moreId}>
                                {more.links.map((link, index) => (
                                    <li key={index}>
                                        <Link href={link.href} variant="standalone" className="ow-header05__more-link" onClick={close}>
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </nav>
            </Drawer>
        </>
    );
}
