import { useId, useState } from "react";

import { Button, Card, cx, EmptyState, Pagination, SearchField, Select, Table, Text, type TableSort } from "@openwarelabs/ui";

import { SearchXIcon } from "@blocks/shared/icons";
import { hiddenColumns } from "@blocks/shared/tableColumns";
import type { List01Props } from "./List01.types";

function compare(a: unknown, b: unknown) {
    return typeof a === "number" && typeof b === "number" ? a - b : String(a ?? "").localeCompare(String(b ?? ""), "en", { sensitivity: "base" });
}

/**
 * A section title with its primary action, then one card: a search field and filters, a sortable table, and the
 * pages. Any change to what's shown starts again from the first page.
 */
export function List01<Row extends object>({
    title,
    description,
    primaryAction,
    columns,
    rows,
    rowKey,
    searchText,
    filters = [],
    defaultSort,
    pageSize = 8,
    emptyIcon,
    labels = {},
    className,
    ...props
}: List01Props<Row>) {
    const id = useId();
    const [query, setQuery] = useState("");
    const [chosen, setChosen] = useState<Record<string, string>>({});
    const [sort, setSort] = useState<TableSort | undefined>(defaultSort);
    const [page, setPage] = useState(1);

    const text = query.trim().toLowerCase();
    const matching = rows.filter(
        (row) =>
            filters.every((filter) => (chosen[filter.id] ?? "all") === "all" || filter.value(row) === chosen[filter.id]) &&
            (!text || !searchText || searchText(row).some((field) => field.toLowerCase().includes(text))),
    );

    // The table only shows arrows (manualSort): sorting happens here, before the rows are split into pages.
    const sorted = [...matching];
    if (sort) {
        const column = columns.find((entry) => entry.key === sort.key);
        const valueOf = (row: Row) => (column?.sortValue ? column.sortValue(row) : (row as Record<string, unknown>)[sort.key]);
        sorted.sort((a, b) => compare(valueOf(a), valueOf(b)));
        if (sort.direction === "descending") sorted.reverse();
    }

    const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
    const current = Math.min(page, pageCount);
    const shown = sorted.slice((current - 1) * pageSize, current * pageSize);
    const first = sorted.length ? (current - 1) * pageSize + 1 : 0;

    const clear = () => {
        setQuery("");
        setChosen({});
        setPage(1);
    };

    const caption = labels.caption ?? (typeof title === "string" ? title : "Rows");

    return (
        <section className={cx("ow-list01", className)} aria-labelledby={`${id}-title`} {...props}>
            <div className="ow-list01__inner">
                <div className="ow-list01__header">
                    <div>
                        <Text as="h2" variant="heading" id={`${id}-title`}>
                            {title}
                        </Text>
                        {description ? (
                            <Text variant="copy" className="ow-list01__lead">
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

                <Card padding="none" className="ow-list01__card" {...hiddenColumns(columns)}>
                    <div className="ow-list01__toolbar">
                        {searchText ? (
                            <SearchField
                                className="ow-list01__search"
                                size="sm"
                                placeholder={labels.searchPlaceholder ?? "Search"}
                                aria-label={labels.search ?? "Search"}
                                value={query}
                                onChange={(value) => {
                                    setQuery(value);
                                    setPage(1);
                                }}
                            />
                        ) : null}
                        {filters.map((filter) => (
                            <Select
                                key={filter.id}
                                className="ow-list01__select"
                                size="sm"
                                aria-label={filter.label}
                                value={chosen[filter.id] ?? "all"}
                                onChange={(value) => {
                                    setChosen((current) => ({ ...current, [filter.id]: value }));
                                    setPage(1);
                                }}
                                options={[{ value: "all", label: filter.allLabel }, ...filter.options]}
                            />
                        ))}
                        <Text variant="caption" className="ow-list01__count" aria-live="polite">
                            {labels.count
                                ? labels.count(matching.length, rows.length)
                                : matching.length === rows.length
                                  ? `${rows.length} rows`
                                  : `${matching.length} of ${rows.length} rows`}
                        </Text>
                    </div>

                    <Table
                        variant="plain"
                        caption={caption}
                        hideCaption
                        columns={columns}
                        rows={shown}
                        rowKey={rowKey}
                        sort={sort}
                        onSortChange={(next) => {
                            setSort(next);
                            setPage(1);
                        }}
                        manualSort
                        emptyContent={
                            <EmptyState
                                className="ow-list01__empty"
                                icon={emptyIcon ?? <SearchXIcon size={20} />}
                                title={labels.emptyTitle ?? "Nothing matches"}
                                description={
                                    labels.emptyDescription?.(query.trim()) ??
                                    (text ? `Nothing matches “${query.trim()}” with these filters.` : "Nothing matches these filters.")
                                }
                                actions={<Button onClick={clear}>{labels.clearAll ?? "Clear search and filters"}</Button>}
                            />
                        }
                    />

                    {sorted.length ? (
                        <div className="ow-list01__footer">
                            <Text variant="caption" className="ow-list01__range">
                                {first}–{first + shown.length - 1} of {sorted.length}
                            </Text>
                            {pageCount > 1 ? (
                                <Pagination size="sm" page={current} pageCount={pageCount} onPageChange={setPage} label={labels.pages ?? "Pages"} />
                            ) : null}
                        </div>
                    ) : null}
                </Card>
            </div>
        </section>
    );
}
