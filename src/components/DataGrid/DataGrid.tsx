import {
    useMemo,
    useRef,
    useState,
    type FocusEvent,
    type Key,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from "react";

import { useControllableState } from "@/hooks/useControllableState";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "@/icons";
import { cx } from "@/utils/cx";
import { Checkbox } from "../Checkbox/Checkbox";
import { SearchField } from "../SearchField/SearchField";
import { useVirtualizer } from "../VirtualList/useVirtualizer";
import type { DataGridColumn, DataGridProps, DataGridResizeHandleProps, DataGridSort } from "./DataGrid.types";

export type { DataGridColumn, DataGridLabels, DataGridProps, DataGridSort } from "./DataGrid.types";

const defaultLabels = {
    rows: (shown: number, total: number) => (shown === total ? `${total} rows` : `${shown} of ${total} rows`),
    selected: (count: number) => `${count} selected`,
    search: "Search rows",
    filter: (column: string) => `Filter ${column}`,
    filterPlaceholder: "Filter",
    resize: (column: string) => `Resize ${column} column`,
    selectAll: "Select all rows",
    selectRow: (row: string) => `Select ${row}`,
};

const selectWidth = 40;
const rowHeights = { compact: 36, comfortable: 44 };
const noFilters: Record<string, string> = {};
const noWidths: Record<string, number> = {};

function compare(a: string | number, b: string | number) {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
const fieldOf = (row: object, key: string) => (row as Record<string, unknown>)[key];

/** The text a row is searched by in a column. */
function textOf<Row extends object>(row: Row, column: DataGridColumn<Row>) {
    if (column.filterValue) return column.filterValue(row);
    const value = fieldOf(row, column.key);
    return value == null ? "" : String(value);
}

/** The edge of a header cell: drag it, or focus it and use the arrow keys, to change the column's width. */
function ResizeHandle({ label, width, min, max, onResize, onReset }: DataGridResizeHandleProps) {
    const [active, setActive] = useState(false);

    function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        if (event.button !== 0) return;
        event.preventDefault();
        const handle = event.currentTarget;
        handle.focus({ preventScroll: true });
        handle.setPointerCapture(event.pointerId);
        const direction = getComputedStyle(handle).direction === "rtl" ? -1 : 1;
        const startX = event.clientX;
        const startWidth = width;
        setActive(true);
        document.documentElement.dataset.owDataGridResize = "";
        const move = (moved: PointerEvent) => onResize(clamp(Math.round(startWidth + (moved.clientX - startX) * direction), min, max));
        const stop = () => {
            setActive(false);
            delete document.documentElement.dataset.owDataGridResize;
            handle.removeEventListener("pointermove", move);
            handle.removeEventListener("pointerup", stop);
            handle.removeEventListener("pointercancel", stop);
        };
        handle.addEventListener("pointermove", move);
        handle.addEventListener("pointerup", stop);
        handle.addEventListener("pointercancel", stop);
    }

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const step = event.shiftKey ? 64 : 16;
        const grow = rtl ? "ArrowLeft" : "ArrowRight";
        const shrink = rtl ? "ArrowRight" : "ArrowLeft";
        let next: number;
        if (event.key === grow) next = width + step;
        else if (event.key === shrink) next = width - step;
        else if (event.key === "Home") next = min;
        else if (event.key === "End") next = max;
        else return;
        event.preventDefault();
        onResize(clamp(next, min, max));
    }

    return (
        <div
            className={cx("ow-data-grid__resize", active && "ow-data-grid__resize--active")}
            role="separator"
            aria-orientation="vertical"
            aria-label={label}
            aria-valuenow={width}
            aria-valuemin={min}
            aria-valuemax={max}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onKeyDown={onKeyDown}
            onDoubleClick={onReset}
            onClick={(event) => event.stopPropagation()}
        />
    );
}

/**
 * A table for many rows: sort by a column, search every column or filter each one, drag a column's edge to resize
 * it, and select rows with checkboxes. Only the rows in view are rendered, so ten thousand stay fast.
 */
