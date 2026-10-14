import { useId, useState } from "react";

import { Avatar, AvatarGroup, Badge, Button, Card, cx, EmptyState, Menu, SearchField, Text } from "@openwarelabs/ui";

import { BlockMenuItems } from "@blocks/shared/BlockMenuItems";
import { EllipsisIcon, SearchXIcon, StarIcon } from "@blocks/shared/icons";
import type { List04Props } from "./List04.types";

/** A grid of cards, each with a tile, a name, a line about it, its status and its people, and a menu of actions. A search field narrows them. */
export function List04({ title, count, description, primaryAction, items, searchable = true, emptyIcon, labels = {}, className, ...props }: List04Props) {
    const id = useId();
    const [query, setQuery] = useState("");

    const text = query.trim().toLowerCase();
    const shown = items.filter((item) => {
        const words = item.searchText ?? [item.title, ...(typeof item.description === "string" ? [item.description] : [])];
        return !text || words.some((word) => word.toLowerCase().includes(text));
    });
    const searchLabel = labels.search ?? "Search";

    return (
        <section className={cx("ow-list04", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-list04__inner">
                <div className="ow-list04__header">
                    <div>
                        <Text as="h2" variant="heading" id={`${id}-title`}>
                            {title}
                            {count !== undefined ? (
                                <Text as="span" variant="heading" tone="muted" className="ow-list04__count">
                                    {count}
                                </Text>
                            ) : null}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-list04__lead">
                                {description}
                            </Text>
                        ) : null}
                    </div>
                    {searchable || primaryAction ? (
                        <div className="ow-list04__tools">
                            {searchable ? (
                                <SearchField
                                    className="ow-list04__search"
                                    size="sm"
                                    placeholder={searchLabel}
                                    aria-label={searchLabel}
                                    value={query}
                                    onChange={setQuery}
                                />
                            ) : null}
                            {primaryAction ? (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    startIcon={primaryAction.icon}
                                    loading={primaryAction.loading}
                                    disabled={primaryAction.disabled}
                                    onClick={primaryAction.onClick}
                                >
                                    {primaryAction.label}
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {shown.length ? (
                    <ul className="ow-list04__grid">
                        {shown.map((item) => (
                            <li key={item.id}>
                                <Card padding="none" role="article" className="ow-list04__card" aria-labelledby={`${id}-${item.id}`}>
                                    <div className="ow-list04__top">
                                        {item.icon ? (
                                            <span className="ow-list04__tile" aria-hidden="true">
                                                {item.icon}
                                            </span>
                                        ) : null}
                                        <div className="ow-list04__names">
                                            <Text as="h3" variant="card-title" id={`${id}-${item.id}`} className="ow-list04__name">
                                                <span className="ow-list04__name-text">{item.title}</span>
                                                {item.pinned ? (
                                                    <span className="ow-list04__star" role="img" aria-label={labels.pinned ?? "Pinned"}>
                                                        <StarIcon size={13} />
                                                    </span>
                                                ) : null}
                                            </Text>
                                            {item.subtitle !== undefined ? (
                                                <Text as="span" variant="code" tone="muted" truncate className="ow-list04__repo">
                                                    {item.subtitle}
                                                </Text>
                                            ) : null}
                                        </div>
                                        {item.menu?.length ? (
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
                                        ) : null}
                                    </div>

                                    {item.description ? (
                                        <Text variant="copy" tone="soft" className="ow-list04__description">
                                            {item.description}
                                        </Text>
                                    ) : null}

                                    <div className="ow-list04__foot">
                                        {item.status ? (
                                            <Badge size="sm" variant={item.status.tone ?? "neutral"}>
                                                {item.status.label}
                                            </Badge>
                                        ) : null}
                                        <Text variant="caption" truncate className="ow-list04__when">
                                            {item.meta}
                                        </Text>
                                        {item.members?.length ? (
                                            <AvatarGroup
                                                size="sm"
                                                max={3}
                                                label={labels.members?.(item.members.length, item.title) ?? `${item.members.length} people on ${item.title}`}
                                            >
                                                {item.members.map((name) => (
                                                    <Avatar key={name} name={name} label={name} />
                                                ))}
                                            </AvatarGroup>
                                        ) : null}
                                    </div>
                                </Card>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState
                        bordered
                        icon={emptyIcon ?? <SearchXIcon size={20} />}
                        title={items.length ? (labels.emptyTitle ?? "Nothing matches") : (labels.noItemsTitle ?? "Nothing here yet")}
                        description={
                            items.length
                                ? (labels.emptyDescription?.(query.trim()) ?? `Nothing is called “${query.trim()}”, and no description mentions it.`)
                                : labels.noItemsDescription
                        }
                        actions={items.length ? <Button onClick={() => setQuery("")}>{labels.clearSearch ?? "Clear search"}</Button> : undefined}
                    />
                )}
            </div>
        </section>
    );
}
