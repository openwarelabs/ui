import { useId } from "react";

import { Badge, Button, Card, cx, Menu, Text } from "@openwarelabs/ui";

import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { EllipsisIcon } from "@blocks/shared/icons";
import type { List03Props } from "./List03.types";

/** Rows of a title, one line of detail and a status, each with its actions in a menu at its end. On phones the status moves under the detail. */
export function List03({ title, description, primaryAction, items, footnote, labels = {}, className, ...props }: List03Props) {
    const id = useId();
    return (
        <section className={cx("ow-list03", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-list03__inner">
                <div className="ow-list03__header">
                    <div>
                        <Text as="h2" variant="heading" id={`${id}-title`}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-list03__lead">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    {primaryAction ? (
                        <Button
                            variant="primary"
                            startIcon={primaryAction.icon}
                            loading={primaryAction.loading}
                            disabled={primaryAction.disabled}
                            onClick={primaryAction.onClick}
                        >
                            {primaryAction.label}
                        </Button>
                    ) : null}
                </div>

                <Card padding="none" className="ow-list03__card">
                    <ul className="ow-list03__list">
                        {items.map((item) => (
                            <li key={item.id} className="ow-list03__row" data-inactive={item.inactive || undefined}>
                                {item.icon ? (
                                    <span className="ow-list03__icon" aria-hidden="true">
                                        {item.icon}
                                    </span>
                                ) : null}
                                <span className="ow-list03__text">
                                    <span className="ow-list03__name-row">
                                        <Text as="span" variant="label" tone={item.inactive ? "muted" : undefined} truncate>
                                            {item.title}
                                        </Text>
                                        {item.code !== undefined ? (
                                            <Text as="span" variant="code" tone="muted" className="ow-list03__key">
                                                {item.code}
                                            </Text>
                                        ) : null}
                                    </span>
                                    {item.detail !== undefined ? (
                                        <Text variant="caption" className="ow-list03__detail">
                                            {item.detail}
                                        </Text>
                                    ) : null}
                                </span>
                                {item.status ? (
                                    <span className="ow-list03__status">
                                        <Badge size="sm" variant={item.status.tone ?? "neutral"}>
                                            {item.status.label}
                                        </Badge>
                                    </span>
                                ) : null}
                                {item.menu?.length ? (
                                    <span className="ow-list03__menu">
                                        <Menu
                                            label={labels.menu?.(item.title) ?? `${item.title} actions`}
                                            align="end"
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    iconOnly
                                                    aria-label={labels.actions?.(item.title) ?? `Actions for ${item.title}`}
                                                >
                                                    <EllipsisIcon size={16} />
                                                </Button>
                                            }
                                        >
                                            <BlockMenuItems items={item.menu} />
                                        </Menu>
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </Card>

                {footnote ? (
                    <Text as="p" variant="caption">
                        {footnote}
                    </Text>
                ) : null}
            </div>
        </section>
    );
}