export function DataGrid<Row extends object>({
    columns,
    rows,
    rowKey = "id" as keyof Row,
    label,
    sort,
    defaultSort,
    onSortChange,
    manualSort = false,
    searchable = false,
    search,
    defaultSearch = "",
    onSearchChange,
    filters,
    defaultFilters = noFilters,
    onFiltersChange,
    manualFilter = false,
    columnWidths,
    defaultColumnWidths = noWidths,
    onColumnWidthsChange,
    selectionMode = "none",
    selectedKeys,
    defaultSelectedKeys = [],
    onSelectionChange,
    rowLabel,
    height = 480,
    density = "comfortable",
    toolbar,
    emptyContent,
    labels: labelsProp,
    className,
}: DataGridProps<Row>) {
    const labels = { ...defaultLabels, ...labelsProp };
    const [currentSort, setSort] = useControllableState<DataGridSort | undefined>(sort, defaultSort, onSortChange as (sort: DataGridSort | undefined) => void);
    const [query, setQuery] = useControllableState(search, defaultSearch, onSearchChange);
    const [columnFilters, setFilters] = useControllableState(filters, defaultFilters, onFiltersChange);
    const [widths, setWidths] = useControllableState(columnWidths, defaultColumnWidths, onColumnWidthsChange);
    const [selected, setSelected] = useControllableState(selectedKeys, defaultSelectedKeys, onSelectionChange);
    const [focusedRow, setFocusedRow] = useState<number | null>(null);
    const anchor = useRef<number | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const keyOf = (row: Row): Key => (typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as Key));
    const nameOf = (column: DataGridColumn<Row>) => column.label ?? (typeof column.header === "string" ? column.header : column.key);
    const labelOf = (row: Row, index: number): string => {
        if (rowLabel) return rowLabel(row);
        const first = columns[0] ? fieldOf(row, columns[0].key) : undefined;
        return typeof first === "string" || typeof first === "number" ? String(first) : `row ${index + 1}`;
    };
    const widthOf = (column: DataGridColumn<Row>) =>
        clamp(widths[column.key] ?? column.width ?? 160, column.minWidth ?? 64, column.maxWidth ?? 800);

    const filtered = useMemo(() => {
        if (manualFilter) return rows;
        const words = fold(query.trim()).split(/\s+/).filter(Boolean);
        const active = columns.filter((column) => columnFilters[column.key]?.trim());
        if (!words.length && !active.length) return rows;
        return rows.filter((row) => {
            for (const column of active) {
                if (!fold(textOf(row, column)).includes(fold(columnFilters[column.key]!.trim()))) return false;
            }
            if (!words.length) return true;
            const text = fold(columns.map((column) => textOf(row, column)).join("\n"));
            return words.every((word) => text.includes(word));
        });
    }, [rows, columns, query, columnFilters, manualFilter]);

    const sorted = useMemo(() => {
        if (!currentSort || manualSort) return filtered;
        const column = columns.find((c) => c.key === currentSort.key);
        if (!column) return filtered;
        const value = (row: Row) => (column.sortValue ? column.sortValue(row) : (fieldOf(row, column.key) as string | number));
        const result = [...filtered].sort((a, b) => compare(value(a) ?? "", value(b) ?? ""));
        return currentSort.direction === "descending" ? result.reverse() : result;
    }, [filtered, columns, currentSort, manualSort]);

    const rowHeight = rowHeights[density];
    const { items, totalSize } = useVirtualizer({
        count: sorted.length,
        getScrollElement: () => scrollRef.current,
        itemSize: rowHeight,
        overscan: 6,
        keepMounted: focusedRow != null && focusedRow < sorted.length ? focusedRow : null,
    });

    const selectable = selectionMode === "multiple";
    const filterRow = columns.some((column) => column.filterable);
    const shownKeys = sorted.map(keyOf);
    const selectedSet = new Set(selected);
    const selectedShown = shownKeys.filter((key) => selectedSet.has(key)).length;
    const totalWidth = columns.reduce((sum, column) => sum + widthOf(column), selectable ? selectWidth : 0);
    const headerRows = filterRow ? 2 : 1;
    const colSpan = columns.length + (selectable ? 1 : 0);

    function toggleSort(key: string) {
        setSort(
            currentSort?.key === key
                ? { key, direction: currentSort.direction === "ascending" ? "descending" : "ascending" }
                : { key, direction: "ascending" },
        );
    }

    function toggleRow(index: number, checked: boolean, extend: boolean) {
        const from = extend && anchor.current != null ? Math.min(anchor.current, sorted.length - 1) : index;
        const range = shownKeys.slice(Math.min(from, index), Math.max(from, index) + 1);
        anchor.current = index;
        setSelected(checked ? [...new Set([...selected, ...range])] : selected.filter((key) => !range.includes(key)));
    }

    // The row holding focus stays rendered while it's scrolled out of view, so focus isn't lost.
    function onFocus(event: FocusEvent<HTMLTableSectionElement>) {
        const row = (event.target as HTMLElement).closest<HTMLElement>("[data-index]");
        setFocusedRow(row ? Number(row.dataset.index) : null);
    }

    const before = items.length ? items[0]!.start : 0;
    const after = items.length ? totalSize - items[items.length - 1]!.start - items[items.length - 1]!.size : 0;
    const status = labels.rows(sorted.length, rows.length) + (selectable && selected.length ? `, ${labels.selected(selected.length)}` : "");

    let body: ReactNode;
    if (sorted.length === 0) {
        body = (
            <tr>
                <td className="ow-table__empty" colSpan={colSpan}>
                    {emptyContent ?? (rows.length ? "No rows match." : "Nothing here yet.")}
                </td>
            </tr>
        );
    } else {
        body = (
            <>
                {before > 0 ? (
                    <tr aria-hidden="true" className="ow-data-grid__spacer">
                        <td colSpan={colSpan} style={{ height: before }} />
                    </tr>
                ) : null}
                {items.map(({ index }) => {
                    const row = sorted[index]!;
                    const key = shownKeys[index]!;
                    const isSelected = selectedSet.has(key);
                    return (
                        <tr
                            key={key}
                            data-index={index}
                            aria-rowindex={index + headerRows + 1}
                            className={cx(isSelected && "ow-table__row--selected")}
                        >
                            {selectable ? (
                                <td className="ow-table__select">
                                    <Checkbox
                                        size="sm"
                                        aria-label={labels.selectRow(labelOf(row, index))}
                                        checked={isSelected}
                                        onClick={(event: MouseEvent<HTMLInputElement>) => {
                                            toggleRow(index, event.currentTarget.checked, event.shiftKey);
                                        }}
                                        onChange={() => undefined}
                                    />
                                </td>
                            ) : null}
                            {columns.map((column) => (
                                <td key={column.key} className={cx(`ow-table__cell--${column.align ?? "start"}`)}>
                                    {column.render ? column.render(row) : (fieldOf(row, column.key) as ReactNode)}
                                </td>
                            ))}
                        </tr>
                    );
                })}
                {after > 0 ? (
                    <tr aria-hidden="true" className="ow-data-grid__spacer">
                        <td colSpan={colSpan} style={{ height: after }} />
                    </tr>
                ) : null}
            </>
        );
    }

    return (
        <div className={cx("ow-data-grid", className)}>
            {searchable || toolbar ? (
                <div className="ow-data-grid__toolbar">
                    {searchable ? (
                        <SearchField
                            className="ow-data-grid__search"
                            size="sm"
                            value={query}
                            onChange={setQuery}
                            aria-label={labels.search}
                            placeholder={labels.search}
                        />
                    ) : null}
                    <span className="ow-data-grid__status" role="status">
                        {status}
                    </span>
                    {toolbar ? <div className="ow-data-grid__actions">{toolbar}</div> : null}
                </div>
            ) : (
                <span className="ow-visually-hidden" role="status">
                    {status}
                </span>
            )}
            <div
                ref={scrollRef}
                className={cx("ow-table-wrap", "ow-table-wrap--plain", "ow-table-wrap--sticky", "ow-data-grid__scroll")}
                style={{ height }}
                tabIndex={0}
            >
                <table
                    className={cx("ow-table", `ow-table--${density}`, "ow-data-grid__table")}
                    style={{ width: totalWidth }}
                    aria-label={label}
                    aria-rowcount={sorted.length + headerRows}
                >
                    <colgroup>
                        {selectable ? <col style={{ width: selectWidth }} /> : null}
                        {columns.map((column) => (
                            <col key={column.key} style={{ width: widthOf(column) }} />
                        ))}
                    </colgroup>
                    <thead>
                        <tr aria-rowindex={1}>
                            {selectable ? (
                                <th className="ow-table__select" scope="col">
                                    <Checkbox
                                        size="sm"
                                        aria-label={labels.selectAll}
                                        checked={sorted.length > 0 && selectedShown === sorted.length}
                                        indeterminate={selectedShown > 0 && selectedShown < sorted.length}
                                        onChange={(event) => {
                                            anchor.current = null;
                                            setSelected(
                                                event.target.checked
                                                    ? [...new Set([...selected, ...shownKeys])]
                                                    : selected.filter((key) => !shownKeys.includes(key)),
                                            );
                                        }}
                                    />
                                </th>
                            ) : null}
                            {columns.map((column) => {
                                const direction = currentSort?.key === column.key ? currentSort.direction : undefined;
                                const name = nameOf(column);
                                return (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        aria-sort={direction ?? (column.sortable ? "none" : undefined)}
                                        className={cx("ow-data-grid__header", `ow-table__cell--${column.align ?? "start"}`)}
                                    >
                                        {column.sortable ? (
                                            <button type="button" className="ow-table__sort" onClick={() => toggleSort(column.key)}>
                                                <span className="ow-data-grid__header-text">{column.header}</span>
                                                <span className={cx("ow-table__sort-icon", direction && "ow-table__sort-icon--active")}>
                                                    {direction === "ascending" ? (
                                                        <ArrowUpIcon size={12} />
                                                    ) : direction === "descending" ? (
                                                        <ArrowDownIcon size={12} />
                                                    ) : (
                                                        <ChevronsUpDownIcon size={12} />
                                                    )}
                                                </span>
                                            </button>
                                        ) : (
                                            <span className="ow-data-grid__header-text">{column.header}</span>
                                        )}
                                        {column.resizable !== false ? (
                                            <ResizeHandle
                                                label={labels.resize(name)}
                                                width={widthOf(column)}
                                                min={column.minWidth ?? 64}
                                                max={column.maxWidth ?? 800}
                                                onResize={(width) => setWidths((previous) => ({ ...previous, [column.key]: width }))}
                                                onReset={() =>
                                                    setWidths((previous) => {
                                                        const { [column.key]: _, ...rest } = previous;
                                                        return rest;
                                                    })
                                                }
                                            />
                                        ) : null}
                                    </th>
                                );
                            })}
                        </tr>
                        {filterRow ? (
                            <tr aria-rowindex={2} className="ow-data-grid__filters">
                                {selectable ? <td className="ow-table__select" /> : null}
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.filterable ? (
                                            <SearchField
                                                size="sm"
                                                value={columnFilters[column.key] ?? ""}
                                                onChange={(text) => setFilters((previous) => ({ ...previous, [column.key]: text }))}
                                                aria-label={labels.filter(nameOf(column))}
                                                placeholder={labels.filterPlaceholder}
                                            />
                                        ) : null}
                                    </td>
                                ))}
                            </tr>
                        ) : null}
                    </thead>
                    <tbody onFocus={onFocus} style={{ ["--ow-data-grid-row" as string]: `${rowHeight}px` }}>
                        {body}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
