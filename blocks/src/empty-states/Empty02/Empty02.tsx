import { Fragment, useState } from "react";

import { Button, cx, EmptyState, Menu, MenuItem, MenuLabel, MenuSeparator, SearchField, Table, Tag, TagGroup, Text } from "@openwarelabs/ui";

import { ListFilterIcon, SearchXIcon } from "@blocks/shared/icons";
import type { Empty02Props } from "./Empty02.types";

/** A searchable, filterable table that says what was looked for when nothing matches, with the ways back. */
export function Empty02<Row extends object>({
    title,
    description,
    columns,
    rows,
    rowKey,
    searchText,
    filters = [],
    defaultQuery = "",
    defaultFilters = {},
    onQueryChange,
    onFiltersChange,
    emptyTitle,
    emptyDescription,
    labels = {},
    className,
    ...props
}: Empty02Props<Row>) {
    const [query, setQuery] = useState(defaultQuery);
    const [active, setActive] = useState<Record<string, string>>(defaultFilters);

    const changeQuery = (value: string) => {
        setQuery(value);
        onQueryChange?.(value);
    };
    const changeFilters = (next: Record<string, string>) => {
        setActive(next);
        onFiltersChange?.(next);
    };
    const setFilter = (key: string, value: string) => changeFilters({ ...active, [key]: value });
    const removeFilter = (key: string) => {
        const { [key]: _removed, ...rest } = active;
        changeFilters(rest);
    };

    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const on = filters.filter((filter) => active[filter.key] !== undefined);
    const shown = rows.filter(
        (row) => on.every((filter) => filter.value(row) === active[filter.key]) && words.every((word) => searchText(row).toLowerCase().includes(word)),
    );
    const filtered = on.length > 0;
    const searched = query.trim();
    const search = { query: searched, filters: Object.fromEntries(on.map((filter) => [filter.key, active[filter.key]!])) };

    const fallbackDescription =
        searched && filtered
            ? "Try other words, or clear the filters to look wider."
            : searched
              ? "Try fewer or different words."
              : "Clear the filters to see them all.";

    return (
        <div className={cx("ow-empty02", className)} {...props}>
            <main className="ow-empty02__panel">
                <Text variant="heading" as="h2">
                    {title}
                </Text>
                {description ? (
                    <Text variant="copy" className="ow-empty02__subtitle">
                        {description}
                    </Text>
                ) : null}

                <div className="ow-empty02__toolbar">
                    <div className="ow-empty02__search">
                        <SearchField
                            size="sm"
                            aria-label={labels.search ?? "Search"}
                            placeholder={labels.search ?? "Search"}
                            value={query}
                            onChange={changeQuery}
                        />
                    </div>
                    <TagGroup label={labels.filters ?? "Filters"}>
                        {on.map((filter) => (
                            <Tag
                                key={filter.key}
                                variant="active"
                                onRemove={() => removeFilter(filter.key)}
                                removeLabel={
                                    labels.removeFilter
                                        ? labels.removeFilter(filter.label, active[filter.key]!)
                                        : `${filter.label.toLowerCase()} filter: ${active[filter.key]}`
                                }
                            >
                                {`${filter.label}: `}
                                {active[filter.key]}
                            </Tag>
                        ))}
                        {filters.length ? (
                            <Menu
                                label={labels.filterMenu ?? "Add a filter"}
                                trigger={
                                    <Button size="sm" variant="ghost" startIcon={<ListFilterIcon size={16} />}>
                                        {filtered ? (labels.filter ?? "Filter") : (labels.addFilter ?? "Add filter")}
                                    </Button>
                                }
                            >
                                {filters.map((filter, index) => (
                                    <Fragment key={filter.key}>
                                        {index > 0 ? <MenuSeparator /> : null}
                                        <MenuLabel>{filter.label}</MenuLabel>
                                        {filter.options.map((value) => (
                                            <MenuItem key={value} onSelect={() => setFilter(filter.key, value)}>
                                                {value}
                                            </MenuItem>
                                        ))}
                                    </Fragment>
                                ))}
                            </Menu>
                        ) : null}
                    </TagGroup>
                    <Text variant="caption" className="ow-empty02__count" aria-live="polite">
                        {labels.count ? labels.count(shown.length, rows.length) : `${shown.length} of ${rows.length}`}
                    </Text>
                </div>

                <Table
                    className="ow-empty02__table"
                    caption={title}
                    hideCaption
                    columns={columns}
                    rows={shown}
                    rowKey={rowKey}
                    emptyContent={
                        <EmptyState
                            icon={<SearchXIcon size={20} />}
                            title={emptyTitle ? emptyTitle(search) : searched ? `No results match “${searched}”` : "No results match these filters"}
                            description={emptyDescription ? emptyDescription(search) : fallbackDescription}
                            actions={
                                <>
                                    {searched ? (
                                        <Button variant={filtered ? "secondary" : "primary"} onClick={() => changeQuery("")}>
                                            {labels.clearSearch ?? "Clear search"}
                                        </Button>
                                    ) : null}
                                    {filtered ? (
                                        <Button variant="primary" onClick={() => changeFilters({})}>
                                            {labels.clearFilters ?? "Clear filters"}
                                        </Button>
                                    ) : null}
                                </>
                            }
                        />
                    }
                />
            </main>
        </div>
    );
}
