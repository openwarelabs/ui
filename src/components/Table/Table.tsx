import { useMemo, type Key, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Checkbox } from "../Checkbox/Checkbox";
import type { TableProps, TableSort } from "./Table.types";

export type { TableColumn, TableProps, TableSort } from "./Table.types";

function compare(a: string | number, b: string | number) {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** Rows of records with sortable columns and optional selection: on a raised panel in a tray, or in a bordered card. */
export function Table<Row extends object>({
    columns,
    rows,
    rowKey = "id" as keyof Row,
    caption,
    hideCaption = false,
    sort,
    defaultSort,
    onSortChange,
    manualSort = false,
    selectionMode = "none",
    selectedKeys,
    defaultSelectedKeys = [],
    onSelectionChange,
    rowLabel,
    emptyContent = "Nothing here yet.",
    variant = "inset",
    density = "comfortable",
    stickyHeader = false,
    maxHeight,
    className,
}: TableProps<Row>) {
    const [currentSort, setSort] = useControllableState<TableSort | undefined>(sort, defaultSort, onSortChange as (sort: TableSort | undefined) => void);
    const [selected, setSelected] = useControllableState(selectedKeys, defaultSelectedKeys, onSelectionChange);
    const keyOf = (row: Row): Key => (typeof rowKey === "function" ? rowKey(row) : (row[rowKey] as Key));
    const labelOf = (row: Row, index: number): string => {
        if (rowLabel) return rowLabel(row);
        const first = columns[0] ? (row as Record<string, unknown>)[columns[0].key] : undefined;
        return typeof first === "string" || typeof first === "number" ? String(first) : `row ${index + 1}`;
    };
    const field = (row: Row, key: string) => (row as Record<string, unknown>)[key];

    const sorted = useMemo(() => {
        if (!currentSort || manualSort) return rows;
        const column = columns.find((c) => c.key === currentSort.key);
        if (!column) return rows;
        const value = (row: Row) => (column.sortValue ? column.sortValue(row) : (field(row, column.key) as string | number));
        const result = [...rows].sort((a, b) => compare(value(a), value(b)));
        return currentSort.direction === "descending" ? result.reverse() : result;
    }, [rows, columns, currentSort, manualSort]);

    const allKeys = sorted.map(keyOf);
    const selectedCount = allKeys.filter((key) => selected.includes(key)).length;

    function toggleSort(key: string) {
        setSort(
            currentSort?.key === key
                ? { key, direction: currentSort.direction === "ascending" ? "descending" : "ascending" }
                : { key, direction: "ascending" },
        );
    }

    const selectable = selectionMode === "multiple";

    return (
        <div
            className={cx("ow-table-wrap", `ow-table-wrap--${variant}`, stickyHeader && "ow-table-wrap--sticky", className)}
            style={maxHeight ? { maxHeight } : undefined}
            tabIndex={maxHeight ? 0 : undefined}
        >
            <table className={cx("ow-table", `ow-table--${density}`)}>
                {caption ? <caption className={cx("ow-table__caption", hideCaption && "ow-visually-hidden")}>{caption}</caption> : null}
                <thead>
                    <tr>
                        {selectable ? (
                            <th className="ow-table__select" scope="col">
                                <Checkbox
                                    size="sm"
                                    aria-label="Select all rows"
                                    checked={sorted.length > 0 && selectedCount === sorted.length}
                                    indeterminate={selectedCount > 0 && selectedCount < sorted.length}
                                    onChange={(event) =>
                                        setSelected(
                                            event.target.checked
                                                ? [...new Set([...selected, ...allKeys])]
                                                : selected.filter((key) => !allKeys.includes(key)),
                                        )
                                    }
                                />
                            </th>
                        ) : null}
                        {columns.map((column) => {
                            const direction = currentSort?.key === column.key ? currentSort.direction : undefined;
                            return (
                                <th
                                    key={column.key}
                                    scope="col"
                                    aria-sort={direction ?? (column.sortable ? "none" : undefined)}
                                    className={cx(`ow-table__cell--${column.align ?? "start"}`)}
                                    style={column.width !== undefined ? { width: column.width } : undefined}
                                >
                                    {column.sortable ? (
                                        <button type="button" className="ow-table__sort" onClick={() => toggleSort(column.key)}>
                                            {column.header}
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
                                        column.header
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {sorted.length === 0 ? (
                        <tr>
                            <td className="ow-table__empty" colSpan={columns.length + (selectable ? 1 : 0)}>
                                {emptyContent}
                            </td>
                        </tr>
                    ) : (
                        sorted.map((row, index) => {
                            const key = keyOf(row);
                            const isSelected = selected.includes(key);
                            return (
                                <tr key={key} className={cx(isSelected && "ow-table__row--selected")}>
                                    {selectable ? (
                                        <td className="ow-table__select">
                                            <Checkbox
                                                size="sm"
                                                aria-label={`Select ${labelOf(row, index)}`}
                                                checked={isSelected}
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked ? [...selected, key] : selected.filter((k) => k !== key),
                                                    )
                                                }
                                            />
                                        </td>
                                    ) : null}
                                    {columns.map((column) => (
                                        <td key={column.key} className={cx(`ow-table__cell--${column.align ?? "start"}`)}>
                                            {column.render ? column.render(row) : (field(row, column.key) as ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
