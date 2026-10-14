import { useState } from "react";

import { Avatar, Badge, Button, cx, EmptyState, Menu, MenuItem, SearchField, Tag, Text, VisuallyHidden } from "@openwarelabs/ui";

import { CheckIcon, ChevronDownIcon, MessageSquareIcon, SearchXIcon } from "@blocks/shared/icons";
import type { PageHeading03Filter, PageHeading03Props } from "./PageHeading03.types";

/**
 * A page title over a search field and filter menus. The filters in use show as tags above the list they narrow,
 * with a count, and a list that matches nothing says so and offers to clear them.
 */
export function PageHeading03({
    title,
    description,
    primaryAction,
    facets,
    items,
    defaultFilters = [],
    onFiltersChange,
    emptyIcon,
    labels = {},
    className,
    ...props
}: PageHeading03Props) {
    const [query, setQuery] = useState("");
    const [filters, setFiltersState] = useState<PageHeading03Filter[]>(defaultFilters);

    const setFilters = (next: PageHeading03Filter[]) => {
        setFiltersState(next);
        onFiltersChange?.(next);
    };
    const isOn = (facet: string, value: string) => filters.some((filter) => filter.facet === facet && filter.value === value);
    const toggle = (facet: string, value: string) =>
        setFilters(isOn(facet, value) ? filters.filter((filter) => !(filter.facet === facet && filter.value === value)) : [...filters, { facet, value }]);
    const clearAll = () => {
        setFilters([]);
        setQuery("");
    };

    // Choices in the same menu widen the list (any of them); different menus narrow it (all of them).
    const text = query.trim().toLowerCase();
    const shown = items.filter((item) => {
        const words = item.searchText ?? (typeof item.title === "string" ? [item.title] : []);
        const matchesText = !text || words.some((field) => field.toLowerCase().includes(text));
        const matchesFilters = facets.every((facet) => {
            const chosen = filters.filter((filter) => filter.facet === facet.id).map((filter) => filter.value);
            return chosen.length === 0 || chosen.includes(item.facets[facet.id] ?? "");
        });
        return matchesText && matchesFilters;
    });

    return (
        <div className={cx("ow-page-heading03", className)} {...props}>
            <div className="ow-page-heading03__panel">
                <div className="ow-page-heading03__top">
                    <div className="ow-page-heading03__header">
                        <div>
                            <Text as="h1" variant="heading">
                                {title}
                            </Text>
                            {description ? (
                                <Text variant="copy" className="ow-page-heading03__lead">
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

                    <div className="ow-page-heading03__toolbar">
                        <SearchField
                            className="ow-page-heading03__search"
                            size="sm"
                            placeholder={labels.searchPlaceholder ?? "Search"}
                            aria-label={labels.search ?? "Search"}
                            value={query}
                            onChange={setQuery}
                        />
                        {facets.map((facet) => {
                            const count = filters.filter((filter) => filter.facet === facet.id).length;
                            return (
                                <Menu
                                    key={facet.id}
                                    label={facet.label}
                                    trigger={
                                        <Button size="sm" endIcon={<ChevronDownIcon size={14} />}>
                                            {facet.label}
                                            {count ? ` · ${count}` : ""}
                                        </Button>
                                    }
                                >
                                    {facet.options.map((option) => (
                                        <MenuItem
                                            key={option}
                                            role="menuitemcheckbox"
                                            aria-checked={isOn(facet.id, option)}
                                            icon={isOn(facet.id, option) ? <CheckIcon size={15} /> : <span className="ow-page-heading03__menu-spacer" />}
                                            onClick={(event) => {
                                                // Keep the menu open, so several choices can be ticked in a row.
                                                event.preventDefault();
                                                toggle(facet.id, option);
                                            }}
                                        >
                                            {option}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            );
                        })}
                    </div>

                    <div className="ow-page-heading03__applied">
                        {filters.map((filter) => {
                            const facet = facets.find((entry) => entry.id === filter.facet);
                            const facetLabel = facet?.label ?? filter.facet;
                            return (
                                <Tag
                                    key={`${filter.facet}-${filter.value}`}
                                    variant="active"
                                    removeLabel={labels.removeFilter?.(facetLabel, filter.value) ?? `${facetLabel} filter: ${filter.value}`}
                                    onRemove={() => toggle(filter.facet, filter.value)}
                                >
                                    <span className="ow-page-heading03__tag-key">{facetLabel}:</span> {filter.value}
                                </Tag>
                            );
                        })}
                        {filters.length ? (
                            <Button variant="ghost" size="sm" onClick={() => setFilters([])}>
                                {labels.clearFilters ?? "Clear filters"}
                            </Button>
                        ) : null}
                        <Text variant="caption" className="ow-page-heading03__count" aria-live="polite">
                            {labels.count ? (
                                labels.count(shown.length, items.length)
                            ) : (
                                <>
                                    {shown.length} of {items.length} shown
                                </>
                            )}
                        </Text>
                    </div>
                </div>

                {shown.length ? (
                    <ul className="ow-page-heading03__list" aria-label={labels.list ?? "Results"}>
                        {shown.map((item) => (
                            <li key={item.id} className="ow-page-heading03__row">
                                {item.icon ? (
                                    <span className="ow-page-heading03__agent" aria-hidden="true">
                                        {item.icon}
                                    </span>
                                ) : item.person ? (
                                    <Avatar name={item.person} />
                                ) : (
                                    <span />
                                )}
                                <span className="ow-page-heading03__row-text">
                                    <Text as="span" className="ow-page-heading03__row-line">
                                        {item.title}
                                    </Text>
                                    <Text variant="caption" className="ow-page-heading03__row-line">
                                        {item.reference !== undefined ? (
                                            <>
                                                <Text as="span" variant="code" className="ow-page-heading03__number">
                                                    {item.reference}
                                                </Text>{" "}
                                                {item.meta !== undefined ? "· " : null}
                                            </>
                                        ) : null}
                                        {item.meta}
                                    </Text>
                                </span>
                                {item.status ? (
                                    <Badge size="sm" variant={item.status.tone ?? "neutral"}>
                                        {item.status.label}
                                    </Badge>
                                ) : (
                                    <span />
                                )}
                                <Text variant="caption" className="ow-page-heading03__comments" data-none={item.comments ? undefined : ""}>
                                    <MessageSquareIcon size={14} />
                                    {item.comments ?? 0}
                                    <VisuallyHidden>{labels.comments ?? " comments"}</VisuallyHidden>
                                </Text>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="ow-page-heading03__empty">
                        <EmptyState
                            icon={emptyIcon ?? <SearchXIcon size={20} />}
                            title={labels.emptyTitle ?? "Nothing matches"}
                            description={labels.emptyDescription ?? "Try a different search, or take a filter off to see more."}
                            actions={<Button onClick={clearAll}>{labels.clearAll ?? "Clear search and filters"}</Button>}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
