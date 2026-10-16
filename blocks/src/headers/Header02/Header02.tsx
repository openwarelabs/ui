import { Fragment, useEffect, useId, useState } from "react";

import { Badge, Button, buttonClassName, cx, Link, Menu, MenuItem, MenuSeparator, Popover, Text } from "@openwarelabs/ui";

import { BlockActionButton } from "@blocks/shared/BlockActions";
import { BlockBrandLink } from "@blocks/shared/BlockBrandLink";
import { ArrowRightIcon, ChevronDownIcon, MenuIcon, XIcon } from "@blocks/shared/icons";
import type { Header02Panel, Header02Props } from "./Header02.types";

const navigateTo = (href: string) => window.location.assign(href);

function PanelContent({ panel, onNavigate }: { panel: Header02Panel; onNavigate(): void }) {
    return (
        <div className="ow-header02__product">
            <ul className="ow-header02__features">
                {panel.features.map((feature, index) => (
                    <li key={index}>
                        <Link href={feature.href} variant="standalone" className="ow-header02__feature" onClick={onNavigate}>
                            {feature.icon ? (
                                <span className="ow-header02__feature-icon" aria-hidden="true">
                                    {feature.icon}
                                </span>
                            ) : null}
                            <span className="ow-header02__feature-text">
                                <Text variant="label">{feature.title}</Text>
                                <Text variant="caption">{feature.description}</Text>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            {panel.highlight ? (
                <Link href={panel.highlight.href} variant="standalone" className="ow-header02__news" onClick={onNavigate}>
                    {panel.highlight.badge ? (
                        <Badge size="sm" variant="active">
                            {panel.highlight.badge}
                        </Badge>
                    ) : null}
                    <Text variant="label">{panel.highlight.title}</Text>
                    <Text as="span" tone="primary" className="ow-header02__news-link">
                        {panel.highlight.linkLabel}
                        <ArrowRightIcon size={14} />
                    </Text>
                </Link>
            ) : null}
        </div>
    );
}

/**
 * A bar across the top with a big menu (a grid of features and a highlight), dropdowns of links and plain links,
 * then one call to action. On phones everything folds into a panel under the bar.
 */
export function Header02({
    brand,
    panel,
    menus = [],
    links = [],
    primaryAction,
    secondaryLink,
    onNavigate = navigateTo,
    defaultPanelOpen = false,
    labels = {},
    className,
    ...props
}: Header02Props) {
    const [productOpen, setProductOpen] = useState(defaultPanelOpen);
    const [phoneOpen, setPhoneOpen] = useState(false);
    const phoneId = useId();
    const closePhone = () => setPhoneOpen(false);

    useEffect(() => {
        const wide = window.matchMedia("(min-width: 761px)");
        const onChange = () => (wide.matches ? setPhoneOpen(false) : setProductOpen(false));
        wide.addEventListener("change", onChange);
        return () => wide.removeEventListener("change", onChange);
    }, []);

    return (
        <header className={cx("ow-header02", className)} {...props}>
            <div className="ow-header02__inner">
                <BlockBrandLink brand={brand} className="ow-header02__brand" />
                <nav className="ow-header02__nav" aria-label="Main">
                    {panel ? (
                        <Popover
                            className="ow-header02__popover"
                            aria-label={panel.label}
                            width={720}
                            autoFocus={false}
                            open={productOpen}
                            onOpenChange={setProductOpen}
                            trigger={
                                <Button variant="ghost" shape="pill" size="sm" className="ow-header02__item" endIcon={<ChevronDownIcon size={14} />}>
                                    {panel.label}
                                </Button>
                            }
                        >
                            <PanelContent panel={panel} onNavigate={() => setProductOpen(false)} />
                        </Popover>
                    ) : null}
                    {menus.map((menu) => (
                        <Menu
                            key={menu.label}
                            label={menu.label}
                            width={220}
                            trigger={
                                <Button variant="ghost" shape="pill" size="sm" className="ow-header02__item" endIcon={<ChevronDownIcon size={14} />}>
                                    {menu.label}
                                </Button>
                            }
                        >
                            {menu.groups.map((group, index) => (
                                <Fragment key={index}>
                                    {index > 0 ? <MenuSeparator /> : null}
                                    {group.map((entry) => (
                                        <MenuItem key={entry.label} icon={entry.icon} onSelect={() => onNavigate(entry.href)}>
                                            {entry.label}
                                        </MenuItem>
                                    ))}
                                </Fragment>
                            ))}
                        </Menu>
                    ))}
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            className={cx(buttonClassName({ variant: "ghost", shape: "pill", size: "sm" }), "ow-header02__item")}
                            aria-current={link.current ? "page" : undefined}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
                <div className="ow-header02__actions">
                    {secondaryLink ? (
                        <a
                            href={secondaryLink.href}
                            className={cx(buttonClassName({ variant: "ghost", shape: "pill", size: "sm" }), "ow-header02__item ow-header02__sign-in")}
                        >
                            {secondaryLink.label}
                        </a>
                    ) : null}
                    <BlockActionButton action={primaryAction} variant="primary" size="sm" />
                    <Button
                        className="ow-header02__toggle"
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={labels.menu ?? "Menu"}
                        aria-expanded={phoneOpen}
                        aria-controls={phoneId}
                        onClick={() => setPhoneOpen((open) => !open)}
                    >
                        {phoneOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
                    </Button>
                </div>
            </div>

            {/* Phones: everything in the bar, folded into a panel under it. */}
            <nav id={phoneId} className="ow-header02__panel" aria-label="Main" hidden={!phoneOpen}>
                {panel ? (
                    <>
                        <Text variant="overline" as="p" className="ow-header02__panel-label">
                            {panel.label}
                        </Text>
                        <ul className="ow-header02__panel-list">
                            {panel.features.map((feature, index) => (
                                <li key={index}>
                                    <Link href={feature.href} variant="standalone" className="ow-header02__panel-link" onClick={closePhone}>
                                        {feature.icon}
                                        {feature.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : null}
                {menus.map((menu) => (
                    <Fragment key={menu.label}>
                        <Text variant="overline" as="p" className="ow-header02__panel-label">
                            {menu.label}
                        </Text>
                        <ul className="ow-header02__panel-list ow-header02__panel-list--columns">
                            {menu.groups.flat().map((entry) => (
                                <li key={entry.label}>
                                    <Link href={entry.href} variant="standalone" className="ow-header02__panel-link" onClick={closePhone}>
                                        {entry.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Fragment>
                ))}
                {links.length ? (
                    <ul className="ow-header02__panel-list ow-header02__panel-list--ruled">
                        {links.map((link, index) => (
                            <li key={index}>
                                <Link
                                    href={link.href}
                                    variant="standalone"
                                    className="ow-header02__panel-link"
                                    aria-current={link.current ? "page" : undefined}
                                    onClick={closePhone}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : null}
                {secondaryLink ? (
                    <a href={secondaryLink.href} className={buttonClassName({ shape: "pill", fullWidth: true })} onClick={closePhone}>
                        {secondaryLink.label}
                    </a>
                ) : null}
            </nav>
        </header>
    );
}
