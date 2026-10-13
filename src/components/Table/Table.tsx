import { useMemo, type Key, type ReactNode } from "react";

import { useControllableState } from "../../hooks/useControllableState";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "../../icons";
import { cx } from "../../utils/cx";
import { Checkbox } from "../Checkbox/Checkbox";

export interface TableColumn<Row> {
    /** Unique; also the row field shown when there's no `render`. */
    key: string;
    header: ReactNode;
    /** Numbers and amounts go at the end, so their digits line up.
     * @default "start" */
    align?: "start" | "center" | "end";
    /** A CSS width, e.g. 120 or "30%". */
    width?: number | string;
    /** Lets the person sort by this column. */
    sortable?: boolean;
    /** What the cell shows. Defaults to the row's field named by `key`. */
    render?(row: Row): ReactNode;
    /** The value sorted by, when it isn't the field itself. */
    sortValue?(row: Row): string | number;
}

export interface TableSort {
    key: string;
    direction: "ascending" | "descending";
}

export interface TableProps<Row> {
    columns: Array<TableColumn<Row>>;
    rows: Row[];
    /** A field name or function giving each row a unique key.
     * @default "id" */
    rowKey?: keyof Row | ((row: Row) => Key);
    /** Describes the table for screen readers; shown above it unless `hideCaption`. */
    caption?: ReactNode;
    /** @default false */
    hideCaption?: boolean;
    sort?: TableSort;
    defaultSort?: TableSort;
    onSortChange?(sort: TableSort): void;
    /** Sort the rows yourself (e.g. on a server) and only show the arrows.
     * @default false */
    manualSort?: boolean;
    /** Adds a checkbox column.
     * @default "none" */
    selectionMode?: "none" | "multiple";
    selectedKeys?: Key[];
    defaultSelectedKeys?: Key[];
    onSelectionChange?(keys: Key[]): void;
    /**
     * Names a row for its checkbox, read out as "Select …": the person, the file, the project. Defaults to the
     * first column's value when it's text or a number, else "row 3".
     */
    rowLabel?(row: Row): string;
    /** Shown in place of the rows when there are none, such as an EmptyState. */
    emptyContent?: ReactNode;
    /** `compact` rows are 36px; `comfortable` 44px.
     * @default "comfortable" */
    density?: "compact" | "comfortable";
    /** Keeps the header in view while the table scrolls; use with maxHeight. */
    stickyHeader?: boolean;
    maxHeight?: number | string;
    className?: string;
}

function compare(a: string | number, b: string | number) {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/** Rows of records with sortable columns and optional selection, in a bordered card. */
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
            className={cx("ow-table-wrap", stickyHeader && "ow-table-wrap--sticky", className)}
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
